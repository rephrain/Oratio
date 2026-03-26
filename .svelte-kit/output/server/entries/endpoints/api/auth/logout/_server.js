import { j as json } from "../../../../../chunks/index.js";
async function POST({ cookies }) {
  cookies.delete("auth_token", { path: "/" });
  return json({ success: true });
}
export {
  POST
};
