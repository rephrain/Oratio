import { j as json } from './index-d7f43214.js';

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
  return process.env.SATUSEHAT_ENV || "staging";
}
function getConfig() {
  return SATUSEHAT_CONFIG[getEnv()] || SATUSEHAT_CONFIG.staging;
}
async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  const config = getConfig();
  const url = `${config.auth_url}?grant_type=client_credentials`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.SATUSEHAT_CLIENT_ID || "",
        client_secret: process.env.SATUSEHAT_CLIENT_SECRET || ""
      })
    });
    if (!res.ok)
      throw new Error(`SatuSehat auth failed: ${res.status}`);
    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1e3;
    return cachedToken;
  } catch (error) {
    console.error("SatuSehat token error:", error);
    throw error;
  }
}
async function searchKFA(keyword, page = 1, size = 10) {
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
  if (!res.ok)
    throw new Error(`KFA search failed: ${res.status}`);
  const data = await res.json();
  const items = data?.items?.data || [];
  return items.map((item) => {
    const isUnknown = item.kfa_code?.startsWith("92");
    return {
      code: isUnknown ? item.prodct_template?.kfa_code : item.kfa_code,
      display: isUnknown ? item.prodct_template?.name : item.name,
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
    const results = await searchKFA(query, page, size);
    return json({ results });
  } catch (error) {
    console.error("KFA search error:", error);
    return json({ error: error.message, results: [] }, { status: 500 });
  }
}

export { GET };
//# sourceMappingURL=_server-9e20cab0.js.map
