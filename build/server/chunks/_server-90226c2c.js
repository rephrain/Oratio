import { j as json } from './index-d7f43214.js';

async function GET({ locals }) {
  if (!locals.user) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }
  return json({ user: locals.user });
}

export { GET };
//# sourceMappingURL=_server-90226c2c.js.map
