import { j as json } from './index-d7f43214.js';

const SNOWSTORM_BASE = process.env.SNOWSTORM_BASE_URL || "https://snowstorm.ihtsdotools.org/snowstorm/snomed-ct";
async function searchConcepts(term, ecl = "", limit = 20) {
  const params = new URLSearchParams({
    term,
    limit: String(limit),
    activeFilter: "true"
  });
  if (ecl)
    params.set("ecl", ecl);
  const res = await fetch(`${SNOWSTORM_BASE}/MAIN/concepts?${params}`, {
    headers: { "Accept-Language": "en" }
  });
  if (!res.ok)
    throw new Error(`Snowstorm search failed: ${res.status}`);
  const data = await res.json();
  return (data.items || []).map((item) => ({
    code: item.conceptId,
    display: item.fsn?.term || item.pt?.term || "",
    preferred: item.pt?.term || ""
  }));
}
async function searchDiseaseHistory(term) {
  return searchConcepts(term, "<< 404684003");
}
async function searchAllergySubstances(term) {
  return searchConcepts(term, "<< 105590001");
}
async function searchReasonCodes(term) {
  return searchConcepts(term, "<< 404684003");
}
async function GET({ url }) {
  const term = url.searchParams.get("term") || "";
  const ecl = url.searchParams.get("ecl") || "";
  const type = url.searchParams.get("type") || "general";
  const limit = parseInt(url.searchParams.get("limit") || "20");
  if (!term || term.length < 2) {
    return json({ results: [] });
  }
  try {
    let results;
    switch (type) {
      case "disease":
        results = await searchDiseaseHistory(term);
        break;
      case "allergy":
        results = await searchAllergySubstances(term);
        break;
      case "reason":
        results = await searchReasonCodes(term);
        break;
      default:
        results = await searchConcepts(term, ecl, limit);
    }
    return json({ results });
  } catch (error) {
    return json({ error: error.message, results: [] }, { status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server-433cd568.js.map
