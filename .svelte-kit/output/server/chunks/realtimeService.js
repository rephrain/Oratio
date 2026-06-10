import { e as eventBus } from "./realtimeEventBus.js";
function emitPatientEvent(event, patientId, data, userId) {
  eventBus.publish(`patient_${patientId}`, event, data, userId);
  if (event === "patient_created" || event === "patient_registered") {
    eventBus.publish("dashboard", "patient_registered", data, userId);
  }
}
function emitEncounterEvent(event, encounterId, data, userId) {
  eventBus.publish(`encounter_${encounterId}`, event, data, userId);
}
function emitQueueEvent(event, data, userId) {
  eventBus.publish("queue", event, data, userId);
}
function emitDashboardEvent(event, data, userId) {
  eventBus.publish("dashboard", event, data, userId);
}
function emitChatEvent(event, conversationId, data, userId, notifyUserIds = []) {
  eventBus.publish(`conversation_${conversationId}`, event, data, userId);
  for (const targetId of notifyUserIds) {
    if (targetId !== userId) {
      eventBus.publish(`user_${targetId}`, "unread_chat_count_updated", { conversationId }, userId);
      eventBus.publish(`user_${targetId}`, event, data, userId);
    }
  }
}
export {
  emitPatientEvent as a,
  emitQueueEvent as b,
  emitDashboardEvent as c,
  emitEncounterEvent as d,
  emitChatEvent as e
};
