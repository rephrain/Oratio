import { j as json } from "../../../../chunks/index.js";
const BASE = "https://wilayah.id/api";
async function GET({ url }) {
  const path = url.searchParams.get("path");
  if (!path)
    return json({ data: [] }, { status: 400 });
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok)
    return json({ data: [] }, { status: res.status });
  const data = await res.json();
  return json(data);
}
export {
  GET
};
