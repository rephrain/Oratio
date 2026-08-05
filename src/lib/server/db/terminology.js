import { db } from '$lib/server/db/index.js';
import { terminologyMaster } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';

/**
 * Get or create a terminology_master record.
 * Uses INSERT ... ON CONFLICT DO NOTHING to avoid unique constraint violations
 * when concurrent requests try to insert the same (system, code) pair.
 *
 * @param {string} code - The terminology code (e.g. SNOMED code, ICD-10 code, KFA code)
 * @param {string} display - The human-readable display name
 * @param {string} system - The terminology system ('SNOMED' | 'ICD-10' | 'ICD-9-CM' | 'KFA')
 * @returns {Promise<string>} The UUID of the terminology_master record
 */
export async function getOrCreateTerminology(code, display, system) {
	// 1. Try to find existing record first (fast path for most cases)
	const [existing] = await db.select()
		.from(terminologyMaster)
		.where(and(
			eq(terminologyMaster.code, code),
			eq(terminologyMaster.system, system)
		))
		.limit(1);

	if (existing) {
		return existing.id;
	}

	// 2. Not found — try to insert with ON CONFLICT DO NOTHING
	//    This handles the race condition where another request inserted
	//    the same (system, code) between our SELECT and INSERT.
	const [inserted] = await db.insert(terminologyMaster)
		.values({ code, display, system })
		.onConflictDoNothing({ target: [terminologyMaster.system, terminologyMaster.code] })
		.returning();

	if (inserted) {
		return inserted.id;
	}

	// 3. ON CONFLICT fired (another concurrent insert won the race) — re-fetch
	const [raced] = await db.select()
		.from(terminologyMaster)
		.where(and(
			eq(terminologyMaster.code, code),
			eq(terminologyMaster.system, system)
		))
		.limit(1);

	return raced.id;
}
