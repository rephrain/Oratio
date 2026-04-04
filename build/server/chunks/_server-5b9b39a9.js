import { j as json } from './index-d7f43214.js';

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

export { GET };
//# sourceMappingURL=_server-5b9b39a9.js.map
