/**
 * In-memory encounter lock manager.
 *
 * Tracks which user currently has an encounter open for editing.
 * Locks auto-expire after LOCK_TTL_MS to prevent stale locks
 * from disconnected sessions.
 */

const LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes — refreshed by heartbeat

/** @type {Map<string, { userId: string, userName: string, userRole: string, lockedAt: number }>} */
const locks = new Map();

/**
 * Attempt to lock an encounter for a user.
 * Returns { success, lock } or { success: false, holder }.
 */
export function lockEncounter(encounterId, userId, userName, userRole) {
	const existing = locks.get(encounterId);

	// If already locked by same user, refresh
	if (existing && existing.userId === userId) {
		existing.lockedAt = Date.now();
		return { success: true, lock: existing };
	}

	// If locked by someone else and not expired
	if (existing && (Date.now() - existing.lockedAt) < LOCK_TTL_MS) {
		return { success: false, holder: existing };
	}

	// Lock is free or expired
	const lock = { userId, userName, userRole, lockedAt: Date.now() };
	locks.set(encounterId, lock);
	return { success: true, lock };
}

/**
 * Unlock an encounter. Only the holder can unlock.
 */
export function unlockEncounter(encounterId, userId) {
	const existing = locks.get(encounterId);
	if (!existing) return true;
	if (existing.userId === userId) {
		locks.delete(encounterId);
		return true;
	}
	return false;
}

/**
 * Check lock status of an encounter.
 * Returns null if unlocked, or the holder info if locked.
 */
export function getLock(encounterId) {
	const existing = locks.get(encounterId);
	if (!existing) return null;

	// Expired?
	if ((Date.now() - existing.lockedAt) >= LOCK_TTL_MS) {
		locks.delete(encounterId);
		return null;
	}

	return existing;
}

/**
 * Bulk check locks for multiple encounter IDs.
 * Returns a Map of encounterId → holder (only for locked ones).
 */
export function getLocksForEncounters(encounterIds) {
	const result = {};
	const now = Date.now();
	for (const id of encounterIds) {
		const existing = locks.get(id);
		if (existing && (now - existing.lockedAt) < LOCK_TTL_MS) {
			result[id] = existing;
		} else if (existing) {
			locks.delete(id); // cleanup expired
		}
	}
	return result;
}
