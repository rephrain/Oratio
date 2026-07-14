import { c as create_ssr_component, a as subscribe, f as escape, v as validate_component, g as add_attribute } from './ssr-4a5a9ccc.js';
import { i as isNotificationOpen, u as unreadNotificationCount, c as chatView, a as isChatOpen, b as unreadCount, T as Toast, P as ProfileModal, N as NotificationPanel, C as ChatPanel } from './ChatPanel-94d905bd.js';
import { p as page } from './stores-468b91fe.js';
import { i as isProfileModalOpen } from './layout-3873cafe.js';
import { C as ConnectionStatus } from './ConnectionStatus-cec34f96.js';
import './toast-4413a763.js';
import './index2-bd557b7d.js';

const css = {
  code: ".custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}.dark .custom-scrollbar::-webkit-scrollbar-thumb{background:#334155}.bg-slate-sidebar{background-color:#020617}.notif-unread-indicator.svelte-3ktc7a{position:absolute;top:2px;right:2px;background:linear-gradient(135deg, #6366f1, #4f46e5);color:white;font-size:0.6rem;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid white;line-height:1;animation:svelte-3ktc7a-badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)}.chat-unread-indicator.svelte-3ktc7a{position:absolute;top:2px;right:2px;background:#ef4444;color:white;font-size:0.6rem;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid white;line-height:1;animation:svelte-3ktc7a-badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)}@keyframes svelte-3ktc7a-badgePop{from{transform:scale(0)}to{transform:scale(1)}}",
  map: null
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let user;
  let currentPath;
  let $page, $$unsubscribe_page;
  let $$unsubscribe_isNotificationOpen;
  let $unreadNotificationCount, $$unsubscribe_unreadNotificationCount;
  let $$unsubscribe_chatView;
  let $$unsubscribe_isChatOpen;
  let $unreadCount, $$unsubscribe_unreadCount;
  let $$unsubscribe_isProfileModalOpen;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_isNotificationOpen = subscribe(isNotificationOpen, (value) => value);
  $$unsubscribe_unreadNotificationCount = subscribe(unreadNotificationCount, (value) => $unreadNotificationCount = value);
  $$unsubscribe_chatView = subscribe(chatView, (value) => value);
  $$unsubscribe_isChatOpen = subscribe(isChatOpen, (value) => value);
  $$unsubscribe_unreadCount = subscribe(unreadCount, (value) => $unreadCount = value);
  $$unsubscribe_isProfileModalOpen = subscribe(isProfileModalOpen, (value) => value);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  user = data?.user;
  currentPath = $page.url.pathname;
  $$unsubscribe_page();
  $$unsubscribe_isNotificationOpen();
  $$unsubscribe_unreadNotificationCount();
  $$unsubscribe_chatView();
  $$unsubscribe_isChatOpen();
  $$unsubscribe_unreadCount();
  $$unsubscribe_isProfileModalOpen();
  return `<div class="relative flex min-h-screen w-full overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100"> <aside class="w-64 bg-slate-sidebar text-slate-400 hidden lg:flex flex-col border-r border-slate-800/50"><div class="p-6 flex items-center gap-3" data-svelte-h="svelte-pxsbnf"><div class="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30"><span class="material-symbols-outlined text-2xl">dentistry</span></div> <h2 class="text-white text-xl font-bold tracking-tight">Oratio Admin</h2></div> <nav class="flex-1 px-4 space-y-1 custom-scrollbar overflow-y-auto"><div class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-3 py-4" data-svelte-h="svelte-1qg4rhe">Main Menu</div> <a class="${"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all " + escape(
    currentPath === "/admin" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 hover:text-white",
    true
  )}" href="/admin"><span class="material-symbols-outlined" data-svelte-h="svelte-180xjz7">dashboard</span> <span class="${"text-sm " + escape(
    currentPath === "/admin" ? "font-semibold" : "font-medium",
    true
  )}">Dashboard</span></a> <a class="${"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all " + escape(
    currentPath.startsWith("/admin/patients") ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 hover:text-white",
    true
  )}" href="/admin/patients"><span class="material-symbols-outlined" data-svelte-h="svelte-vxdmt3">groups</span> <span class="${"text-sm " + escape(
    currentPath.startsWith("/admin/patients") ? "font-semibold" : "font-medium",
    true
  )}">Patients</span></a> <a class="${"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all " + escape(
    currentPath.startsWith("/admin/users") ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 hover:text-white",
    true
  )}" href="/admin/users"><span class="material-symbols-outlined" data-svelte-h="svelte-vvr0mw">stethoscope</span> <span class="${"text-sm " + escape(
    currentPath.startsWith("/admin/users") ? "font-semibold" : "font-medium",
    true
  )}">Users / Staff</span></a> <a class="${"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all " + escape(
    currentPath.startsWith("/admin/encounters") ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 hover:text-white",
    true
  )}" href="/admin/encounters"><span class="material-symbols-outlined" data-svelte-h="svelte-jdvlvw">calendar_month</span> <span class="${"text-sm " + escape(
    currentPath.startsWith("/admin/encounters") ? "font-semibold" : "font-medium",
    true
  )}">Encounters</span></a> <a class="${"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all " + escape(
    currentPath.startsWith("/admin/doctor-shifts") ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 hover:text-white",
    true
  )}" href="/admin/doctor-shifts"><span class="material-symbols-outlined" data-svelte-h="svelte-12u6m5a">schedule</span> <span class="${"text-sm " + escape(
    currentPath.startsWith("/admin/doctor-shifts") ? "font-semibold" : "font-medium",
    true
  )}">Doctor Shifts</span></a> <div class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-3 py-4 mt-4" data-svelte-h="svelte-6cr7gn">System</div> <a class="${"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all " + escape(
    currentPath.startsWith("/admin/payments") ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 hover:text-white",
    true
  )}" href="/admin/payments"><span class="material-symbols-outlined" data-svelte-h="svelte-c6s5rw">payments</span> <span class="${"text-sm " + escape(
    currentPath.startsWith("/admin/payments") ? "font-semibold" : "font-medium",
    true
  )}">Payments</span></a> <a class="${"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all " + escape(
    currentPath.startsWith("/admin/items") ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 hover:text-white",
    true
  )}" href="/admin/items"><span class="material-symbols-outlined" data-svelte-h="svelte-1v7os1z">inventory</span> <span class="${"text-sm " + escape(
    currentPath.startsWith("/admin/items") ? "font-semibold" : "font-medium",
    true
  )}">Items &amp; DB</span></a> <a class="${"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all " + escape(
    currentPath.startsWith("/admin/terminology") ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 hover:text-white",
    true
  )}" href="/admin/terminology"><span class="material-symbols-outlined" data-svelte-h="svelte-ax8gj7">dictionary</span> <span class="${"text-sm " + escape(
    currentPath.startsWith("/admin/terminology") ? "font-semibold" : "font-medium",
    true
  )}">Terminology</span></a> <a class="${"flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all " + escape(
    currentPath.startsWith("/admin/import") ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 hover:text-white",
    true
  )}" href="/admin/import"><span class="material-symbols-outlined" data-svelte-h="svelte-1wgy74a">database</span> <span class="${"text-sm " + escape(
    currentPath.startsWith("/admin/import") ? "font-semibold" : "font-medium",
    true
  )}">Data Import</span></a></nav></aside>  <main class="flex-1 flex flex-col min-w-0 overflow-hidden"> <header class="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between px-8 sticky top-0 z-20"><div class="flex items-center flex-1" data-svelte-h="svelte-1lv9ffn"><div class="relative max-w-md w-full"></div></div> <div class="flex items-center gap-6">${validate_component(ConnectionStatus, "ConnectionStatus").$$render($$result, {}, {}, {})} <div class="flex items-center gap-4"><button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative" id="admin-notification-toggle-btn"><span class="material-symbols-outlined" data-svelte-h="svelte-8pjcy8">notifications</span> ${$unreadNotificationCount > 0 ? `<span class="notif-unread-indicator svelte-3ktc7a">${escape($unreadNotificationCount > 99 ? "99+" : $unreadNotificationCount)}</span>` : ``}</button>  ${user?.role === "admin" ? `<button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative" title="Broadcast Message" data-svelte-h="svelte-sjttou"><span class="material-symbols-outlined text-primary">campaign</span></button>` : ``}  <button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative" id="admin-chat-toggle-btn"><span class="material-symbols-outlined" data-svelte-h="svelte-qf76r">chat_bubble</span> ${$unreadCount > 0 ? `<span class="chat-unread-indicator svelte-3ktc7a">${escape($unreadCount > 99 ? "99+" : $unreadCount)}</span>` : ``}</button> <button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" data-svelte-h="svelte-w4n9vk"><span class="material-symbols-outlined">help</span></button></div> <div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div> <div class="relative"><button class="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity"><div class="text-right hidden sm:block"><p class="text-sm font-semibold text-slate-900 dark:text-white leading-none">${escape(user?.name || "Admin")}</p> <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">${escape(user?.role || "System Admin")}</p></div> <div class="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase overflow-hidden border border-primary/20">${user?.profile_image_url ? `<img${add_attribute("src", user.profile_image_url, 0)}${add_attribute("alt", user?.name, 0)} class="w-full h-full object-cover">` : `${escape(user?.name?.[0] || "A")}`}</div> <span class="${"material-symbols-outlined text-slate-400 text-sm " + escape("", true) + " transition-transform"}">expand_more</span></button> ${``}</div></div></header> ${slots.default ? slots.default({}) : ``}</main></div> ${validate_component(Toast, "Toast").$$render($$result, {}, {}, {})} ${validate_component(ProfileModal, "ProfileModal").$$render($$result, { user }, {}, {})} ${validate_component(NotificationPanel, "NotificationPanel").$$render($$result, { user, isAdmin: true }, {}, {})} ${validate_component(ChatPanel, "ChatPanel").$$render($$result, { user }, {}, {})}`;
});

export { Layout as default };
//# sourceMappingURL=_layout.svelte-665a7428.js.map
