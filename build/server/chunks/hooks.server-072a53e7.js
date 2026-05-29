import { d as db, e as encounters } from './index3-c9b0a838.js';
import { and, eq, lt, inArray } from 'drizzle-orm';
import { verifyToken } from './auth-c426d006.js';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';
import 'jose';
import 'argon2';

async function runEndOfDayCron() {
  const today = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  today.setHours(0, 0, 0, 0);
  try {
    const cancelled = await db.update(encounters).set({ status: "Cancelled", updated_at: /* @__PURE__ */ new Date() }).where(
      and(
        eq(encounters.status, "Planned"),
        lt(encounters.created_at, today)
      )
    ).returning();
    const discontinued = await db.update(encounters).set({ status: "Discontinued", updated_at: /* @__PURE__ */ new Date() }).where(
      and(
        inArray(encounters.status, ["In Progress", "On Hold"]),
        lt(encounters.created_at, today)
      )
    ).returning();
    console.log(`[CRON] End-of-day: ${cancelled.length} cancelled, ${discontinued.length} discontinued`);
    return { cancelled: cancelled.length, discontinued: discontinued.length };
  } catch (error) {
    console.error("[CRON] Error:", error);
    throw error;
  }
}
if (process.env.ENABLE_CRON === "true") {
  setInterval(async () => {
    const now = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    if (now.getHours() === 0 && now.getMinutes() < 5) {
      await runEndOfDayCron();
    }
  }, 5 * 60 * 1e3);
  console.log("[CRON] End-of-day cron enabled");
}
process.env.TZ = "Asia/Jakarta";
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
  const { db: db2 } = await import('./index3-c9b0a838.js').then((n) => n.C);
  const { users } = await import('./index3-c9b0a838.js').then((n) => n.B);
  const { eq: eq2 } = await import('drizzle-orm');
  const [dbUser] = await db2.select().from(users).where(eq2(users.id, payload.sub)).limit(1);
  if (!dbUser || !dbUser.is_active) {
    event.cookies.delete("auth_token", { path: "/" });
    if (path.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Session expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return Response.redirect(`${event.url.origin}/login`, 302);
  }
  event.locals.user = {
    id: dbUser.id,
    name: dbUser.name,
    role: dbUser.role,
    doctor_code: dbUser.doctor_code,
    profile_image_url: dbUser.profile_image_url
  };
  if (!path.startsWith("/api/chat")) {
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
  }
  if (path === "/") {
    return Response.redirect(`${event.url.origin}/${payload.role}`, 302);
  }
  return resolve(event);
}

export { handle };
//# sourceMappingURL=hooks.server-072a53e7.js.map
