import { SignJWT, jwtVerify } from 'jose';
import argon2 from 'argon2';
import crypto from 'node:crypto';
import { db } from '$lib/server/db/index.js';
import { users, refreshTokens, authAuditLogs } from '$lib/server/db/schema.js';
import { eq, and, isNull, lt } from 'drizzle-orm';

const JWT_SECRET_STRING = process.env.JWT_SECRET;
if (!JWT_SECRET_STRING && process.env.NODE_ENV === 'production') {
	throw new Error('JWT_SECRET environment variable is required in production');
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING || 'dev-secret-change-in-production');
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CONCURRENCY_GRACE_PERIOD_MS = 15 * 1000; // 15 seconds grace window for concurrent refreshes

/**
 * Creates a short-lived JWT access token containing required claims (sub, role, iat, exp, jti).
 */
export async function createToken(user) {
	const jti = crypto.randomUUID();
	const payload = {
		sub: user.id,
		name: user.name,
		role: user.role,
		doctor_code: user.doctor_code || null,
		profile_image_url: user.profile_image_url || null,
		jti
	};

	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(ACCESS_TOKEN_EXPIRY)
		.sign(JWT_SECRET);
}

/**
 * Verifies a JWT access token signature and expiration.
 */
export async function verifyToken(token) {
	try {
		const { payload } = await jwtVerify(token, JWT_SECRET);
		return payload;
	} catch {
		return null;
	}
}

/**
 * Generates a SHA-256 hash of a string.
 */
export function hashToken(token) {
	return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Creates and stores a new refresh token record associated with a session family.
 */
export async function createRefreshToken({ userId, familyId = null, userAgent = null, ipAddress = null }) {
	const rawToken = crypto.randomBytes(32).toString('hex');
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

/**
 * Rotates a refresh token with reuse detection, concurrency grace window, and family revocation.
 */
export async function rotateRefreshToken(rawRefreshToken, { userAgent = null, ipAddress = null } = {}) {
	if (!rawRefreshToken) {
		throw new Error('Refresh token is required');
	}

	const tokenHash = hashToken(rawRefreshToken);
	const [existingToken] = await db.select().from(refreshTokens)
		.where(eq(refreshTokens.token_hash, tokenHash))
		.limit(1);

	if (!existingToken) {
		await logAuthEvent('TOKEN_REFRESH_FAILED', { ipAddress, userAgent, details: JSON.stringify({ reason: 'Token not found' }) });
		throw new Error('Invalid refresh token');
	}

	// Case 1: Token was explicitly revoked
	if (existingToken.revoked_at) {
		await revokeFamily(existingToken.family_id);
		await logAuthEvent('TOKEN_REUSE_DETECTED', {
			userId: existingToken.user_id,
			ipAddress,
			userAgent,
			details: JSON.stringify({ familyId: existingToken.family_id, reason: 'Used revoked token' })
		});
		throw new Error('Token compromised and session revoked');
	}

	// Case 2: Token was already replaced (rotation re-use attempt)
	if (existingToken.replaced_at) {
		const timeSinceReplacement = Date.now() - new Date(existingToken.replaced_at).getTime();

		// Concurrency grace window (e.g. concurrent multi-tab requests within 15 seconds)
		if (timeSinceReplacement <= CONCURRENCY_GRACE_PERIOD_MS && existingToken.replaced_by_id) {
			const [successorToken] = await db.select().from(refreshTokens)
				.where(eq(refreshTokens.id, existingToken.replaced_by_id))
				.limit(1);

			if (successorToken && !successorToken.revoked_at && successorToken.expires_at > new Date()) {
				const [dbUser] = await db.select().from(users).where(eq(users.id, existingToken.user_id)).limit(1);
				if (dbUser && dbUser.is_active) {
					const accessToken = await createToken(dbUser);
					return {
						accessToken,
						newRefreshToken: null, // Keep existing new cookie
						user: dbUser,
						isGraceWindow: true
					};
				}
			}
		}

		// Re-use detected outside grace window -> Revoke entire token family
		await revokeFamily(existingToken.family_id);
		await logAuthEvent('TOKEN_REUSE_DETECTED', {
			userId: existingToken.user_id,
			ipAddress,
			userAgent,
			details: JSON.stringify({ familyId: existingToken.family_id, timeSinceReplacementMs: timeSinceReplacement })
		});
		throw new Error('Token reuse detected - session revoked for security');
	}

	// Case 3: Token is expired
	if (existingToken.expires_at < new Date()) {
		await logAuthEvent('TOKEN_REFRESH_FAILED', {
			userId: existingToken.user_id,
			ipAddress,
			userAgent,
			details: JSON.stringify({ reason: 'Token expired' })
		});
		throw new Error('Refresh token expired');
	}

	// Case 4: Verify user status
	const [dbUser] = await db.select().from(users).where(eq(users.id, existingToken.user_id)).limit(1);
	if (!dbUser || !dbUser.is_active) {
		await revokeAllUserSessions(existingToken.user_id);
		await logAuthEvent('TOKEN_REFRESH_FAILED', {
			userId: existingToken.user_id,
			ipAddress,
			userAgent,
			details: JSON.stringify({ reason: 'User inactive or deleted' })
		});
		throw new Error('User account is inactive');
	}

	// Perform rotation
	const { rawToken: newRawToken, record: newRecord } = await createRefreshToken({
		userId: dbUser.id,
		familyId: existingToken.family_id,
		userAgent,
		ipAddress
	});

	await db.update(refreshTokens)
		.set({
			replaced_at: new Date(),
			replaced_by_id: newRecord.id
		})
		.where(eq(refreshTokens.id, existingToken.id));

	const accessToken = await createToken(dbUser);

	await logAuthEvent('TOKEN_REFRESHED', {
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

/**
 * Revokes an entire refresh token family.
 */
export async function revokeFamily(familyId) {
	if (!familyId) return;
	await db.update(refreshTokens)
		.set({ revoked_at: new Date() })
		.where(and(eq(refreshTokens.family_id, familyId), isNull(refreshTokens.revoked_at)));
}

/**
 * Revokes all refresh token sessions for a specific user (logout, password change, deactivation).
 */
export async function revokeAllUserSessions(userId) {
	if (!userId) return;
	await db.update(refreshTokens)
		.set({ revoked_at: new Date() })
		.where(and(eq(refreshTokens.user_id, userId), isNull(refreshTokens.revoked_at)));
}

/**
 * Cleanup expired refresh tokens from database.
 */
export async function cleanupExpiredRefreshTokens() {
	const bufferDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day past expiration
	return await db.delete(refreshTokens).where(lt(refreshTokens.expires_at, bufferDate));
}

/**
 * Helper to record security audit logs.
 */
export async function logAuthEvent(eventType, { userId = null, ipAddress = null, userAgent = null, details = null } = {}) {
	try {
		await db.insert(authAuditLogs).values({
			user_id: userId,
			event_type: eventType,
			ip_address: ipAddress,
			user_agent: userAgent,
			details: details
		});
	} catch (err) {
		console.error('[AuthAudit] Failed to log event:', err);
	}
}

// Argon2id password hashing (OWASP recommended)
export async function hashPasswordAsync(password) {
	return await argon2.hash(password, {
		type: argon2.argon2id,
		memoryCost: 65536,   // 64 MiB
		timeCost: 3,         // 3 iterations
		parallelism: 4
	});
}

export async function verifyPassword(password, hash) {
	try {
		return await argon2.verify(hash, password);
	} catch {
		return false;
	}
}