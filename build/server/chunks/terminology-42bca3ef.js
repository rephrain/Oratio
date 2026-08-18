import { d as db, t as terminologyMaster } from './index3-af609ec3.js';
import { and, eq } from 'drizzle-orm';

async function getOrCreateTerminology(code, display, system) {
  if (!code || !display)
    return null;
  const codeStr = String(code).trim();
  const displayStr = String(display).trim();
  const sysStr = String(system || "SNOMED").trim();
  try {
    const [existing] = await db.select().from(terminologyMaster).where(and(
      eq(terminologyMaster.code, codeStr),
      eq(terminologyMaster.system, sysStr)
    )).limit(1);
    if (existing) {
      return existing.id;
    }
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
  try {
    const [fallback] = await db.select().from(terminologyMaster).where(and(
      eq(terminologyMaster.code, codeStr),
      eq(terminologyMaster.system, sysStr)
    )).limit(1);
    return fallback?.id || null;
  } catch (err) {
    console.error(`[getOrCreateTerminology] Fallback lookup failed for ${sysStr}:${codeStr}:`, err);
    return null;
  }
}

export { getOrCreateTerminology as g };
//# sourceMappingURL=terminology-42bca3ef.js.map
