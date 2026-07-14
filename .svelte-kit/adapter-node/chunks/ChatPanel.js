import { c as create_ssr_component, a as subscribe, g as each, e as escape, f as add_attribute, j as get_store_value, o as onDestroy, k as set_store_value } from "./ssr.js";
import { t as toasts } from "./toast.js";
import { d as derived, w as writable } from "./index2.js";
import { i as isProfileModalOpen } from "./layout.js";
const Toast = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $toasts, $$unsubscribe_toasts;
  $$unsubscribe_toasts = subscribe(toasts, (value) => $toasts = value);
  $$unsubscribe_toasts();
  return `<div class="toast-container">${each($toasts, (toast) => {
    return `<div class="${"toast toast-" + escape(toast.type, true)}"><span style="flex: 1;">${escape(toast.message)}</span> <button class="btn btn-ghost btn-icon btn-sm" data-svelte-h="svelte-w3x981">✕</button> </div>`;
  })}</div>`;
});
const currentUser = writable(null);
derived(currentUser, ($user) => !!$user);
derived(currentUser, ($user) => $user?.role || null);
const isNotificationOpen = writable(false);
const notifications = writable([]);
const unreadNotificationCount = writable(0);
const isChatOpen = writable(false);
const unreadCount = writable(0);
const chatView = writable("conversations");
const ProfileModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isProfileModalOpen, $$unsubscribe_isProfileModalOpen;
  $$unsubscribe_isProfileModalOpen = subscribe(isProfileModalOpen, (value) => $isProfileModalOpen = value);
  let { user = {} } = $$props;
  let name = user.name || "";
  let username = "";
  let password = "";
  let previewUrl = user.profile_image_url || null;
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  $$unsubscribe_isProfileModalOpen();
  return `${$isProfileModalOpen ? `<div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all" role="dialog" aria-modal="true"><div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200"> <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20"><div data-svelte-h="svelte-274qo9"><h2 class="text-lg font-bold text-slate-800 dark:text-white">My Profile</h2> <p class="text-sm text-slate-500">Update your account settings</p></div> <button class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all shadow-sm" data-svelte-h="svelte-4qhovh"><span class="material-symbols-outlined text-[20px]">close</span></button></div>  <div class="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">${``} <form class="space-y-5"> <div class="flex flex-col items-center gap-4"><div class="relative group cursor-pointer"><div class="size-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800 flex justify-center items-center overflow-hidden">${previewUrl ? `<img${add_attribute("src", previewUrl, 0)}${add_attribute("alt", name || user?.name, 0)} class="w-full h-full object-cover">` : `<span class="text-3xl font-bold text-slate-400 uppercase">${escape(name?.[0] || user?.name?.[0] || "U")}</span>`}</div> <label class="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"><span class="material-symbols-outlined" data-svelte-h="svelte-1mcxf7h">photo_camera</span> <input type="file" accept="image/*" class="hidden"></label></div> <div class="text-center"><label class="text-sm text-primary font-medium cursor-pointer hover:underline">Change Photo
								<input type="file" accept="image/*" class="hidden"></label></div></div>  <div class="space-y-4"><div><label for="name" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" data-svelte-h="svelte-1x49h5y">Full Name</label> <div class="relative"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]" data-svelte-h="svelte-dtrb9c">person</span> <input type="text" id="name" placeholder="Your name" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all" required${add_attribute("value", name, 0)}></div></div> <div><label for="username" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" data-svelte-h="svelte-81er7t">Username</label> <div class="relative"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]" data-svelte-h="svelte-1ezv3ia">alternate_email</span> <input type="text" id="username" placeholder="Your unique username" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all" required${add_attribute("value", username, 0)}></div></div> <div><label for="password" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5" data-svelte-h="svelte-172cyxz">New Password</label> <div class="relative"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]" data-svelte-h="svelte-2xh0pq">lock</span> <input type="password" id="password" placeholder="Leave blank to keep current" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"${add_attribute("value", password, 0)}></div> <p class="text-[11px] text-slate-500 mt-1.5 ml-1" data-svelte-h="svelte-1pe69kd">Optional. Only fill this if you want to change your password.</p></div></div>  <div class="pt-4 flex gap-3"><button type="button" class="flex-1 py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" data-svelte-h="svelte-10xv8xa">Cancel</button> <button type="submit" ${""} class="flex-1 py-2.5 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2">${`Save Changes`}</button></div></form></div></div></div>` : ``}`;
});
const connectionStatus = writable("disconnected");
const connectionId = writable(null);
let subscribedRooms = /* @__PURE__ */ new Set();
async function unsubscribe(rooms = []) {
  const connId = get_store_value(connectionId);
  if (!connId)
    return;
  try {
    await fetch("/api/realtime/subscribe", {
      method: "POST",
      body: JSON.stringify({ connectionId: connId, rooms, action: "unsubscribe" })
    });
    for (const r of rooms)
      subscribedRooms.delete(r);
  } catch (err) {
    console.error("[RT] Unsubscribe failed:", err);
  }
}
const NotificationPanel_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".notif-backdrop.svelte-1ebilt3.svelte-1ebilt3{position:fixed;inset:0;background:rgba(0, 0, 0, 0.3);backdrop-filter:blur(4px);z-index:89;animation:svelte-1ebilt3-fadeIn 0.2s ease}.notif-panel.svelte-1ebilt3.svelte-1ebilt3{position:fixed;top:0;right:0;height:100vh;width:420px;max-width:100vw;background:#fff;border-left:1px solid #e2e8f0;box-shadow:-8px 0 30px rgba(0, 0, 0, 0.08);z-index:90;display:flex;flex-direction:column;transform:translateX(100%);transition:transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)}.notif-panel.open.svelte-1ebilt3.svelte-1ebilt3{transform:translateX(0)}.notif-header.svelte-1ebilt3.svelte-1ebilt3{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #f1f5f9;background:linear-gradient(135deg, #f8fafc 0%, #fff 100%);flex-shrink:0}.notif-header-left.svelte-1ebilt3.svelte-1ebilt3{display:flex;align-items:center;gap:10px}.notif-header-icon.svelte-1ebilt3.svelte-1ebilt3{font-size:24px;color:#6366f1}.notif-header.svelte-1ebilt3 h3.svelte-1ebilt3{font-size:16px;font-weight:700;color:#0f172a;margin:0}.notif-badge.svelte-1ebilt3.svelte-1ebilt3{background:linear-gradient(135deg, #ef4444, #dc2626);color:#fff;font-size:11px;font-weight:700;min-width:20px;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:0 6px;animation:svelte-1ebilt3-badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)}.notif-header-actions.svelte-1ebilt3.svelte-1ebilt3{display:flex;align-items:center;gap:8px}.notif-mark-all.svelte-1ebilt3.svelte-1ebilt3{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600;color:#6366f1;background:#eef2ff;border:none;border-radius:8px;padding:6px 12px;cursor:pointer;transition:all 0.2s}.notif-mark-all.svelte-1ebilt3.svelte-1ebilt3:hover{background:#e0e7ff}.notif-mark-all.svelte-1ebilt3 .material-symbols-outlined.svelte-1ebilt3{font-size:16px}.notif-close.svelte-1ebilt3.svelte-1ebilt3{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border:none;border-radius:8px;background:transparent;color:#94a3b8;cursor:pointer;transition:all 0.15s}.notif-close.svelte-1ebilt3.svelte-1ebilt3:hover{background:#f1f5f9;color:#475569}.notif-admin-section.svelte-1ebilt3.svelte-1ebilt3{padding:16px 24px;border-bottom:1px solid #f1f5f9;flex-shrink:0}.notif-create-trigger.svelte-1ebilt3.svelte-1ebilt3{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);border:1px dashed #a5b4fc;border-radius:12px;font-size:13px;font-weight:600;color:#6366f1;cursor:pointer;transition:all 0.2s}.notif-create-trigger.svelte-1ebilt3.svelte-1ebilt3:hover{background:linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);border-color:#818cf8;transform:translateY(-1px)}.notif-create-trigger.svelte-1ebilt3 .material-symbols-outlined.svelte-1ebilt3{font-size:20px}.notif-create-form.svelte-1ebilt3.svelte-1ebilt3{display:flex;flex-direction:column;gap:12px}.notif-create-header.svelte-1ebilt3.svelte-1ebilt3{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#334155}.notif-create-header.svelte-1ebilt3 .material-symbols-outlined.svelte-1ebilt3{font-size:20px;color:#6366f1}.notif-create-title.svelte-1ebilt3.svelte-1ebilt3{letter-spacing:0.02em}.notif-input.svelte-1ebilt3.svelte-1ebilt3{width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:10px;font-size:13px;font-weight:600;color:#0f172a;background:#f8fafc;outline:none;transition:border-color 0.2s, box-shadow 0.2s;box-sizing:border-box}.notif-input.svelte-1ebilt3.svelte-1ebilt3:focus{border-color:#818cf8;box-shadow:0 0 0 3px rgba(99, 102, 241, 0.1);background:#fff}.notif-textarea.svelte-1ebilt3.svelte-1ebilt3{width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:10px;font-size:13px;color:#334155;background:#f8fafc;outline:none;resize:vertical;min-height:80px;font-family:inherit;line-height:1.6;transition:border-color 0.2s, box-shadow 0.2s;box-sizing:border-box}.notif-textarea.svelte-1ebilt3.svelte-1ebilt3:focus{border-color:#818cf8;box-shadow:0 0 0 3px rgba(99, 102, 241, 0.1);background:#fff}.notif-create-actions.svelte-1ebilt3.svelte-1ebilt3{display:flex;justify-content:flex-end;gap:8px}.notif-btn-cancel.svelte-1ebilt3.svelte-1ebilt3{padding:8px 16px;border:1px solid #e2e8f0;border-radius:8px;font-size:12px;font-weight:600;color:#64748b;background:#fff;cursor:pointer;transition:all 0.15s}.notif-btn-cancel.svelte-1ebilt3.svelte-1ebilt3:hover{background:#f1f5f9}.notif-btn-send.svelte-1ebilt3.svelte-1ebilt3{display:flex;align-items:center;gap:6px;padding:8px 18px;border:none;border-radius:8px;font-size:12px;font-weight:700;color:#fff;background:linear-gradient(135deg, #6366f1, #4f46e5);cursor:pointer;transition:all 0.2s}.notif-btn-send.svelte-1ebilt3.svelte-1ebilt3:hover:not(:disabled){background:linear-gradient(135deg, #4f46e5, #4338ca);box-shadow:0 4px 12px rgba(99, 102, 241, 0.3);transform:translateY(-1px)}.notif-btn-send.svelte-1ebilt3.svelte-1ebilt3:disabled{opacity:0.5;cursor:not-allowed}.notif-btn-send.svelte-1ebilt3 .material-symbols-outlined.svelte-1ebilt3{font-size:16px}.notif-list.svelte-1ebilt3.svelte-1ebilt3{flex:1;overflow-y:auto;padding:8px 0}.notif-loading.svelte-1ebilt3.svelte-1ebilt3{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 24px;gap:12px}.notif-loading.svelte-1ebilt3 p.svelte-1ebilt3{font-size:13px;color:#94a3b8;margin:0}.notif-empty.svelte-1ebilt3.svelte-1ebilt3{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;text-align:center}.notif-empty-icon.svelte-1ebilt3.svelte-1ebilt3{font-size:48px;color:#cbd5e1;margin-bottom:16px}.notif-empty.svelte-1ebilt3 h4.svelte-1ebilt3{font-size:15px;font-weight:700;color:#475569;margin:0 0 4px}.notif-empty.svelte-1ebilt3 p.svelte-1ebilt3{font-size:13px;color:#94a3b8;margin:0}.notif-item.svelte-1ebilt3.svelte-1ebilt3{position:relative;display:flex;gap:14px;padding:16px 24px;cursor:pointer;transition:background-color 0.15s;border-bottom:1px solid #f8fafc}.notif-item.svelte-1ebilt3.svelte-1ebilt3:hover{background:#fafbfc}.notif-item.unread.svelte-1ebilt3.svelte-1ebilt3{background:linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)}.notif-item.unread.svelte-1ebilt3.svelte-1ebilt3:hover{background:linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)}.notif-unread-dot.svelte-1ebilt3.svelte-1ebilt3{position:absolute;top:22px;left:12px;width:7px;height:7px;background:#6366f1;border-radius:50%;animation:svelte-1ebilt3-dotPulse 2s ease-in-out infinite}.notif-item-icon.svelte-1ebilt3.svelte-1ebilt3{flex-shrink:0;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center}.notif-item-icon.icon-unread.svelte-1ebilt3.svelte-1ebilt3{background:linear-gradient(135deg, #6366f1, #8b5cf6);color:#fff;box-shadow:0 4px 12px rgba(99, 102, 241, 0.3)}.notif-item-icon.icon-read.svelte-1ebilt3.svelte-1ebilt3{background:#f1f5f9;color:#94a3b8}.notif-item-icon.svelte-1ebilt3 .material-symbols-outlined.svelte-1ebilt3{font-size:20px}.notif-item-content.svelte-1ebilt3.svelte-1ebilt3{flex:1;min-width:0}.notif-item-top.svelte-1ebilt3.svelte-1ebilt3{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px}.notif-item-title.svelte-1ebilt3.svelte-1ebilt3{font-size:13px;font-weight:700;color:#0f172a;margin:0;line-height:1.3}.notif-item-time.svelte-1ebilt3.svelte-1ebilt3{font-size:11px;font-weight:500;color:#94a3b8;white-space:nowrap;flex-shrink:0}.notif-version-badge.svelte-1ebilt3.svelte-1ebilt3{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:linear-gradient(135deg, #ecfdf5, #d1fae5);border:1px solid #a7f3d0;border-radius:20px;font-size:11px;font-weight:700;color:#059669;margin:6px 0}.notif-version-badge.svelte-1ebilt3 .material-symbols-outlined.svelte-1ebilt3{font-size:14px}.notif-item-desc.svelte-1ebilt3.svelte-1ebilt3{font-size:12.5px;line-height:1.7;color:#475569;white-space:pre-line;word-wrap:break-word;margin-top:4px}.notif-item-footer.svelte-1ebilt3.svelte-1ebilt3{display:flex;align-items:center;gap:4px;margin-top:8px;font-size:11px;font-weight:500;color:#94a3b8}.notif-item-footer.svelte-1ebilt3 .material-symbols-outlined.svelte-1ebilt3{font-size:14px}.notif-spinner.svelte-1ebilt3.svelte-1ebilt3{width:14px;height:14px;border:2px solid rgba(255, 255, 255, 0.4);border-top-color:#fff;border-radius:50%;animation:svelte-1ebilt3-spin 0.6s linear infinite}.notif-spinner-lg.svelte-1ebilt3.svelte-1ebilt3{width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#6366f1;border-radius:50%;animation:svelte-1ebilt3-spin 0.7s linear infinite}@keyframes svelte-1ebilt3-fadeIn{from{opacity:0}to{opacity:1}}@keyframes svelte-1ebilt3-badgePop{from{transform:scale(0)}to{transform:scale(1)}}@keyframes svelte-1ebilt3-dotPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}@keyframes svelte-1ebilt3-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}",
  map: null
};
const NotificationPanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isNotificationOpen, $$unsubscribe_isNotificationOpen;
  let $unreadNotificationCount, $$unsubscribe_unreadNotificationCount;
  let $$unsubscribe_notifications;
  $$unsubscribe_isNotificationOpen = subscribe(isNotificationOpen, (value) => $isNotificationOpen = value);
  $$unsubscribe_unreadNotificationCount = subscribe(unreadNotificationCount, (value) => $unreadNotificationCount = value);
  $$unsubscribe_notifications = subscribe(notifications, (value) => value);
  let { user = null } = $$props;
  let { isAdmin = false } = $$props;
  let unsubscribers = [];
  onDestroy(() => {
    for (const u of unsubscribers)
      u();
    if (user?.id)
      unsubscribe([`user_${user.id}`]);
  });
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  if ($$props.isAdmin === void 0 && $$bindings.isAdmin && isAdmin !== void 0)
    $$bindings.isAdmin(isAdmin);
  $$result.css.add(css$1);
  $$unsubscribe_isNotificationOpen();
  $$unsubscribe_unreadNotificationCount();
  $$unsubscribe_notifications();
  return ` ${$isNotificationOpen ? `  <div class="notif-backdrop svelte-1ebilt3"></div>` : ``}  <div class="${"notif-panel " + escape($isNotificationOpen ? "open" : "", true) + " svelte-1ebilt3"}"> <div class="notif-header svelte-1ebilt3"><div class="notif-header-left svelte-1ebilt3"><span class="material-symbols-outlined notif-header-icon svelte-1ebilt3" data-svelte-h="svelte-u6qdkp">notifications</span> <h3 class="svelte-1ebilt3" data-svelte-h="svelte-4prx8y">Notifications</h3> ${$unreadNotificationCount > 0 ? `<span class="notif-badge svelte-1ebilt3">${escape($unreadNotificationCount)}</span>` : ``}</div> <div class="notif-header-actions svelte-1ebilt3">${$unreadNotificationCount > 0 ? `<button class="notif-mark-all svelte-1ebilt3" data-svelte-h="svelte-xgzze9"><span class="material-symbols-outlined svelte-1ebilt3">done_all</span>
					Mark all read</button>` : ``} <button class="notif-close svelte-1ebilt3" data-svelte-h="svelte-1ratrgl"><span class="material-symbols-outlined">close</span></button></div></div>  ${isAdmin ? `<div class="notif-admin-section svelte-1ebilt3">${`<button class="notif-create-trigger svelte-1ebilt3" data-svelte-h="svelte-1wxurs2"><span class="material-symbols-outlined svelte-1ebilt3">add_circle</span>
					New Version Update</button>`}</div>` : ``}  <div class="notif-list custom-scrollbar svelte-1ebilt3">${`<div class="notif-loading svelte-1ebilt3" data-svelte-h="svelte-oghbm4"><div class="notif-spinner-lg svelte-1ebilt3"></div> <p class="svelte-1ebilt3">Loading notifications...</p></div>`}</div> </div>`;
});
const ChatPanel_svelte_svelte_type_style_lang = "";
const css = {
  code: ".chat-backdrop.svelte-1qsl548.svelte-1qsl548{position:fixed;inset:0;background:rgba(15, 23, 42, 0.4);backdrop-filter:blur(6px);z-index:998;border:none;cursor:default;animation:svelte-1qsl548-fadeInBackdrop 0.3s ease}@keyframes svelte-1qsl548-fadeInBackdrop{from{opacity:0}to{opacity:1}}.chat-panel.svelte-1qsl548.svelte-1qsl548{position:fixed;top:16px;right:16px;bottom:16px;width:440px;max-width:calc(100vw - 32px);background:rgba(255, 255, 255, 0.95);backdrop-filter:blur(24px);border-radius:28px;border:1px solid rgba(255, 255, 255, 0.6);box-shadow:0 24px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.5);z-index:999;display:flex;flex-direction:column;animation:svelte-1qsl548-slideInRightFloat 0.4s cubic-bezier(0.16, 1, 0.3, 1);overflow:hidden}@keyframes svelte-1qsl548-slideInRightFloat{from{transform:translateX(120%) scale(0.95);opacity:0}to{transform:translateX(0) scale(1);opacity:1}}.chat-panel-header.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid rgba(226, 232, 240, 0.6);background:rgba(255, 255, 255, 0.8);flex-shrink:0;z-index:10}.chat-panel-header-left.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:center;gap:16px;min-width:0}.chat-panel-header-right.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:center;gap:8px;flex-shrink:0}.chat-panel-header.svelte-1qsl548 h2.svelte-1qsl548{font-size:1.15rem;font-weight:700;color:#0f172a;margin:0;white-space:nowrap;letter-spacing:-0.01em}.chat-header-icon.svelte-1qsl548.svelte-1qsl548{font-size:24px;color:var(--primary, #3b82f6);background:rgba(59, 130, 246, 0.1);padding:8px;border-radius:12px}.chat-icon-btn.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;border:none;background:transparent;color:#64748b;cursor:pointer;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1)}.chat-icon-btn.svelte-1qsl548.svelte-1qsl548:hover{background:#f1f5f9;color:#0f172a;transform:translateY(-1px)}.chat-icon-btn.svelte-1qsl548.svelte-1qsl548:active{transform:scale(0.95)}.chat-icon-btn.svelte-1qsl548 .material-symbols-outlined.svelte-1qsl548{font-size:22px}.chat-header-user.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:center;gap:14px;min-width:0}.chat-header-name.svelte-1qsl548.svelte-1qsl548{font-size:1rem;font-weight:700;color:#0f172a;margin:0 0 2px 0;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.chat-panel-body.svelte-1qsl548.svelte-1qsl548{flex:1;overflow:hidden;display:flex;flex-direction:column;background:#f8fafc}.chat-empty-state.svelte-1qsl548.svelte-1qsl548{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 32px;gap:12px;flex:1;text-align:center}.chat-empty-icon.svelte-1qsl548.svelte-1qsl548{font-size:64px;color:#cbd5e1;margin-bottom:8px;animation:svelte-1qsl548-floating 3s ease-in-out infinite}@keyframes svelte-1qsl548-floating{0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)}}.chat-empty-title.svelte-1qsl548.svelte-1qsl548{font-size:1.15rem;font-weight:700;color:#334155;margin:0}.chat-empty-subtitle.svelte-1qsl548.svelte-1qsl548{font-size:0.95rem;color:#94a3b8;margin:0;max-width:80%}.chat-start-btn.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:center;gap:8px;margin-top:16px;padding:12px 24px;background:var(--primary, #3b82f6);color:white;border:none;border-radius:14px;font-size:0.95rem;font-weight:600;cursor:pointer;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);box-shadow:0 4px 14px rgba(0, 0, 0, 0.12)}.chat-start-btn.svelte-1qsl548.svelte-1qsl548:hover{filter:brightness(1.05);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0, 0, 0, 0.15)}.chat-start-btn.svelte-1qsl548.svelte-1qsl548:active{transform:scale(0.97)}.chat-spinner.svelte-1qsl548.svelte-1qsl548{width:40px;height:40px;border:4px solid #e2e8f0;border-top-color:var(--primary, #3b82f6);border-radius:50%;animation:svelte-1qsl548-chatSpin 0.7s linear infinite}@keyframes svelte-1qsl548-chatSpin{to{transform:rotate(360deg)}}.chat-avatar.svelte-1qsl548.svelte-1qsl548{width:56px;height:56px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;color:white;background:#94a3b8;flex-shrink:0;position:relative;overflow:visible;box-shadow:0 2px 8px rgba(0,0,0,0.06);transition:transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)}.chat-avatar.svelte-1qsl548 img.svelte-1qsl548{width:100%;height:100%;object-fit:cover;border-radius:inherit}.chat-avatar-sm.svelte-1qsl548.svelte-1qsl548,.chat-msg-avatar-sm.svelte-1qsl548.svelte-1qsl548{width:40px;height:40px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;color:white;background:#94a3b8;flex-shrink:0;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.08)}.chat-msg-avatar-sm.svelte-1qsl548.svelte-1qsl548{width:32px;height:32px;border-radius:10px;font-size:0.75rem;margin-top:auto;margin-bottom:2px}.role-dokter-avatar.svelte-1qsl548.svelte-1qsl548{background:linear-gradient(135deg, #3b82f6, #1d4ed8)}.role-kasir-avatar.svelte-1qsl548.svelte-1qsl548{background:linear-gradient(135deg, #10b981, #047857)}.role-admin-avatar.svelte-1qsl548.svelte-1qsl548{background:linear-gradient(135deg, #6366f1, #4338ca)}.chat-role-dot.svelte-1qsl548.svelte-1qsl548{position:absolute;bottom:-2px;right:-2px;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.1)}.role-dokter-dot.svelte-1qsl548.svelte-1qsl548{background:#3b82f6}.role-kasir-dot.svelte-1qsl548.svelte-1qsl548{background:#10b981}.role-admin-dot.svelte-1qsl548.svelte-1qsl548{background:#6366f1}.chat-role-badge.svelte-1qsl548.svelte-1qsl548{display:inline-block;padding:2px 10px;border-radius:8px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em}.role-dokter-badge.svelte-1qsl548.svelte-1qsl548{background:#dbeafe;color:#1d4ed8}.role-kasir-badge.svelte-1qsl548.svelte-1qsl548{background:#d1fae5;color:#047857}.role-admin-badge.svelte-1qsl548.svelte-1qsl548{background:#e0e7ff;color:#4338ca}.chat-conversation-list.svelte-1qsl548.svelte-1qsl548{overflow-y:auto;flex:1;padding:12px}.chat-conversation-item.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:center;gap:16px;padding:16px;margin-bottom:6px;border:none;border-radius:20px;background:transparent;width:100%;text-align:left;cursor:pointer;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1)}.chat-conversation-item.svelte-1qsl548.svelte-1qsl548:hover{background:white;box-shadow:0 6px 16px rgba(0,0,0,0.04);transform:translateY(-2px)}.chat-conversation-item.svelte-1qsl548:hover .chat-avatar.svelte-1qsl548{transform:scale(1.05)}.chat-conversation-item.has-unread.svelte-1qsl548.svelte-1qsl548{background:white;box-shadow:0 4px 12px rgba(0,0,0,0.05)}.chat-conversation-item.has-unread.svelte-1qsl548.svelte-1qsl548:hover{box-shadow:0 8px 24px rgba(0,0,0,0.08)}.chat-conversation-info.svelte-1qsl548.svelte-1qsl548{flex:1;min-width:0}.chat-conversation-top.svelte-1qsl548.svelte-1qsl548{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px}.chat-conversation-name.svelte-1qsl548.svelte-1qsl548{font-size:1rem;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.chat-conversation-time.svelte-1qsl548.svelte-1qsl548{font-size:0.75rem;color:#94a3b8;font-weight:500;flex-shrink:0}.has-unread.svelte-1qsl548 .chat-conversation-time.svelte-1qsl548{color:var(--primary, #3b82f6);font-weight:700}.chat-conversation-bottom.svelte-1qsl548.svelte-1qsl548{display:flex;justify-content:space-between;align-items:center;gap:12px}.chat-conversation-preview.svelte-1qsl548.svelte-1qsl548{font-size:0.9rem;color:#64748b;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}.has-unread.svelte-1qsl548 .chat-conversation-preview.svelte-1qsl548{color:#1e293b;font-weight:600}.chat-you.svelte-1qsl548.svelte-1qsl548{color:#94a3b8;font-weight:500}.chat-no-msg.svelte-1qsl548.svelte-1qsl548{color:#cbd5e1;font-style:italic}.chat-unread-badge.svelte-1qsl548.svelte-1qsl548{background:var(--primary, #3b82f6);color:white;font-size:0.75rem;font-weight:700;min-width:24px;height:24px;border-radius:12px;display:flex;align-items:center;justify-content:center;padding:0 6px;flex-shrink:0;box-shadow:0 4px 10px rgba(59, 130, 246, 0.4);animation:svelte-1qsl548-pulseBadge 2s infinite}@keyframes svelte-1qsl548-pulseBadge{0%{box-shadow:0 0 0 0 rgba(59, 130, 246, 0.4)}70%{box-shadow:0 0 0 8px rgba(59, 130, 246, 0)}100%{box-shadow:0 0 0 0 rgba(59, 130, 246, 0)}}.chat-search-wrapper.svelte-1qsl548.svelte-1qsl548{position:relative;padding:16px 24px 8px;flex-shrink:0;background:#f8fafc}.chat-search-icon.svelte-1qsl548.svelte-1qsl548{position:absolute;left:40px;top:55%;transform:translateY(-50%);font-size:22px;color:#64748b}.chat-search-input.svelte-1qsl548.svelte-1qsl548{width:100%;padding:14px 16px 14px 48px;border:1px solid rgba(226, 232, 240, 0.8);border-radius:16px;font-size:0.95rem;outline:none;background:white;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);font-family:inherit;color:#0f172a;box-shadow:0 2px 6px rgba(0,0,0,0.02)}.chat-search-input.svelte-1qsl548.svelte-1qsl548:focus{border-color:var(--primary, #3b82f6);box-shadow:0 0 0 4px rgba(59,130,246,0.15)}.chat-user-list.svelte-1qsl548.svelte-1qsl548{overflow-y:auto;flex:1;padding:12px}.chat-user-item.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:center;gap:16px;padding:14px 16px;margin-bottom:6px;border:none;border-radius:20px;background:transparent;width:100%;text-align:left;cursor:pointer;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1)}.chat-user-item.svelte-1qsl548.svelte-1qsl548:hover{background:white;box-shadow:0 6px 16px rgba(0,0,0,0.04);transform:translateY(-2px)}.chat-user-info.svelte-1qsl548.svelte-1qsl548{display:flex;flex-direction:column;align-items:flex-start;gap:6px}.chat-user-name.svelte-1qsl548.svelte-1qsl548{font-size:1rem;font-weight:700;color:#0f172a}.chat-messages.svelte-1qsl548.svelte-1qsl548{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:20px;scroll-behavior:smooth}.chat-messages.svelte-1qsl548.svelte-1qsl548::-webkit-scrollbar{width:6px}.chat-messages.svelte-1qsl548.svelte-1qsl548::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:6px}.chat-messages.svelte-1qsl548.svelte-1qsl548::-webkit-scrollbar-thumb:hover{background:#94a3b8}.chat-date-sep.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:center;justify-content:center;margin:16px 0 8px}.chat-date-sep.svelte-1qsl548 span.svelte-1qsl548{background:rgba(226, 232, 240, 0.7);color:#475569;font-size:0.75rem;font-weight:600;padding:6px 16px;border-radius:12px;backdrop-filter:blur(4px)}.chat-message.svelte-1qsl548.svelte-1qsl548{display:flex;gap:12px;max-width:85%;animation:svelte-1qsl548-msgPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;opacity:0;transform:translateY(16px) scale(0.95)}@keyframes svelte-1qsl548-msgPopIn{to{opacity:1;transform:translateY(0) scale(1)}}.chat-message-self.svelte-1qsl548.svelte-1qsl548{align-self:flex-end;flex-direction:row-reverse}.chat-message-other.svelte-1qsl548.svelte-1qsl548{align-self:flex-start}.chat-bubble.svelte-1qsl548.svelte-1qsl548{padding:14px 18px;border-radius:20px;max-width:100%;word-wrap:break-word;position:relative;box-shadow:0 4px 6px rgba(0,0,0,0.02)}.chat-bubble-self.svelte-1qsl548.svelte-1qsl548{background:var(--primary, #3b82f6);color:white;border-bottom-right-radius:4px;box-shadow:0 6px 16px rgba(0,0,0,0.1)}.chat-bubble-other.svelte-1qsl548.svelte-1qsl548{background:white;color:#0f172a;border-bottom-left-radius:4px;border:1px solid rgba(226, 232, 240, 0.6);box-shadow:0 4px 12px rgba(0,0,0,0.03)}.chat-bubble-text.svelte-1qsl548.svelte-1qsl548{margin:0;font-size:0.95rem;line-height:1.5;white-space:pre-wrap}.chat-bubble-meta.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-top:6px}.chat-bubble-time.svelte-1qsl548.svelte-1qsl548{font-size:0.7rem;opacity:0.75;font-weight:500}.chat-read-icon.svelte-1qsl548.svelte-1qsl548{font-size:16px;opacity:0.6}.chat-read-icon.is-read.svelte-1qsl548.svelte-1qsl548{opacity:1;color:#fff;filter:drop-shadow(0 0 2px rgba(255,255,255,0.4))}.chat-bubble-other.svelte-1qsl548 .chat-read-icon.is-read.svelte-1qsl548{color:var(--primary, #3b82f6)}.chat-input-wrapper.svelte-1qsl548.svelte-1qsl548{padding:16px 24px 20px;background:rgba(255, 255, 255, 0.9);border-top:1px solid rgba(226, 232, 240, 0.6);flex-shrink:0;z-index:10}.chat-input-box.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:flex-end;gap:12px;background:white;border:1px solid rgba(226, 232, 240, 0.8);border-radius:24px;padding:8px 8px 8px 20px;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);box-shadow:0 4px 12px rgba(0,0,0,0.04)}.chat-textarea.svelte-1qsl548.svelte-1qsl548{flex:1;border:none;outline:none;font-size:0.95rem;font-family:inherit;resize:none;max-height:120px;padding:12px 0;line-height:1.5;background:transparent;color:#0f172a}.chat-textarea.svelte-1qsl548.svelte-1qsl548:focus{outline:none !important;box-shadow:none !important;border:none !important}.chat-textarea.svelte-1qsl548.svelte-1qsl548::placeholder{color:#94a3b8}.chat-send-btn.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:18px;border:none;background:var(--primary, #3b82f6);color:white;cursor:pointer;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);flex-shrink:0;box-shadow:0 4px 12px rgba(59,130,246,0.3)}.chat-send-btn.svelte-1qsl548.svelte-1qsl548:hover:not(:disabled){filter:brightness(1.08);transform:scale(1.05) rotate(-8deg);box-shadow:0 8px 20px rgba(59,130,246,0.4)}.chat-send-btn.svelte-1qsl548.svelte-1qsl548:active:not(:disabled){transform:scale(0.95)}.chat-send-btn.svelte-1qsl548.svelte-1qsl548:disabled{background:#e2e8f0;color:#94a3b8;cursor:not-allowed;box-shadow:none}.chat-send-btn.svelte-1qsl548 .material-symbols-outlined.svelte-1qsl548{font-size:20px;margin-left:2px}.chat-online-dot.svelte-1qsl548.svelte-1qsl548{position:absolute;bottom:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 0 0 1px rgba(16, 185, 129, 0.3);animation:svelte-1qsl548-onlineDotPulse 2s infinite}@keyframes svelte-1qsl548-onlineDotPulse{0%{box-shadow:0 0 0 0 rgba(16, 185, 129, 0.4)}70%{box-shadow:0 0 0 6px rgba(16, 185, 129, 0)}100%{box-shadow:0 0 0 0 rgba(16, 185, 129, 0)}}.chat-online-pill.svelte-1qsl548.svelte-1qsl548{display:inline-flex;align-items:center;gap:6px;background:rgba(16, 185, 129, 0.1);color:#047857;padding:3px 8px;border-radius:12px;font-size:0.65rem;font-weight:700;letter-spacing:0.02em}.chat-online-pulse.svelte-1qsl548.svelte-1qsl548{width:6px;height:6px;background:#10b981;border-radius:50%;animation:svelte-1qsl548-smallPulse 2s infinite}@keyframes svelte-1qsl548-smallPulse{0%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}100%{opacity:1;transform:scale(1)}}.chat-read-icon.svelte-1qsl548.svelte-1qsl548{font-size:14px;opacity:0.8}.chat-broadcast-view.svelte-1qsl548.svelte-1qsl548{flex:1;display:flex;flex-direction:column;background:#f8fafc}.chat-broadcast-header.svelte-1qsl548.svelte-1qsl548{padding:24px 24px 12px}.chat-broadcast-banner.svelte-1qsl548.svelte-1qsl548{display:flex;gap:12px;background:#eff6ff;border:1px solid #bfdbfe;padding:16px;border-radius:16px;color:#1e40af}.chat-broadcast-banner.svelte-1qsl548 span.svelte-1qsl548{font-size:20px;color:#3b82f6;flex-shrink:0}.chat-broadcast-banner.svelte-1qsl548 p.svelte-1qsl548{margin:0;font-size:0.85rem;line-height:1.5}.chat-broadcast-body.svelte-1qsl548.svelte-1qsl548{flex:1;padding:0 24px 24px;display:flex;flex-direction:column;gap:20px}.chat-broadcast-textarea.svelte-1qsl548.svelte-1qsl548{flex:1;width:100%;padding:20px;border:1px solid #e2e8f0;border-radius:20px;font-size:1rem;font-family:inherit;resize:none;outline:none;background:white;color:#0f172a;transition:all 0.2s}.chat-broadcast-textarea.svelte-1qsl548.svelte-1qsl548:focus{border-color:#3b82f6;box-shadow:0 0 0 4px rgba(59, 130, 246, 0.1)}.chat-broadcast-send-btn.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:16px;background:#3b82f6;color:white;border:none;border-radius:16px;font-size:1rem;font-weight:700;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 12px rgba(59, 130, 246, 0.3)}.chat-broadcast-send-btn.svelte-1qsl548.svelte-1qsl548:hover:not(:disabled){background:#2563eb;transform:translateY(-2px);box-shadow:0 8px 20px rgba(59, 130, 246, 0.4)}.chat-broadcast-send-btn.svelte-1qsl548.svelte-1qsl548:disabled{background:#cbd5e1;color:#94a3b8;cursor:not-allowed;box-shadow:none}.chat-status-msg.svelte-1qsl548.svelte-1qsl548{display:flex;align-items:center;gap:8px;padding:12px;border-radius:12px;font-size:0.9rem;font-weight:600}.chat-status-msg.success.svelte-1qsl548.svelte-1qsl548{background:#ecfdf5;color:#059669}.chat-status-msg.error.svelte-1qsl548.svelte-1qsl548{background:#fef2f2;color:#dc2626}.chat-spinner-sm.svelte-1qsl548.svelte-1qsl548{width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:svelte-1qsl548-chatSpin 0.6s linear infinite}",
  map: null
};
function timeAgo(dateStr) {
  if (!dateStr)
    return "";
  const now = /* @__PURE__ */ new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 6e4);
  const diffHr = Math.floor(diffMs / 36e5);
  const diffDay = Math.floor(diffMs / 864e5);
  if (diffMin < 1)
    return "Just now";
  if (diffMin < 60)
    return `${diffMin}m ago`;
  if (diffHr < 24)
    return `${diffHr}h ago`;
  if (diffDay < 7)
    return `${diffDay}d ago`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
function formatTime(dateStr) {
  if (!dateStr)
    return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}
function formatDateSeparator(dateStr) {
  const date = new Date(dateStr);
  const today = /* @__PURE__ */ new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString())
    return "Today";
  if (date.toDateString() === yesterday.toDateString())
    return "Yesterday";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}
function getInitials(name) {
  if (!name)
    return "?";
  return name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();
}
const ChatPanel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let filteredUsers;
  let $chatView, $$unsubscribe_chatView;
  let $$unsubscribe_unreadCount;
  let $isChatOpen, $$unsubscribe_isChatOpen;
  $$unsubscribe_chatView = subscribe(chatView, (value) => $chatView = value);
  $$unsubscribe_unreadCount = subscribe(unreadCount, (value) => value);
  $$unsubscribe_isChatOpen = subscribe(isChatOpen, (value) => $isChatOpen = value);
  let { user = null } = $$props;
  let conversations = [];
  let chatUsers = [];
  let messages = [];
  let activeConversation = null;
  let messageInput = "";
  let searchQuery = "";
  let loadingConversations = false;
  let sending = false;
  let messagesContainer;
  let broadcastMessage = "";
  let broadcasting = false;
  let broadcastStatus = "";
  const rtUnsubscribers = [];
  let wasChatOpen = false;
  onDestroy(() => {
    for (const u of rtUnsubscribers)
      u();
    if (user?.id)
      unsubscribe([`user_${user.id}`]);
    if (activeConversation)
      unsubscribe([`conversation_${activeConversation.id}`]);
  });
  function onPanelOpen() {
    fetchConversations();
  }
  function onPanelClose() {
    if (activeConversation) {
      unsubscribe([`conversation_${activeConversation.id}`]);
    }
    set_store_value(chatView, $chatView = "conversations", $chatView);
    activeConversation = null;
    messages = [];
  }
  async function fetchConversations() {
    try {
      loadingConversations = conversations.length === 0;
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        conversations = data.conversations;
      }
    } catch (e) {
    } finally {
      loadingConversations = false;
    }
  }
  function shouldShowDateSeparator(idx) {
    if (idx === 0)
      return true;
    const curr = new Date(messages[idx].created_at).toDateString();
    const prev = new Date(messages[idx - 1].created_at).toDateString();
    return curr !== prev;
  }
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  $$result.css.add(css);
  {
    {
      const isOpen = $isChatOpen;
      if (isOpen && !wasChatOpen) {
        onPanelOpen();
      } else if (!isOpen && wasChatOpen) {
        onPanelClose();
      }
      wasChatOpen = isOpen;
    }
  }
  filteredUsers = chatUsers;
  $$unsubscribe_chatView();
  $$unsubscribe_unreadCount();
  $$unsubscribe_isChatOpen();
  return `${$isChatOpen ? `  <div class="chat-backdrop svelte-1qsl548" aria-label="Close chat"></div>  <div class="chat-panel svelte-1qsl548"> <div class="chat-panel-header svelte-1qsl548">${$chatView === "conversations" ? `<div class="chat-panel-header-left svelte-1qsl548" data-svelte-h="svelte-qqzopf"><span class="material-symbols-outlined chat-header-icon svelte-1qsl548">chat</span> <h2 class="svelte-1qsl548">Messages</h2></div> <div class="chat-panel-header-right svelte-1qsl548">${user?.role === "admin" ? `<button class="chat-icon-btn svelte-1qsl548" title="Broadcast Message" style="color: var(--primary, #3b82f6)" data-svelte-h="svelte-lq9sml"><span class="material-symbols-outlined svelte-1qsl548">campaign</span></button>` : ``} <button class="chat-icon-btn svelte-1qsl548" title="Search Users" data-svelte-h="svelte-1kgped1"><span class="material-symbols-outlined svelte-1qsl548">search</span></button> <button class="chat-icon-btn svelte-1qsl548" title="Close" data-svelte-h="svelte-1kyefz3"><span class="material-symbols-outlined svelte-1qsl548">close</span></button></div>` : `${$chatView === "newChat" || $chatView === "broadcast" ? `<div class="chat-panel-header-left svelte-1qsl548"><button class="chat-icon-btn svelte-1qsl548" title="Back" data-svelte-h="svelte-1hz7r1n"><span class="material-symbols-outlined svelte-1qsl548">arrow_back</span></button> <h2 class="svelte-1qsl548">${escape($chatView === "broadcast" ? "Broadcast Message" : "New Chat")}</h2></div> <div class="chat-panel-header-right svelte-1qsl548"><button class="chat-icon-btn svelte-1qsl548" title="Close" data-svelte-h="svelte-1kyefz3"><span class="material-symbols-outlined svelte-1qsl548">close</span></button></div>` : `<div class="chat-panel-header-left svelte-1qsl548"><button class="chat-icon-btn svelte-1qsl548" title="Back" data-svelte-h="svelte-dzsx6p"><span class="material-symbols-outlined svelte-1qsl548">arrow_back</span></button> ${activeConversation?.otherUser ? `<div class="chat-header-user svelte-1qsl548"><div class="${[
    "chat-avatar-sm svelte-1qsl548",
    (activeConversation.otherUser.role === "dokter" ? "role-dokter-avatar" : "") + " " + (activeConversation.otherUser.role === "kasir" ? "role-kasir-avatar" : "")
  ].join(" ").trim()}">${activeConversation.otherUser.profile_image_url ? `<img${add_attribute("src", activeConversation.otherUser.profile_image_url, 0)}${add_attribute("alt", activeConversation.otherUser.name, 0)}>` : `${escape(getInitials(activeConversation.otherUser.name))}`}</div> <div style="display: flex; flex-direction: column; gap: 4px;"><div style="display: flex; align-items: center; gap: 8px;"><p class="chat-header-name svelte-1qsl548">${escape(activeConversation.otherUser.name)}</p> ${activeConversation.otherUser.is_online ? `<div class="chat-online-pill svelte-1qsl548" data-svelte-h="svelte-1d2dxay"><span class="chat-online-pulse svelte-1qsl548"></span>
											Online</div>` : ``}</div> <div><span class="${[
    "chat-role-badge svelte-1qsl548",
    (activeConversation.otherUser.role === "dokter" ? "role-dokter-badge" : "") + " " + (activeConversation.otherUser.role === "kasir" ? "role-kasir-badge" : "") + " " + (activeConversation.otherUser.role === "admin" ? "role-admin-badge" : "")
  ].join(" ").trim()}">${escape(activeConversation.otherUser.role === "dokter" ? "Dokter" : activeConversation.otherUser.role === "admin" ? "Admin" : "Kasir")}</span></div></div></div>` : ``}</div> <div class="chat-panel-header-right svelte-1qsl548"><button class="chat-icon-btn svelte-1qsl548" title="Close" data-svelte-h="svelte-yk7ndh"><span class="material-symbols-outlined svelte-1qsl548">close</span></button></div>`}`}</div>  <div class="chat-panel-body svelte-1qsl548">${$chatView === "conversations" ? ` ${loadingConversations ? `<div class="chat-empty-state svelte-1qsl548" data-svelte-h="svelte-1bzlrh5"><div class="chat-spinner svelte-1qsl548"></div> <p>Loading conversations...</p></div>` : `${conversations.length === 0 ? `<div class="chat-empty-state svelte-1qsl548"><span class="material-symbols-outlined chat-empty-icon svelte-1qsl548" data-svelte-h="svelte-62e0jw">forum</span> <p class="chat-empty-title svelte-1qsl548" data-svelte-h="svelte-jzslmx">No conversations yet</p> <p class="chat-empty-subtitle svelte-1qsl548" data-svelte-h="svelte-130js0d">Start a new chat with your team</p> <button class="chat-start-btn svelte-1qsl548" data-svelte-h="svelte-qwwnqf"><span class="material-symbols-outlined">add</span>
							New Chat</button></div>` : `<div class="chat-conversation-list svelte-1qsl548">${each(conversations, (conv) => {
    return `<button class="${[
      "chat-conversation-item svelte-1qsl548",
      conv.unreadCount > 0 ? "has-unread" : ""
    ].join(" ").trim()}"><div class="${[
      "chat-avatar svelte-1qsl548",
      (conv.otherUser?.role === "dokter" ? "role-dokter-avatar" : "") + " " + (conv.otherUser?.role === "kasir" ? "role-kasir-avatar" : "") + " " + (conv.otherUser?.role === "admin" ? "role-admin-avatar" : "")
    ].join(" ").trim()}">${conv.otherUser?.profile_image_url ? `<img${add_attribute("src", conv.otherUser.profile_image_url, 0)}${add_attribute("alt", conv.otherUser?.name, 0)} class="svelte-1qsl548">` : `${escape(getInitials(conv.otherUser?.name))}`} ${conv.otherUser?.is_online ? `<span class="chat-online-dot svelte-1qsl548"></span>` : `<span class="${[
      "chat-role-dot svelte-1qsl548",
      (conv.otherUser?.role === "dokter" ? "role-dokter-dot" : "") + " " + (conv.otherUser?.role === "kasir" ? "role-kasir-dot" : "") + " " + (conv.otherUser?.role === "admin" ? "role-admin-dot" : "")
    ].join(" ").trim()}"></span>`}</div> <div class="chat-conversation-info svelte-1qsl548"><div class="chat-conversation-top svelte-1qsl548"><span class="chat-conversation-name svelte-1qsl548">${escape(conv.otherUser?.name || "Unknown")}</span> <span class="chat-conversation-time svelte-1qsl548">${escape(timeAgo(conv.lastMessage?.created_at || conv.created_at))}</span></div> <div class="chat-conversation-bottom svelte-1qsl548"><p class="chat-conversation-preview svelte-1qsl548">${conv.lastMessage ? `${conv.lastMessage.sender_id === user?.id ? `<span class="chat-you svelte-1qsl548" data-svelte-h="svelte-zqp5ug">You: </span>` : ``}${escape(conv.lastMessage.content)}` : `<span class="chat-no-msg svelte-1qsl548" data-svelte-h="svelte-7ul4bu">No messages yet</span>`}</p> ${conv.unreadCount > 0 ? `<span class="chat-unread-badge svelte-1qsl548">${escape(conv.unreadCount)}</span>` : ``} </div></div> </button>`;
  })}</div>`}`}` : `${$chatView === "broadcast" ? `<div class="chat-broadcast-view svelte-1qsl548"><div class="chat-broadcast-header svelte-1qsl548" data-svelte-h="svelte-7bbnfd"><div class="chat-broadcast-banner svelte-1qsl548"><span class="material-symbols-outlined svelte-1qsl548">info</span> <p class="svelte-1qsl548">This message will be sent to <strong>every active user</strong> in the platform as a private chat message from you.</p></div></div> <div class="chat-broadcast-body svelte-1qsl548"><textarea class="chat-broadcast-textarea svelte-1qsl548" placeholder="Type your announcement here..." ${""}>${escape("")}</textarea> ${`${``}`} <button class="chat-broadcast-send-btn svelte-1qsl548" ${!broadcastMessage.trim() || broadcasting || broadcastStatus === "success" ? "disabled" : ""}>${`<span class="material-symbols-outlined" data-svelte-h="svelte-v7iifd">send</span>
								Send to Everyone`}</button></div></div>` : `${$chatView === "newChat" ? ` <div class="chat-search-wrapper svelte-1qsl548"><span class="material-symbols-outlined chat-search-icon svelte-1qsl548" data-svelte-h="svelte-1r59eqs">search</span> <input class="chat-search-input svelte-1qsl548" placeholder="Search by name..." type="text"${add_attribute("value", searchQuery, 0)}></div> ${`${filteredUsers.length === 0 ? `<div class="chat-empty-state svelte-1qsl548" data-svelte-h="svelte-1yt054v"><span class="material-symbols-outlined chat-empty-icon svelte-1qsl548">person_off</span> <p class="chat-empty-title svelte-1qsl548">No users found</p></div>` : `<div class="chat-user-list svelte-1qsl548">${each(filteredUsers, (u) => {
    return `<button class="chat-user-item svelte-1qsl548"><div class="${[
      "chat-avatar svelte-1qsl548",
      (u.role === "dokter" ? "role-dokter-avatar" : "") + " " + (u.role === "kasir" ? "role-kasir-avatar" : "")
    ].join(" ").trim()}">${u.profile_image_url ? `<img${add_attribute("src", u.profile_image_url, 0)}${add_attribute("alt", u.name, 0)} class="svelte-1qsl548">` : `${escape(getInitials(u.name))}`} ${u.is_online ? `<span class="chat-online-dot svelte-1qsl548"></span>` : ``}</div> <div class="chat-user-info svelte-1qsl548"><span class="chat-user-name svelte-1qsl548">${escape(u.name)}</span> <span class="${[
      "chat-role-badge svelte-1qsl548",
      (u.role === "dokter" ? "role-dokter-badge" : "") + " " + (u.role === "kasir" ? "role-kasir-badge" : "") + " " + (u.role === "admin" ? "role-admin-badge" : "")
    ].join(" ").trim()}">${escape(u.role === "dokter" ? "Dokter" : u.role === "admin" ? "Admin" : "Kasir")} </span></div> </button>`;
  })}</div>`}`}` : ` <div class="chat-messages svelte-1qsl548"${add_attribute("this", messagesContainer, 0)}>${`${messages.length === 0 ? `<div class="chat-empty-state svelte-1qsl548" data-svelte-h="svelte-1xvtefe"><span class="material-symbols-outlined chat-empty-icon svelte-1qsl548">waving_hand</span> <p class="chat-empty-title svelte-1qsl548">Say hello!</p> <p class="chat-empty-subtitle svelte-1qsl548">Start the conversation</p></div>` : `${each(messages, (msg, idx) => {
    return `${shouldShowDateSeparator(idx) ? `<div class="chat-date-sep svelte-1qsl548"><span class="svelte-1qsl548">${escape(formatDateSeparator(msg.created_at))}</span> </div>` : ``} <div class="${[
      "chat-message svelte-1qsl548",
      (msg.sender_id === user?.id ? "chat-message-self" : "") + " " + (msg.sender_id !== user?.id ? "chat-message-other" : "")
    ].join(" ").trim()}">${msg.sender_id !== user?.id ? `<div class="${[
      "chat-msg-avatar-sm svelte-1qsl548",
      (msg.sender_role === "dokter" ? "role-dokter-avatar" : "") + " " + (msg.sender_role === "kasir" ? "role-kasir-avatar" : "") + " " + (msg.sender_role === "admin" ? "role-admin-avatar" : "")
    ].join(" ").trim()}">${msg.sender_profile_image_url ? `<img${add_attribute("src", msg.sender_profile_image_url, 0)}${add_attribute("alt", msg.sender_name, 0)}>` : `${escape(getInitials(msg.sender_name))}`} </div>` : ``} <div class="${[
      "chat-bubble svelte-1qsl548",
      (msg.sender_id === user?.id ? "chat-bubble-self" : "") + " " + (msg.sender_id !== user?.id ? "chat-bubble-other" : "")
    ].join(" ").trim()}"><p class="chat-bubble-text svelte-1qsl548">${escape(msg.content)}</p> <div class="chat-bubble-meta svelte-1qsl548"><span class="chat-bubble-time svelte-1qsl548">${escape(formatTime(msg.created_at))}</span> ${msg.sender_id === user?.id ? `<span class="${[
      "material-symbols-outlined chat-read-icon svelte-1qsl548",
      msg.read_at ? "is-read" : ""
    ].join(" ").trim()}">${escape(msg.read_at ? "done_all" : "done")} </span>` : ``} </div></div> </div>`;
  })}`}`}</div>  <div class="chat-input-wrapper svelte-1qsl548"><div class="chat-input-box svelte-1qsl548"><textarea class="chat-textarea svelte-1qsl548" placeholder="Type a message..." rows="1" ${""}>${escape("")}</textarea> <button class="chat-send-btn svelte-1qsl548" ${!messageInput.trim() || sending ? "disabled" : ""} title="Send"><span class="material-symbols-outlined svelte-1qsl548">${escape("send")}</span></button></div></div>`}`}`}</div></div>` : ``}`;
});
export {
  ChatPanel as C,
  NotificationPanel as N,
  ProfileModal as P,
  Toast as T,
  isChatOpen as a,
  unreadCount as b,
  chatView as c,
  connectionStatus as d,
  isNotificationOpen as i,
  unreadNotificationCount as u
};
