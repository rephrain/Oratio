import { c as create_ssr_component, a as subscribe, v as validate_component, e as escape } from "../../../chunks/ssr.js";
import { S as Sidebar, T as Toast } from "../../../chunks/Toast.js";
import { p as page } from "../../../chunks/stores.js";
const _layout_svelte_svelte_type_style_lang = "";
const css = {
  code: ":root{--tw-primary:#10b981;--tw-secondary:#e0e0e0;--tw-accent:#14b8a6;--tw-forest:#064e3b;--tw-bg-light:#f9fafb;--tw-bg-dark:#064e3b}body{margin:0;padding:0}.custom-scrollbar::-webkit-scrollbar{width:6px;height:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:#94a3b8}@keyframes svelte-1as6sdi-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}",
  map: null
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let user;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  user = data?.user;
  $page.url.pathname;
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-40bjgf_START -->${$$result.title = `<title>Oratio Clinic - Kasir</title>`, ""}<!-- HEAD_svelte-40bjgf_END -->`, ""} <div class="font-display text-slate-900 bg-background-light flex h-screen overflow-hidden w-full"> ${validate_component(Sidebar, "Sidebar").$$render($$result, { user, role: "kasir" }, {}, {})}  <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10"> <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0"><div class="flex-1 max-w-xl" data-svelte-h="svelte-1ltnwa9"><div class="relative group"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span> <input class="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm outline-none" placeholder="Search by ID, NIK, or Patient Name..." type="text"></div></div> <div class="flex items-center gap-6"><div class="flex items-center gap-4" data-svelte-h="svelte-dqnixe"><button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"><span class="material-symbols-outlined">notifications</span> <span class="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span></button> <button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"><span class="material-symbols-outlined">chat_bubble</span></button></div> <div class="h-8 w-px bg-slate-200"></div> <div class="relative"><button class="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity"><div class="text-right"><p class="text-sm font-semibold text-slate-900 leading-none">${escape(user?.name || "Receptionist")}</p> <p class="text-xs text-slate-500 mt-1 capitalize">${escape(user?.role || "kasir")}</p></div> <div class="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">${escape(user?.name?.[0]?.toUpperCase() || "R")}</div> <span class="${"material-symbols-outlined text-slate-400 text-sm " + escape("", true) + " transition-transform"}">expand_more</span></button> ${``}</div></div></header> <div class="flex-1 overflow-y-auto custom-scrollbar bg-secondary/30 p-8">${slots.default ? slots.default({}) : ``}</div></main></div> ${validate_component(Toast, "Toast").$$render($$result, {}, {}, {})}`;
});
export {
  Layout as default
};
