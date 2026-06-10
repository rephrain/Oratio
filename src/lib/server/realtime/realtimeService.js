import { eventBus } from './realtimeEventBus.js';

/**
 * Service to emit platform events after successful database transactions.
 */

/**
 * Emit a patient-related event.
 * @param {string} event - e.g., 'patient_created', 'patient_updated'
 * @param {string} patientId
 * @param {object} data - Payload
 * @param {string} [userId] - Actor ID
 */
export function emitPatientEvent(event, patientId, data, userId) {
	eventBus.publish(`patient_${patientId}`, event, data, userId);
	// Also notify dashboard for creates
	if (event === 'patient_created' || event === 'patient_registered') {
		eventBus.publish('dashboard', 'patient_registered', data, userId);
	}
}

/**
 * Emit an encounter-related event.
 * @param {string} event - e.g., 'status_changed', 'soap_updated'
 * @param {string} encounterId
 * @param {object} data
 * @param {string} [userId]
 */
export function emitEncounterEvent(event, encounterId, data, userId) {
	eventBus.publish(`encounter_${encounterId}`, event, data, userId);
}

/**
 * Emit a queue-related event.
 * @param {string} event - e.g., 'queue_created', 'queue_updated'
 * @param {object} data
 * @param {string} [userId]
 */
export function emitQueueEvent(event, data, userId) {
	eventBus.publish('queue', event, data, userId);
}

/**
 * Emit a dashboard-related event.
 * @param {string} event
 * @param {object} data
 * @param {string} [userId]
 */
export function emitDashboardEvent(event, data, userId) {
	eventBus.publish('dashboard', event, data, userId);
}

/**
 * Emit a chat-related event.
 * @param {string} event - 'message_sent', 'message_read'
 * @param {string} conversationId
 * @param {object} data
 * @param {string} [userId]
 * @param {string[]} [notifyUserIds] - Specific users to notify (for unread badges/push notifications)
 */
export function emitChatEvent(event, conversationId, data, userId, notifyUserIds = []) {
	// Publish to the conversation room
	eventBus.publish(`conversation_${conversationId}`, event, data, userId);
	
	// Publish to personal user rooms for badges
	for (const targetId of notifyUserIds) {
		if (targetId !== userId) {
			eventBus.publish(`user_${targetId}`, 'unread_chat_count_updated', { conversationId }, userId);
			eventBus.publish(`user_${targetId}`, event, data, userId);
		}
	}
}

/**
 * Emit a notification event.
 * @param {string} targetUserId
 * @param {string} event
 * @param {object} data
 */
export function emitNotificationEvent(targetUserId, event, data) {
	eventBus.publish(`user_${targetUserId}`, event, data);
}
