import { j as json } from "../../../../chunks/index.js";
const SATUSEHAT_URLS = {
  staging: "https://api-satusehat.kemkes.go.id/fhir-r4/v1",
  production: "https://api-satusehat.kemkes.go.id/fhir-r4/v1"
};
const AUTH_URLS = {
  staging: "https://api-satusehat.dto.kemkes.go.id/oauth2/v1/accesstoken",
  production: "https://api-satusehat.kemkes.go.id/oauth2/v1/accesstoken"
};
let cachedToken = null;
let tokenExpiry = 0;
function getEnv() {
  return process.env.SATUSEHAT_ENV || "staging";
}
async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  const env = getEnv();
  const url = `${AUTH_URLS[env]}?grant_type=client_credentials`;
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
async function searchKFA(query) {
  const token = await getToken();
  const env = getEnv();
  const baseUrl = SATUSEHAT_URLS[env];
  const res = await fetch(`${baseUrl}/Medication?name=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok)
    throw new Error(`KFA search failed: ${res.status}`);
  return await res.json();
}
async function GET({ url }) {
  const query = url.searchParams.get("query") || "";
  if (!query || query.length < 2) {
    return json({ results: [] });
  }
  try {
    const data = await searchKFA(query);
    const results = (data.entry || []).map((e) => ({
      code: e.resource?.code?.coding?.[0]?.code || "",
      display: e.resource?.code?.coding?.[0]?.display || e.resource?.code?.text || ""
    }));
    return json({ results });
  } catch (error) {
    return json({ error: error.message, results: [] }, { status: 500 });
  }
}
export {
  GET
};
