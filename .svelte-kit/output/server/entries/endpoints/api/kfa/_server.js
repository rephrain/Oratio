import { j as json } from "../../../../chunks/index.js";
import { b as private_env } from "../../../../chunks/shared-server.js";
const SATUSEHAT_CLIENT_ID = private_env.SATUSEHAT_CLIENT_ID;
const SATUSEHAT_CLIENT_SECRET = private_env.SATUSEHAT_CLIENT_SECRET;
const SATUSEHAT_ENV = private_env.SATUSEHAT_ENV;
const SATUSEHAT_CONFIG = {
  staging: {
    base_url: "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1",
    auth_url: "https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1/accesstoken",
    kfa_url: "https://api-satusehat-stg.dto.kemkes.go.id/kfa-v2/products/all",
    consent_url: "https://api-satusehat-stg.dto.kemkes.go.id/consent/v1"
  },
  production: {
    base_url: "https://api-satusehat.kemkes.go.id/fhir-r4/v1",
    auth_url: "https://api-satusehat.kemkes.go.id/oauth2/v1/accesstoken",
    kfa_url: "https://api-satusehat.kemkes.go.id/kfa-v2/products/all",
    consent_url: "https://api-satusehat.kemkes.go.id/consent/v1"
  }
};
let cachedToken = null;
let tokenExpiry = 0;
function getEnv() {
  return SATUSEHAT_ENV || "staging";
}
function getConfig() {
  return SATUSEHAT_CONFIG[getEnv()] || SATUSEHAT_CONFIG.staging;
}
function validateEnv() {
  if (!SATUSEHAT_CLIENT_ID || !SATUSEHAT_CLIENT_SECRET) {
    throw new Error("SATUSEHAT env variables are missing");
  }
}
async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  validateEnv();
  const config = getConfig();
  const url = `${config.auth_url}?grant_type=client_credentials`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: SATUSEHAT_CLIENT_ID,
        client_secret: SATUSEHAT_CLIENT_SECRET
      })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SatuSehat auth failed: ${res.status} - ${text}`);
    }
    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1e3;
    return cachedToken;
  } catch (error) {
    console.error("SatuSehat token error:", error);
    throw error;
  }
}
async function searchKFA(keyword, page = 1, size = 10, merkType = null) {
  const token = await getToken();
  const config = getConfig();
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    product_type: "farmasi",
    keyword
  });
  const res = await fetch(`${config.kfa_url}?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KFA search failed: ${res.status} - ${text}`);
  }
  const data = await res.json();
  const items = data?.items?.data || [];
  if (merkType === "unknown") {
    const templates = items.map((item) => {
      const template = item.prodct_template || item.product_template;
      if (!template)
        return null;
      return {
        code: template.kfa_code,
        display: template.name,
        product_name: template.name,
        dosage_form: item.dosage_form?.name || "",
        kfa_code: template.kfa_code
      };
    }).filter((t) => t && String(t.kfa_code).startsWith("92"));
    const seen = /* @__PURE__ */ new Set();
    return templates.filter((t) => {
      if (seen.has(t.kfa_code))
        return false;
      seen.add(t.kfa_code);
      return true;
    });
  } else if (merkType === "known") {
    return items.map((item) => ({
      code: item.kfa_code,
      display: item.name,
      product_name: item.name,
      dosage_form: item.dosage_form?.name || "",
      kfa_code: item.kfa_code
    })).filter((item) => String(item.kfa_code).startsWith("93"));
  }
  return items.map((item) => {
    const isUnknown = String(item.kfa_code).startsWith("92");
    const template = item.prodct_template || item.product_template;
    const name = isUnknown && template ? template.name : item.name;
    const code = isUnknown && template ? template.kfa_code : item.kfa_code;
    return {
      code,
      display: name,
      product_name: name,
      dosage_form: item.dosage_form?.name || "",
      kfa_code: item.kfa_code
    };
  });
}
async function GET({ url }) {
  const query = url.searchParams.get("query") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const size = parseInt(url.searchParams.get("size") || "10");
  if (!query || query.length < 2) {
    return json({ results: [] });
  }
  try {
    const merkType = url.searchParams.get("merkType");
    const results = await searchKFA(query, page, size, merkType);
    return json({ results });
  } catch (error) {
    console.error("KFA search error:", error);
    return json({ error: error.message, results: [] }, { status: 500 });
  }
}
export {
  GET
};
