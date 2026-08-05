import { db } from '$lib/server/db/index.js';
import { terminologyMaster } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';

/**
 * Get or create a terminology_master record safely.
 * Returns existing record ID if found.
 * If insert fails (e.g. due to unique constraint or concurrent insert), catches error and re-queries.
 *
 * @param {string} code - The terminology code
 * @param {string} display - The human-readable display name
 * @param {string} system - The terminology system ('SNOMED' | 'ICD-10' | 'ICD-9-CM' | 'KFA')
 * @returns {Promise<string|null>} The UUID of the terminology_master record
 */
export async function getOrCreateTerminology(code, display, system) {
	if (!code || !display) return null;

	const codeStr = String(code).trim();
	const displayStr = String(display).trim();
	const sysStr = String(system || 'SNOMED').trim();

	try {
		// 1. Try to find existing record first (fast path)
		const [existing] = await db.select()
			.from(terminologyMaster)
			.where(and(
				eq(terminologyMaster.code, codeStr),
				eq(terminologyMaster.system, sysStr)
			))
			.limit(1);

		if (existing) {
			return existing.id;
		}

		// 2. Not found — try to insert new record
		const [inserted] = await db.insert(terminologyMaster).values({
			code: codeStr,
			display: displayStr,
			system: sysStr
		}).returning();

		if (inserted?.id) {
			return inserted.id;
		}
	} catch (err) {
		console.warn(`[getOrCreateTerminology] Insert error for ${sysStr}:${codeStr}, attempting fallback lookup:`, err?.message || err);
	}

	// 3. Fallback: query database again if insert threw an exception
	try {
		const [fallback] = await db.select()
			.from(terminologyMaster)
			.where(and(
				eq(terminologyMaster.code, codeStr),
				eq(terminologyMaster.system, sysStr)
			))
			.limit(1);

		return fallback?.id || null;
	} catch (err) {
		console.error(`[getOrCreateTerminology] Fallback lookup failed for ${sysStr}:${codeStr}:`, err);
		return null;
	}
}

