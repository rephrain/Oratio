import { c as create_ssr_component, e as escape, a as subscribe, v as validate_component } from "./ssr.js";
import { i as isSidebarOpen, S as Sidebar } from "./Toast.js";
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title = "" } = $$props;
  let { user = null } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.user === void 0 && $$bindings.user && user !== void 0)
    $$bindings.user(user);
  return `<header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 w-full" style="position: sticky; top: 0; z-index: 50;"><div class="flex-1 max-w-xl" data-svelte-h="svelte-dgxhqh"><div class="relative group"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span> <input class="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm outline-none transition-all" placeholder="Search by ID, NIK, or Patient Name..." type="text"></div></div> <div class="flex items-center gap-6"><div class="flex items-center gap-4" data-svelte-h="svelte-1etba11"><button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors focus:outline-none"><span class="material-symbols-outlined">notifications</span> <span class="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span></button> <button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"><span class="material-symbols-outlined">chat_bubble</span></button></div> <div class="h-8 w-px bg-slate-200"></div> <div class="relative"><button class="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity"><div class="text-right"><p class="text-sm font-semibold text-slate-900 leading-none">${escape(user?.name || "User")}</p> <p class="text-xs text-slate-500 mt-1 capitalize">${escape(user?.role || "user")}</p></div> <div class="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase overflow-hidden">${escape(user?.name?.[0] || "U")}</div> <span class="${"material-symbols-outlined text-slate-400 text-sm " + escape("", true) + " transition-transform"}">expand_more</span></button> ${``}</div></div></header>`;
});
const AppShell = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isSidebarOpen, $$unsubscribe_isSidebarOpen;
  $$unsubscribe_isSidebarOpen = subscribe(isSidebarOpen, (value) => $isSidebarOpen = value);
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
  return `<div class="${[
    "app-shell role-" + escape(role, true),
    !$isSidebarOpen ? "sidebar-collapsed" : ""
  ].join(" ").trim()}">${validate_component(Sidebar, "Sidebar").$$render($$result, { role, user }, {}, {})} <div class="main-content">${validate_component(Header, "Header").$$render($$result, { title, user }, {}, {})} <div class="page-content">${slots.default ? slots.default({}) : ``}</div></div></div>`;
});
export {
  AppShell as A
};
