import { c as create_ssr_component, v as validate_component, a as subscribe, f as escape, g as add_attribute } from './ssr-4a5a9ccc.js';
import { S as Sidebar } from './Sidebar-1055e0e9.js';
import { a as isSidebarOpen, b as isSidebarHidden, h as headerTitle, c as isPatientProfileOpen, i as isProfileModalOpen } from './layout-3873cafe.js';
import { T as Toast, c as chatView, a as isChatOpen, i as isNotificationOpen, u as unreadNotificationCount, b as unreadCount, P as ProfileModal, C as ChatPanel, N as NotificationPanel } from './ChatPanel-640d5543.js';
import { C as ConnectionStatus } from './ConnectionStatus-903f68ba.js';
import './stores-468b91fe.js';
import './index2-bd557b7d.js';
import './toast-4413a763.js';

const css = {
  code: ".chat-unread-indicator.svelte-a8zrpm{position:absolute;top:0;right:0;background:#ef4444;color:white;font-size:0.6rem;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid white;line-height:1;animation:svelte-a8zrpm-badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)}@keyframes svelte-a8zrpm-badgePop{from{transform:scale(0)}to{transform:scale(1)}}.notif-unread-indicator.svelte-a8zrpm{position:absolute;top:0;right:0;background:linear-gradient(135deg, #6366f1, #4f46e5);color:white;font-size:0.6rem;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;border:2px solid white;line-height:1;animation:svelte-a8zrpm-badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)}",
  map: null
};
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isSidebarHidden, $$unsubscribe_isSidebarHidden;
  let $isSidebarOpen, $$unsubscribe_isSidebarOpen;
  let $headerTitle, $$unsubscribe_headerTitle;
  let $$unsubscribe_isPatientProfileOpen;
  let $$unsubscribe_chatView;
  let $$unsubscribe_isChatOpen;
  let $$unsubscribe_isNotificationOpen;
  let $unreadNotificationCount, $$unsubscribe_unreadNotificationCount;
  let $unreadCount, $$unsubscribe_unreadCount;
  let $$unsubscribe_isProfileModalOpen;
  $$unsubscribe_isSidebarHidden = subscribe(isSidebarHidden, (value) => $isSidebarHidden = value);
  $$unsubscribe_isSidebarOpen = subscribe(isSidebarOpen, (value) => $isSidebarOpen = value);
  $$unsubscribe_headerTitle = subscribe(headerTitle, (value) => $headerTitle = value);
  $$unsubscribe_isPatientProfileOpen = subscribe(isPatientProfileOpen, (value) => value);
  $$unsubscribe_chatView = subscribe(chatView, (value) => value);
  $$unsubscribe_isChatOpen = subscribe(isChatOpen, (value) => value);
  $$unsubscribe_isNotificationOpen = subscribe(isNotificationOpen, (value) => value);
  $$unsubscribe_unreadNotificationCount = subscribe(unreadNotificationCount, (value) => $unreadNotificationCount = value);
  $$unsubscribe_unreadCount = subscribe(unreadCount, (value) => $unreadCount = value);
  $$unsubscribe_isProfileModalOpen = subscribe(isProfileModalOpen, (value) => value);
  let { user = null } = $$props;
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  $$result.css.add(css);
  $$unsubscribe_isSidebarHidden();
  $$unsubscribe_isSidebarOpen();
  $$unsubscribe_headerTitle();
  $$unsubscribe_isPatientProfileOpen();
  $$unsubscribe_chatView();
  $$unsubscribe_isChatOpen();
  $$unsubscribe_isNotificationOpen();
  $$unsubscribe_unreadNotificationCount();
  $$unsubscribe_unreadCount();
  $$unsubscribe_isProfileModalOpen();
  return `<header class="top-header transition-all duration-300" style="${"padding-left: " + escape(
    $isSidebarHidden ? "var(--space-8)" : $isSidebarOpen ? "calc(260px + var(--space-8))" : "calc(80px + var(--space-8))",
    true
  ) + "; padding-right: var(--space-8);"}"><div class="flex-1 max-w-2xl">${$headerTitle ? `<button class="text-left focus:outline-none hover:opacity-80 transition-opacity group cursor-pointer flex items-center gap-2"><h1 class="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors m-0 leading-none">${escape($headerTitle)}</h1> <span class="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm" data-svelte-h="svelte-8pexcb">info</span></button>` : ``}</div> <div class="flex items-center gap-6">${validate_component(ConnectionStatus, "ConnectionStatus").$$render($$result, {}, {}, {})} <div class="flex items-center gap-4">${user?.role === "admin" ? `<button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors focus:outline-none relative" title="Broadcast Message" data-svelte-h="svelte-72rb8h"><span class="material-symbols-outlined text-primary">campaign</span></button>` : ``} <button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors focus:outline-none" id="notification-toggle-btn"><span class="material-symbols-outlined" data-svelte-h="svelte-x17v1r">notifications</span> ${$unreadNotificationCount > 0 ? `<span class="notif-unread-indicator svelte-a8zrpm">${escape($unreadNotificationCount > 99 ? "99+" : $unreadNotificationCount)}</span>` : ``}</button> <button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors focus:outline-none relative" id="chat-toggle-btn"><span class="material-symbols-outlined" data-svelte-h="svelte-18wxmtw">chat_bubble</span> ${$unreadCount > 0 ? `<span class="chat-unread-indicator svelte-a8zrpm">${escape($unreadCount > 99 ? "99+" : $unreadCount)}</span>` : ``}</button></div> <div class="h-8 w-px bg-slate-200"></div> <div class="relative"><button class="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity"><div class="text-right"><p class="text-sm font-semibold text-slate-900 leading-none">${escape(user?.name || "User")}</p> <p class="text-xs text-slate-500 mt-1 capitalize">${escape(user?.role || "user")}</p></div> <div class="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase overflow-hidden border border-slate-100">${user?.profile_image_url ? `<img${add_attribute("src", user.profile_image_url, 0)}${add_attribute("alt", user?.name, 0)} class="w-full h-full object-cover">` : `${escape(user?.name?.[0] || "U")}`}</div> <span class="${"material-symbols-outlined text-slate-400 text-sm " + escape("", true) + " transition-transform"}">expand_more</span></button> ${``}</div></div></header> ${validate_component(ProfileModal, "ProfileModal").$$render($$result, { user }, {}, {})} ${validate_component(ChatPanel, "ChatPanel").$$render($$result, { user }, {}, {})} ${validate_component(NotificationPanel, "NotificationPanel").$$render($$result, { user }, {}, {})}`;
});
const AppShell = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isSidebarOpen, $$unsubscribe_isSidebarOpen;
  let $isSidebarHidden, $$unsubscribe_isSidebarHidden;
  $$unsubscribe_isSidebarOpen = subscribe(isSidebarOpen, (value) => $isSidebarOpen = value);
  $$unsubscribe_isSidebarHidden = subscribe(isSidebarHidden, (value) => $isSidebarHidden = value);
  let { user } = $$props;
  let { role } = $$props;
  let { title = "" } = $$props;
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0)
    $$bindings.role(role);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  $$unsubscribe_isSidebarOpen();
  $$unsubscribe_isSidebarHidden();
  return `<div class="${[
    "app-shell role-" + escape(role, true),
    (!$isSidebarOpen ? "sidebar-collapsed" : "") + " " + ($isSidebarHidden ? "sidebar-hidden" : "")
  ].join(" ").trim()}">${validate_component(Sidebar, "Sidebar").$$render($$result, { role, user }, {}, {})} ${validate_component(Header, "Header").$$render($$result, { title, user }, {}, {})} <div class="main-content"><div class="page-content">${slots.default ? slots.default({}) : ``}</div></div></div>`;
});
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let user;
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  user = data?.user;
  return `${validate_component(AppShell, "AppShell").$$render($$result, { user, role: "dokter", title: "Dokter" }, {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })} ${validate_component(Toast, "Toast").$$render($$result, {}, {}, {})}`;
});

export { Layout as default };
//# sourceMappingURL=_layout.svelte-722be67c.js.map
