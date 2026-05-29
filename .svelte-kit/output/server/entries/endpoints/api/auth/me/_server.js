import { j as json } from "../../../../../chunks/index.js";
async function GET({ locals }) {
  if (!locals.user) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }
  return json({ user: locals.user });
}
export {
  GET
};
