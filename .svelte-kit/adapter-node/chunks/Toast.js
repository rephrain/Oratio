import { c as create_ssr_component, a as subscribe, e as escape, b as each, d as add_attribute, v as validate_component } from "./ssr.js";
import { p as page } from "./stores.js";
import { d as derived, w as writable } from "./index2.js";
import { t as toasts } from "./toast2.js";
const currentUser = writable(null);
derived(currentUser, ($user) => !!$user);
derived(currentUser, ($user) => $user?.role || null);
const Sidebar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let items;
  let currentPath;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { user } = $$props;
  let { role } = $$props;
  const menuItems = {
    admin: [
      {
        href: "/admin",
        icon: "📊",
        label: "Dashboard"
      },
      {
        href: "/admin/users",
        icon: "👥",
        label: "Users"
      },
      {
        href: "/admin/doctor-shifts",
        icon: "🕐",
        label: "Doctor Shifts"
      },
      {
        href: "/admin/patients",
        icon: "🏥",
        label: "Patients"
      },
      {
        href: "/admin/encounters",
        icon: "📋",
        label: "Encounters"
      },
      {
        href: "/admin/terminology",
        icon: "📖",
        label: "Terminology"
      },
      {
        href: "/admin/items",
        icon: "💊",
        label: "Items"
      },
      {
        href: "/admin/payments",
        icon: "💳",
        label: "Payments"
      },
      {
        href: "/admin/import",
        icon: "📤",
        label: "CSV Import"
      }
    ],
    kasir: [
      {
        href: "/kasir",
        icon: "📋",
        label: "Antrian"
      },
      {
        href: "/kasir/new-patient",
        icon: "➕",
        label: "Pasien Baru"
      },
      {
        href: "/kasir/existing-patient",
        icon: "🔍",
        label: "Pasien Lama"
      },
      {
        href: "/kasir/payment",
        icon: "💳",
        label: "Pembayaran"
      }
    ],
    dokter: [
      {
        href: "/dokter",
        icon: "📋",
        label: "Dashboard"
      },
      {
        href: "/dokter/analytics",
        icon: "📊",
        label: "Analytics"
      }
    ]
  };
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0)
    $$bindings.role(role);
  items = menuItems[role] || [];
  currentPath = $page.url.pathname;
  $$unsubscribe_page();
  return `<aside class="sidebar"><div class="sidebar-header"><div class="sidebar-logo" data-svelte-h="svelte-ptelwy">O</div> <div><div class="sidebar-brand" data-svelte-h="svelte-1dbj2dd">Oratio</div> <div style="font-size: var(--font-size-xs); opacity: 0.7; text-transform: capitalize;">${escape(role)}</div></div></div> <nav class="sidebar-nav"><div class="sidebar-section" data-svelte-h="svelte-karbua">Menu</div> ${each(items, (item) => {
    return `<a${add_attribute("href", item.href, 0)} class="${[
      "sidebar-link",
      currentPath === item.href || item.href !== "/" + role && currentPath.startsWith(item.href) ? "active" : ""
    ].join(" ").trim()}"><span class="icon">${escape(item.icon)}</span> ${escape(item.label)} </a>`;
  })}</nav> <div class="sidebar-footer"><div style="font-size: var(--font-size-sm); margin-bottom: var(--space-2);"><div class="font-semibold" style="color: white;">${escape(user?.name || "User")}</div> <div style="font-size: var(--font-size-xs); opacity: 0.6; text-transform: capitalize;">${escape(user?.role)}</div></div> <button class="btn btn-ghost" style="color: var(--sidebar-text); width: 100%; justify-content: flex-start;" data-svelte-h="svelte-1ae93m3">🚪 Logout</button></div></aside>`;
});
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title = "" } = $$props;
  let { user = null } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  return `<header class="top-header"><div class="flex items-center gap-4"><h2 style="font-size: var(--font-size-lg); font-weight: 600;">${escape(title)}</h2></div> <div class="flex items-center gap-3"><span class="text-sm text-muted">${escape(user?.name || "")}</span> <div class="badge badge-primary" style="text-transform: capitalize;">${escape(user?.role || "")}</div></div></header>`;
});
const AppShell = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { user } = $$props;
  let { role } = $$props;
  let { title = "" } = $$props;
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  if ($$props.role === void 0 && $$bindings.role && role !== void 0)
    $$bindings.role(role);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  return `<div class="${"app-shell role-" + escape(role, true)}">${validate_component(Sidebar, "Sidebar").$$render($$result, { user, role }, {}, {})} <div class="main-content">${validate_component(Header, "Header").$$render($$result, { title, user }, {}, {})} <div class="page-content">${slots.default ? slots.default({}) : ``}</div></div></div>`;
});
const Toast = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $toasts, $$unsubscribe_toasts;
  $$unsubscribe_toasts = subscribe(toasts, (value) => $toasts = value);
  $$unsubscribe_toasts();
  return `<div class="toast-container">${each($toasts, (toast) => {
    return `<div class="${"toast toast-" + escape(toast.type, true)}"><span style="flex: 1;">${escape(toast.message)}</span> <button class="btn btn-ghost btn-icon btn-sm" data-svelte-h="svelte-w3x981">✕</button> </div>`;
  })}</div>`;
});
export {
  AppShell as A,
  Toast as T
};
