import { j as json } from "../../../../chunks/index.js";
const SNOWSTORM_FHIR_BASE = process.env.SNOWSTORM_BASE_URL || "https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand";
async function expandValueSet(ecl, filter, count = 10) {
  const encodeStrict = (str) => encodeURIComponent(str).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
  const encodedEcl = encodeStrict(ecl);
  const encodedFilter = encodeStrict(filter || "");
  const queryString = `$expand?url=http://snomed.info/sct?fhir_vs=ecl/${encodedEcl}&count=${count}&filter=${encodedFilter}`;
  const fullUrl = `${SNOWSTORM_FHIR_BASE}${queryString}`;
  console.log("Fetching Snowstorm:", fullUrl);
  const res = await fetch(fullUrl, {
    headers: { Accept: "application/fhir+json" }
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Snowstorm response:", text);
    throw new Error(`Snowstorm FHIR search failed: ${res.status}`);
  }
  const data = await res.json();
  return (data?.expansion?.contains || []).map((item) => ({
    code: item.code,
    display: item.display,
    system: item.system === "http://snomed.info/sct" ? "SNOMED" : item.system || "SNOMED"
  }));
}
async function searchPersonalDiseaseHistory(term) {
  const eclUrl = "< 417662000 |History of clinical finding in subject (situation)| OR < 443508001 |No history of clinical finding in subject (situation)|";
  return expandValueSet(eclUrl, term);
}
async function searchFamilyDiseaseHistory(term) {
  const eclUrl = "< 416471007 |Family history of clinical finding (situation)| OR < 160266009 |No family history of clinical finding (situation)|";
  return expandValueSet(eclUrl, term);
}
async function searchAllergySubstances(term) {
  const ecl = "( < 105590001 |Substance (substance)| MINUS ( << 410942007 |Drug or medicament (substance)| OR ( << 787859002 |Vaccine product (medicinal product)| . 127489000 |Has active ingredient| ) ) ) OR ( << 716186003 |No known allergy (situation)| : { 408729009 |Finding context (attribute)| = 410516002 |Known absent (qualifier value)| } )";
  return expandValueSet(ecl, term);
}
async function searchChiefComplaint(term) {
  return searchReasonByCategory(term, "finding");
}
async function searchReasonByCategory(term, category = "finding") {
  const eclMap = {
    finding: "<404684003",
    procedure: "<71388002",
    situation: "<243796009",
    event: "<272379006"
  };
  const eclUrl = eclMap[category] || eclMap.finding;
  return expandValueSet(eclUrl, term);
}
async function searchConcepts(term, ecl = "", limit = 10) {
  if (ecl) {
    const eclUrl = `${ecl}`;
    return expandValueSet(eclUrl, term, limit);
  }
  return searchReasonByCategory(term, "finding");
}
async function GET({ url }) {
  const term = url.searchParams.get("filter") || url.searchParams.get("term") || "";
  const type = url.searchParams.get("type") || "general";
  const ecl = url.searchParams.get("ecl") || "";
  const limit = parseInt(url.searchParams.get("limit") || "10");
  if (!term || term.length < 2) {
    return json({ results: [] });
  }
  try {
    let results;
    switch (type) {
      case "disease_personal":
        results = await searchPersonalDiseaseHistory(term);
        break;
      case "disease_family":
        results = await searchFamilyDiseaseHistory(term);
        break;
      case "disease":
        results = await searchPersonalDiseaseHistory(term);
        break;
      case "allergy":
        results = await searchAllergySubstances(term);
        break;
      case "reason":
      case "reason_finding":
        results = await searchChiefComplaint(term);
        break;
      case "reason_procedure":
        results = await searchReasonByCategory(term, "procedure");
        break;
      case "reason_situation":
        results = await searchReasonByCategory(term, "situation");
        break;
      case "reason_event":
        results = await searchReasonByCategory(term, "event");
        break;
      default:
        results = await searchConcepts(term, ecl, limit);
    }
    return json({ results });
  } catch (error) {
    console.error("Snowstorm search error:", error);
    return json({ error: error.message, results: [] }, { status: 500 });
  }
}
export {
  GET
};
