import { verifyToken } from './auth-436feca7.js';
import 'jose';
import 'argon2';

const PUBLIC_PATHS = ["/login", "/api/auth/login"];
const ROLE_PATHS = {
  admin: "/admin",
  kasir: "/kasir",
  dokter: "/dokter"
};
async function handle({ event, resolve }) {
  const path = event.url.pathname;
  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    return resolve(event);
  }
  if (path.startsWith("/_app") || path.startsWith("/favicon")) {
    return resolve(event);
  }
  const token = event.cookies.get("auth_token");
  if (!token) {
    if (path.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return Response.redirect(`${event.url.origin}/login`, 302);
  }
  const payload = await verifyToken(token);
  if (!payload) {
    event.cookies.delete("auth_token", { path: "/" });
    if (path.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return Response.redirect(`${event.url.origin}/login`, 302);
  }
  event.locals.user = {
    id: payload.sub,
    name: payload.name,
    role: payload.role,
    doctor_code: payload.doctor_code
  };
  for (const [role, prefix] of Object.entries(ROLE_PATHS)) {
    if (path.startsWith(prefix) && payload.role !== role) {
      if (path.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }
      return Response.redirect(`${event.url.origin}/${payload.role}`, 302);
    }
  }
  if (path === "/") {
    return Response.redirect(`${event.url.origin}/${payload.role}`, 302);
  }
  return resolve(event);
}

export { handle };
//# sourceMappingURL=hooks.server-988ff709.js.map
