import { j as json } from './index-d7f43214.js';

const LOCK_TTL_MS = 5 * 60 * 1e3;
const locks = /* @__PURE__ */ new Map();
function lockEncounter(encounterId, userId, userName, userRole) {
  const existing = locks.get(encounterId);
  if (existing && existing.userId === userId) {
    existing.lockedAt = Date.now();
    return { success: true, lock: existing };
  }
  if (existing && Date.now() - existing.lockedAt < LOCK_TTL_MS) {
    return { success: false, holder: existing };
  }
  const lock = { userId, userName, userRole, lockedAt: Date.now() };
  locks.set(encounterId, lock);
  return { success: true, lock };
}
function unlockEncounter(encounterId, userId) {
  const existing = locks.get(encounterId);
  if (!existing)
    return true;
  if (existing.userId === userId) {
    locks.delete(encounterId);
    return true;
  }
  return false;
}
function getLocksForEncounters(encounterIds) {
  const result = {};
  const now = Date.now();
  for (const id of encounterIds) {
    const existing = locks.get(id);
    if (existing && now - existing.lockedAt < LOCK_TTL_MS) {
      result[id] = existing;
    } else if (existing) {
      locks.delete(id);
    }
  }
  return result;
}
async function POST({ request, locals }) {
  if (!locals.user?.id) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const { encounterId } = await request.json();
  if (!encounterId) {
    return json({ error: "encounterId is required" }, { status: 400 });
  }
  const result = lockEncounter(
    encounterId,
    locals.user.id,
    locals.user.name || "Unknown",
    locals.user.role || "unknown"
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
async function DELETE({ request, locals }) {
  if (!locals.user?.id) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const { encounterId } = await request.json();
  if (!encounterId) {
    return json({ error: "encounterId is required" }, { status: 400 });
  }
  unlockEncounter(encounterId, locals.user.id);
  return json({ unlocked: true });
}
async function GET({ url, locals }) {
  if (!locals.user?.id) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const idsParam = url.searchParams.get("ids");
  if (!idsParam) {
    return json({ locks: {} });
  }
  const ids = idsParam.split(",").filter(Boolean);
  const locksMap = getLocksForEncounters(ids);
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

export { DELETE, GET, POST };
//# sourceMappingURL=_server-0f2131a7.js.map
