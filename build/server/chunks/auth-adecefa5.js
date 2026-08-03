import { SignJWT, jwtVerify } from 'jose';
import argon2 from 'argon2';
import crypto from 'node:crypto';
import { d as db, r as refreshTokens, u as users, b as authAuditLogs } from './index3-5403fb4f.js';
import { eq, and, isNull, lt } from 'drizzle-orm';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';

let _jwtSecret = null;
function getJwtSecret() {
  if (_jwtSecret)
    return _jwtSecret;
  const raw = process.env.JWT_SECRET;
  if (!raw && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  _jwtSecret = new TextEncoder().encode(raw || "dev-secret-change-in-production");
  return _jwtSecret;
}
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1e3;
const CONCURRENCY_GRACE_PERIOD_MS = 15 * 1e3;
async function createToken(user) {
  const jti = crypto.randomUUID();
  const payload = {
    sub: user.id,
    name: user.name,
    role: user.role,
    doctor_code: user.doctor_code || null,
    profile_image_url: user.profile_image_url || null,
    jti
  };
  return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(ACCESS_TOKEN_EXPIRY).sign(getJwtSecret());
}
async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload;
  } catch {
    return null;
  }
}
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
async function createRefreshToken({ userId, familyId = null, userAgent = null, ipAddress = null }) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const finalFamilyId = familyId || crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  const [record] = await db.insert(refreshTokens).values({
    user_id: userId,
    family_id: finalFamilyId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    user_agent: userAgent,
    ip_address: ipAddress
  }).returning();
  return { rawToken, record };
}
async function rotateRefreshToken(rawRefreshToken, { userAgent = null, ipAddress = null } = {}) {
  if (!rawRefreshToken) {
    throw new Error("Refresh token is required");
  }
  const tokenHash = hashToken(rawRefreshToken);
  const [existingToken] = await db.select().from(refreshTokens).where(eq(refreshTokens.token_hash, tokenHash)).limit(1);
  if (!existingToken) {
    await logAuthEvent("TOKEN_REFRESH_FAILED", { ipAddress, userAgent, details: JSON.stringify({ reason: "Token not found" }) });
    throw new Error("Invalid refresh token");
  }
  if (existingToken.revoked_at) {
    await revokeFamily(existingToken.family_id);
    await logAuthEvent("TOKEN_REUSE_DETECTED", {
      userId: existingToken.user_id,
      ipAddress,
      userAgent,
      details: JSON.stringify({ familyId: existingToken.family_id, reason: "Used revoked token" })
    });
    throw new Error("Token compromised and session revoked");
  }
  if (existingToken.replaced_at) {
    const timeSinceReplacement = Date.now() - new Date(existingToken.replaced_at).getTime();
    if (timeSinceReplacement <= CONCURRENCY_GRACE_PERIOD_MS && existingToken.replaced_by_id) {
      const [successorToken] = await db.select().from(refreshTokens).where(eq(refreshTokens.id, existingToken.replaced_by_id)).limit(1);
      if (successorToken && !successorToken.revoked_at && successorToken.expires_at > /* @__PURE__ */ new Date()) {
        const [dbUser2] = await db.select().from(users).where(eq(users.id, existingToken.user_id)).limit(1);
        if (dbUser2 && dbUser2.is_active) {
          const accessToken2 = await createToken(dbUser2);
          return {
            accessToken: accessToken2,
            newRefreshToken: null,
            // Keep existing new cookie
            user: dbUser2,
            isGraceWindow: true
          };
        }
      }
    }
    await revokeFamily(existingToken.family_id);
    await logAuthEvent("TOKEN_REUSE_DETECTED", {
      userId: existingToken.user_id,
      ipAddress,
      userAgent,
      details: JSON.stringify({ familyId: existingToken.family_id, timeSinceReplacementMs: timeSinceReplacement })
    });
    throw new Error("Token reuse detected - session revoked for security");
  }
  if (existingToken.expires_at < /* @__PURE__ */ new Date()) {
    await logAuthEvent("TOKEN_REFRESH_FAILED", {
      userId: existingToken.user_id,
      ipAddress,
      userAgent,
      details: JSON.stringify({ reason: "Token expired" })
    });
    throw new Error("Refresh token expired");
  }
  const [dbUser] = await db.select().from(users).where(eq(users.id, existingToken.user_id)).limit(1);
  if (!dbUser || !dbUser.is_active) {
    await revokeAllUserSessions(existingToken.user_id);
    await logAuthEvent("TOKEN_REFRESH_FAILED", {
      userId: existingToken.user_id,
      ipAddress,
      userAgent,
      details: JSON.stringify({ reason: "User inactive or deleted" })
    });
    throw new Error("User account is inactive");
  }
  const { rawToken: newRawToken, record: newRecord } = await createRefreshToken({
    userId: dbUser.id,
    familyId: existingToken.family_id,
    userAgent,
    ipAddress
  });
  await db.update(refreshTokens).set({
    replaced_at: /* @__PURE__ */ new Date(),
    replaced_by_id: newRecord.id
  }).where(eq(refreshTokens.id, existingToken.id));
  const accessToken = await createToken(dbUser);
  await logAuthEvent("TOKEN_REFRESHED", {
    userId: dbUser.id,
    ipAddress,
    userAgent,
    details: JSON.stringify({ familyId: existingToken.family_id })
  });
  return {
    accessToken,
    newRefreshToken: newRawToken,
    user: dbUser,
    isGraceWindow: false
  };
}
async function revokeFamily(familyId) {
  if (!familyId)
    return;
  await db.update(refreshTokens).set({ revoked_at: /* @__PURE__ */ new Date() }).where(and(eq(refreshTokens.family_id, familyId), isNull(refreshTokens.revoked_at)));
}
async function revokeAllUserSessions(userId) {
  if (!userId)
    return;
  await db.update(refreshTokens).set({ revoked_at: /* @__PURE__ */ new Date() }).where(and(eq(refreshTokens.user_id, userId), isNull(refreshTokens.revoked_at)));
}
async function cleanupExpiredRefreshTokens() {
  const bufferDate = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  return await db.delete(refreshTokens).where(lt(refreshTokens.expires_at, bufferDate));
}
async function logAuthEvent(eventType, { userId = null, ipAddress = null, userAgent = null, details = null } = {}) {
  try {
    await db.insert(authAuditLogs).values({
      user_id: userId,
      event_type: eventType,
      ip_address: ipAddress,
      user_agent: userAgent,
      details
    });
  } catch (err) {
    console.error("[AuthAudit] Failed to log event:", err);
  }
}
async function hashPasswordAsync(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    // 64 MiB
    timeCost: 3,
    // 3 iterations
    parallelism: 4
  });
}
async function verifyPassword(password, hash) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export { cleanupExpiredRefreshTokens, createRefreshToken, createToken, hashPasswordAsync, hashToken, logAuthEvent, revokeAllUserSessions, revokeFamily, rotateRefreshToken, verifyPassword, verifyToken };
//# sourceMappingURL=auth-adecefa5.js.map
