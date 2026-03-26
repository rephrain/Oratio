import { j as json } from './index-d7f43214.js';

async function POST({ cookies }) {
  cookies.delete("auth_token", { path: "/" });
  return json({ success: true });
}

export { POST };
//# sourceMappingURL=_server-07d61ef6.js.map
