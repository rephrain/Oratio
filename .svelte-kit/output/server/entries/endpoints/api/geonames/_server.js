import { j as json } from "../../../../chunks/index.js";
const BASE = "http://api.geonames.org";
const USERNAME = "oratio";
async function GET({ url }) {
  const q = url.searchParams.get("q");
  if (!q)
    return json({ geonames: [] });
  const res = await fetch(
    `${BASE}/searchJSON?q=${encodeURIComponent(q)}&featureClass=P&maxRows=10&lang=id&username=${USERNAME}`
  );
  if (!res.ok)
    return json({ geonames: [] }, { status: res.status });
  const data = await res.json();
  return json(data);
}
export {
  GET
};
