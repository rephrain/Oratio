import { j as json } from "../../../../chunks/index.js";
import { t as terminologyMaster, d as db } from "../../../../chunks/index3.js";
import { or, ilike, eq, and } from "drizzle-orm";
async function GET({ url }) {
  const term = url.searchParams.get("term") || "";
  const system = url.searchParams.get("system");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 50);
  if (!term || term.length < 2) {
    return json({ results: [] });
  }
  try {
    let conditions = [
      or(
        ilike(terminologyMaster.display, `%${term}%`),
        ilike(terminologyMaster.code, `%${term}%`)
      )
    ];
    if (system) {
      conditions.push(eq(terminologyMaster.system, system));
    }
    const results = await db.select().from(terminologyMaster).where(and(...conditions)).limit(limit);
    return json({
      results: results.map((r) => ({
        value: r.code,
        label: r.display,
        id: r.id
      }))
    });
  } catch (error) {
    console.error("Terminology search error:", error);
    return json({ error: "Search failed", results: [] }, { status: 500 });
  }
}
export {
  GET
};
