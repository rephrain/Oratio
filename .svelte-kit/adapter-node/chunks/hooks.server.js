import { d as db, e as encounters, u as users } from "./index3.js";
import { and, eq, lt, inArray } from "drizzle-orm";
import { cleanupExpiredRefreshTokens, verifyToken, rotateRefreshToken, revokeAllUserSessions } from "./auth.js";
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
    const cleanedTokens = await cleanupExpiredRefreshTokens();
    console.log(`[CRON] End-of-day: ${cancelled.length} cancelled, ${discontinued.length} discontinued, ${cleanedTokens ? cleanedTokens.length || "expired" : 0} refresh tokens cleaned`);
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
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/refresh"];
const ROLE_PATHS = {
  admin: "/admin",
  kasir: "/kasir",
  dokter: "/dokter",
  suster: "/suster"
};
async function handle({ event, resolve }) {
  const path = event.url.pathname;
  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    return resolve(event);
  }
  if (path.startsWith("/_app") || path.startsWith("/favicon")) {
    return resolve(event);
  }
  let token = event.cookies.get("auth_token");
  let payload = token ? await verifyToken(token) : null;
  const isProd = process.env.NODE_ENV === "production";
  if (!payload) {
    const refreshToken = event.cookies.get("refresh_token");
    if (refreshToken) {
      try {
        const userAgent = event.request.headers.get("user-agent");
        const ipAddress = event.request.headers.get("x-forwarded-for") || "127.0.0.1";
        const refreshed = await rotateRefreshToken(refreshToken, { userAgent, ipAddress });
        token = refreshed.accessToken;
        payload = await verifyToken(token);
        event.cookies.set("auth_token", refreshed.accessToken, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: isProd,
          maxAge: 15 * 60
        });
        if (refreshed.newRefreshToken) {
          event.cookies.set("refresh_token", refreshed.newRefreshToken, {
            path: "/api/auth/refresh",
            httpOnly: true,
            sameSite: "strict",
            secure: isProd,
            maxAge: 7 * 24 * 60 * 60
          });
        }
      } catch (err) {
        event.cookies.delete("auth_token", { path: "/" });
        event.cookies.delete("refresh_token", { path: "/api/auth/refresh" });
      }
    }
  }
  if (!payload) {
    if (path.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return Response.redirect(`${event.url.origin}/login`, 302);
  }
  let dbUser;
  try {
    [dbUser] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
  } catch (err) {
    console.error("[Hooks] Database error:", err);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: err.message,
      stack: err.stack,
      payload_sub: payload.sub
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!dbUser || !dbUser.is_active) {
    if (dbUser) {
      await revokeAllUserSessions(dbUser.id);
    }
    event.cookies.delete("auth_token", { path: "/" });
    event.cookies.delete("refresh_token", { path: "/api/auth/refresh" });
    if (path.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Session expired or account deactivated" }), {
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
export {
  handle
};
