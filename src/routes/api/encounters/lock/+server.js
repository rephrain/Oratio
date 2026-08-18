import { json } from '@sveltejs/kit';
import { lockEncounter, unlockEncounter, getLock, getLocksForEncounters } from '$lib/server/encounterLock.js';

/**
 * POST /api/encounters/lock — Lock an encounter for editing
 * Body: { encounterId }
 */
export async function POST({ request, locals }) {
	if (!locals.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { encounterId } = await request.json();
	if (!encounterId) {
		return json({ error: 'encounterId is required' }, { status: 400 });
	}

	const result = lockEncounter(
		encounterId,
		locals.user.id,
		locals.user.name || 'Unknown',
		locals.user.role || 'unknown'
	);

	if (result.success) {
		return json({ locked: true });
	}

	return json({
		locked: false,
		holder: {
			userName: result.holder.userName,
			userRole: result.holder.userRole
		}
	}, { status: 409 });
}

/**
 * DELETE /api/encounters/lock — Unlock an encounter
 * Body: { encounterId }
 */
export async function DELETE({ request, locals }) {
	if (!locals.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { encounterId } = await request.json();
	if (!encounterId) {
		return json({ error: 'encounterId is required' }, { status: 400 });
	}

	unlockEncounter(encounterId, locals.user.id);
	return json({ unlocked: true });
}

/**
 * GET /api/encounters/lock?ids=id1,id2,id3 — Bulk check lock status
 */
export async function GET({ url, locals }) {
	if (!locals.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const idsParam = url.searchParams.get('ids');
	if (!idsParam) {
		return json({ locks: {} });
	}

	const ids = idsParam.split(',').filter(Boolean);
	const locksMap = getLocksForEncounters(ids);

	// Don't expose userId, only name and role
	const sanitized = {};
	for (const [id, holder] of Object.entries(locksMap)) {
		sanitized[id] = {
			userName: holder.userName,
			userRole: holder.userRole,
			isMe: holder.userId === locals.user.id
		};
	}

	return json({ locks: sanitized });
}
