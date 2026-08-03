import { j as json } from './index-d7f43214.js';
import { d as db, r as refreshTokens } from './index3-5403fb4f.js';
import { eq } from 'drizzle-orm';
import { hashToken, revokeFamily, logAuthEvent } from './auth-adecefa5.js';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';
import 'jose';
import 'argon2';
import 'node:crypto';

async function POST({ request, cookies, locals }) {
  const refreshToken = cookies.get("refresh_token");
  const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent");
  const userId = locals?.user?.id || null;
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    const [tokenRecord] = await db.select().from(refreshTokens).where(eq(refreshTokens.token_hash, tokenHash)).limit(1);
    if (tokenRecord) {
      await revokeFamily(tokenRecord.family_id);
    }
  }
  await logAuthEvent("LOGOUT", { userId, ipAddress, userAgent });
  cookies.delete("auth_token", { path: "/" });
  cookies.delete("refresh_token", { path: "/api/auth/refresh" });
  return json({ success: true });
}

export { POST };
//# sourceMappingURL=_server-b8f93843.js.map
