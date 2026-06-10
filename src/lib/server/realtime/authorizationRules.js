/**
 * Authorization rules for real-time room subscriptions.
 * Determines whether a user is allowed to subscribe to a given room.
 */

import { db } from '$lib/server/db/index.js';
import { encounters, chatConversations } from '$lib/server/db/schema.js';
import { eq, or, and } from 'drizzle-orm';

/**
 * Check if a user is authorized to subscribe to a room.
 * @param {string} room - Room identifier
 * @param {{ id: string, role: string, doctor_code?: string }} user - Authenticated user
 * @returns {Promise<boolean>}
 */
export async function canSubscribe(room, user) {
	if (!room || !user?.id) return false;

	// User personal channel — only the user themselves
	if (room.startsWith('user_')) {
		const targetUserId = room.substring(5);
		return targetUserId === user.id;
	}

	// Patient channel — any authenticated clinic staff can view patients
	if (room.startsWith('patient_')) {
		return true;
	}

	// Encounter channel — doctor assigned, kasir who created, or admin
	if (room.startsWith('encounter_')) {
		if (user.role === 'admin') return true;

		const encounterId = room.substring(10);
		try {
			const [enc] = await db.select({
				doctor_id: encounters.doctor_id,
				kasir_id: encounters.kasir_id
			})
				.from(encounters)
				.where(eq(encounters.id, encounterId))
				.limit(1);

			if (!enc) return false;
			return enc.doctor_id === user.id || enc.kasir_id === user.id;
		} catch {
			return false;
		}
	}

	// Conversation channel — only participants
	if (room.startsWith('conversation_')) {
		const conversationId = room.substring(13);
		try {
			const [conv] = await db.select({
				participant_a: chatConversations.participant_a,
				participant_b: chatConversations.participant_b
			})
				.from(chatConversations)
				.where(eq(chatConversations.id, conversationId))
				.limit(1);

			if (!conv) return false;
			return conv.participant_a === user.id || conv.participant_b === user.id;
		} catch {
			return false;
		}
	}

	// Global rooms — any authenticated user
	if (room === 'queue' || room === 'dashboard') {
		return true;
	}

	// Unknown room pattern — deny
	return false;
}
