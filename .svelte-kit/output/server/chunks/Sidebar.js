import { c as create_ssr_component, a as subscribe, o as onDestroy, e as escape, v as validate_component, g as each, f as add_attribute } from "./ssr.js";
import { p as page } from "./stores.js";
import "./ChatPanel.js";
import { b as isSidebarOpen } from "./layout.js";
const ShiftTimer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isSidebarOpen, $$unsubscribe_isSidebarOpen;
  $$unsubscribe_isSidebarOpen = subscribe(isSidebarOpen, (value) => $isSidebarOpen = value);
  let hours = "00";
  let mins = "00";
  let secs = "00";
  let statusMsg = "No Active Shift";
  onDestroy(() => {
  });
  $$unsubscribe_isSidebarOpen();
  return `${$isSidebarOpen ? `<div class="flex flex-col bg-black/20 rounded-2xl p-5 shadow-inner w-full font-display min-h-[120px] justify-center">${`<div class="flex justify-center p-2" data-svelte-h="svelte-1m0zpe6"><div class="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div></div>`}</div>` : `<div class="flex items-center justify-center p-3 rounded-2xl bg-black/20 w-full" title="${escape(statusMsg, true) + ": " + escape(hours, true) + ":" + escape(mins, true) + ":" + escape(secs, true)}">${`<div class="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>`}</div>`}`;
});
const Sidebar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let items;
  let currentPath;
  let $page, $$unsubscribe_page;
  let $isSidebarOpen, $$unsubscribe_isSidebarOpen;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_isSidebarOpen = subscribe(isSidebarOpen, (value) => $isSidebarOpen = value);
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
        href: "/kasir/patients",
        icon: "🏥",
        label: "Data Pasien"
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
      },
      {
        href: "/kasir/payments",
        icon: "📚",
        label: "Riwayat Pembayaran"
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
      },
      {
        href: "/dokter/history",
        icon: "🕒",
        label: "History"
      }
    ],
    suster: [
      {
        href: "/suster/history",
        icon: "🕒",
        label: "History"
      },
      {
        href: "/suster/patients",
        icon: "🏥",
        label: "Data Pasien"
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
  $$unsubscribe_isSidebarOpen();
  return `${role === "kasir" ? `<aside class="${"bg-forest flex flex-col h-full text-white shrink-0 shadow-lg z-20 font-display transition-all duration-300 " + escape($isSidebarOpen ? "w-64" : "w-20", true) + " relative"}"> <button class="absolute -right-3 top-8 bg-white text-forest rounded-full shadow-md border border-slate-200 size-6 flex items-center justify-center hover:bg-slate-50 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-primary" title="Toggle Sidebar"><span class="material-symbols-outlined text-[16px]">${escape($isSidebarOpen ? "menu_open" : "menu")}</span></button> <div class="${"p-6 flex items-center gap-3 " + escape($isSidebarOpen ? "" : "justify-center p-4", true)}"><div class="size-10 bg-primary rounded-lg flex items-center justify-center shrink-0" data-svelte-h="svelte-1k7xx5o"><span class="material-symbols-outlined text-white">dentistry</span></div> ${$isSidebarOpen ? `<div class="overflow-hidden whitespace-nowrap" data-svelte-h="svelte-q9e33s"><h1 class="font-bold text-lg leading-none">Oratio Clinic</h1> <p class="text-[10px] text-primary uppercase tracking-widest mt-1 text-emerald-400">Kasir Access</p></div>` : ``}</div> <nav class="${"flex-1 px-4 mt-4 " + escape($isSidebarOpen ? "" : "!px-2", true) + " overflow-y-auto custom-scrollbar overflow-x-hidden pb-4"}"> <div class="space-y-1"><a class="${"flex items-center " + escape(
    $isSidebarOpen ? "gap-3 px-4 py-3" : "justify-center p-3",
    true
  ) + " " + escape(
    currentPath === "/kasir" ? "bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300" : "hover:bg-white/10 !text-white/70 hover:!text-white",
    true
  ) + " rounded-lg transition-colors"}" href="/kasir" title="Dashboard"><span class="${"material-symbols-outlined " + escape(currentPath === "/kasir" ? "" : "opacity-70", true)}">dashboard</span> ${$isSidebarOpen ? `<span class="font-medium text-sm whitespace-nowrap" data-svelte-h="svelte-1rt5k3r">Dashboard</span>` : ``}</a></div>  ${$isSidebarOpen ? `<div class="px-4 mt-6 mb-2 text-[10px] font-bold text-white/40 uppercase tracking-widest whitespace-nowrap" data-svelte-h="svelte-13qjckt">Registrasi Pasien</div>` : `<div class="my-4 border-t border-white/10 mx-3"></div>`} <div class="space-y-1"><a class="${"flex items-center " + escape(
    $isSidebarOpen ? "gap-3 px-4 py-2.5" : "justify-center p-3",
    true
  ) + " " + escape(
    currentPath === "/kasir/new-patient" ? "bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300" : "hover:bg-white/10 !text-white/70 hover:!text-white",
    true
  ) + " rounded-lg transition-colors"}" href="/kasir/new-patient" title="Pasien Baru"><span class="${"material-symbols-outlined " + escape(currentPath === "/kasir/new-patient" ? "" : "opacity-70", true) + " !text-[20px]"}">person_add</span> ${$isSidebarOpen ? `<span class="font-medium text-sm whitespace-nowrap" data-svelte-h="svelte-14fwnhj">Pasien Baru</span>` : ``}</a> <a class="${"flex items-center " + escape(
    $isSidebarOpen ? "gap-3 px-4 py-2.5" : "justify-center p-3",
    true
  ) + " " + escape(
    currentPath === "/kasir/existing-patient" ? "bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300" : "hover:bg-white/10 !text-white/70 hover:!text-white",
    true
  ) + " rounded-lg transition-colors"}" href="/kasir/existing-patient" title="Pasien Lama"><span class="${"material-symbols-outlined " + escape(
    currentPath === "/kasir/existing-patient" ? "" : "opacity-70",
    true
  ) + " !text-[20px]"}">group</span> ${$isSidebarOpen ? `<span class="font-medium text-sm whitespace-nowrap" data-svelte-h="svelte-pxhn9o">Pasien Lama</span>` : ``}</a></div>  ${$isSidebarOpen ? `<div class="px-4 mt-6 mb-2 text-[10px] font-bold text-white/40 uppercase tracking-widest whitespace-nowrap" data-svelte-h="svelte-138dqjw">Transaksi Pembayaran</div>` : `<div class="my-4 border-t border-white/10 mx-3"></div>`} <div class="space-y-1"><a class="${"flex items-center " + escape(
    $isSidebarOpen ? "gap-3 px-4 py-2.5" : "justify-center p-3",
    true
  ) + " " + escape(
    currentPath === "/kasir/payment" ? "bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300" : "hover:bg-white/10 !text-white/70 hover:!text-white",
    true
  ) + " rounded-lg transition-colors"}" href="/kasir/payment" title="Pembayaran"><span class="${"material-symbols-outlined " + escape(currentPath === "/kasir/payment" ? "" : "opacity-70", true) + " !text-[20px]"}">payments</span> ${$isSidebarOpen ? `<span class="font-medium text-sm whitespace-nowrap" data-svelte-h="svelte-6m935t">Pembayaran</span>` : ``}</a></div>  ${$isSidebarOpen ? `<div class="px-4 mt-6 mb-2 text-[10px] font-bold text-white/40 uppercase tracking-widest whitespace-nowrap" data-svelte-h="svelte-15gyaey">Database &amp; Riwayat</div>` : `<div class="my-4 border-t border-white/10 mx-3"></div>`} <div class="space-y-1"><a class="${"flex items-center " + escape(
    $isSidebarOpen ? "gap-3 px-4 py-2.5" : "justify-center p-3",
    true
  ) + " " + escape(
    currentPath.startsWith("/kasir/patients") ? "bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300" : "hover:bg-white/10 !text-white/70 hover:!text-white",
    true
  ) + " rounded-lg transition-colors"}" href="/kasir/patients" title="Data Pasien"><span class="${"material-symbols-outlined " + escape(
    currentPath.startsWith("/kasir/patients") ? "" : "opacity-70",
    true
  ) + " !text-[20px]"}">database</span> ${$isSidebarOpen ? `<span class="font-medium text-sm whitespace-nowrap" data-svelte-h="svelte-1v72szr">Data Pasien</span>` : ``}</a> <a class="${"flex items-center " + escape(
    $isSidebarOpen ? "gap-3 px-4 py-2.5" : "justify-center p-3",
    true
  ) + " " + escape(
    currentPath.startsWith("/kasir/payments") ? "bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300" : "hover:bg-white/10 !text-white/70 hover:!text-white",
    true
  ) + " rounded-lg transition-colors"}" href="/kasir/payments" title="Riwayat Pembayaran"><span class="${"material-symbols-outlined " + escape(
    currentPath.startsWith("/kasir/payments") ? "" : "opacity-70",
    true
  ) + " !text-[20px]"}">receipt_long</span> ${$isSidebarOpen ? `<span class="font-medium text-sm whitespace-nowrap" data-svelte-h="svelte-dtnreu">Riwayat Pembayaran</span>` : ``}</a></div></nav> <div class="mt-auto p-4 border-t border-white/10">${validate_component(ShiftTimer, "ShiftTimer").$$render($$result, {}, {}, {})}</div></aside>` : `${role === "dokter" ? `<aside class="sidebar bg-[#1E3A5F] flex flex-col text-white shadow-lg font-display"> <button class="absolute -right-3 top-8 bg-white text-[#1E3A5F] rounded-full shadow-md border border-slate-200 size-6 flex items-center justify-center hover:bg-slate-50 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]" title="Toggle Sidebar"><span class="material-symbols-outlined text-[16px]">${escape($isSidebarOpen ? "menu_open" : "menu")}</span></button> <div class="${"p-6 flex items-center gap-3 " + escape($isSidebarOpen ? "" : "justify-center p-4", true)}"><div class="size-10 bg-[#3B82F6] rounded-lg flex items-center justify-center shrink-0" data-svelte-h="svelte-j2vi4m"><span class="material-symbols-outlined text-white">medical_services</span></div> ${$isSidebarOpen ? `<div class="overflow-hidden whitespace-nowrap" data-svelte-h="svelte-1n09up4"><h1 class="font-bold text-lg leading-none">Oratio Clinic</h1> <p class="text-[10px] text-[#38BDF8] uppercase tracking-widest mt-1">Dokter Access</p></div>` : ``}</div> <nav class="${"flex-1 px-4 space-y-2 mt-4 " + escape($isSidebarOpen ? "" : "!px-2", true)}"><a class="${"flex items-center " + escape(
    $isSidebarOpen ? "gap-3 px-4 py-3" : "justify-center p-3",
    true
  ) + " " + escape(
    currentPath === "/dokter" ? "bg-[#3B82F6]/20 border-l-4 border-[#3B82F6] !text-[#38BDF8] hover:!text-[#E0F2FE]" : "hover:bg-white/10 !text-white/70 hover:!text-white",
    true
  ) + " rounded-lg transition-colors"}" href="/dokter" title="Dashboard"><span class="${"material-symbols-outlined " + escape(currentPath === "/dokter" ? "" : "opacity-70", true)}">dashboard</span> ${$isSidebarOpen ? `<span class="font-medium text-sm whitespace-nowrap" data-svelte-h="svelte-1rt5k3r">Dashboard</span>` : ``}</a> <a class="${"flex items-center " + escape(
    $isSidebarOpen ? "gap-3 px-4 py-3" : "justify-center p-3",
    true
  ) + " " + escape(
    currentPath.startsWith("/dokter/analytics") ? "bg-[#3B82F6]/20 border-l-4 border-[#3B82F6] !text-[#38BDF8] hover:!text-[#E0F2FE]" : "hover:bg-white/10 !text-white/70 hover:!text-white",
    true
  ) + " rounded-lg transition-colors"}" href="/dokter/analytics" title="Analytics"><span class="${"material-symbols-outlined " + escape(
    currentPath.startsWith("/dokter/analytics") ? "" : "opacity-70",
    true
  )}">analytics</span> ${$isSidebarOpen ? `<span class="font-medium text-sm whitespace-nowrap" data-svelte-h="svelte-q47u3j">Analytics</span>` : ``}</a> <a class="${"flex items-center " + escape(
    $isSidebarOpen ? "gap-3 px-4 py-3" : "justify-center p-3",
    true
  ) + " " + escape(
    currentPath.startsWith("/dokter/history") ? "bg-[#3B82F6]/20 border-l-4 border-[#3B82F6] !text-[#38BDF8] hover:!text-[#E0F2FE]" : "hover:bg-white/10 !text-white/70 hover:!text-white",
    true
  ) + " rounded-lg transition-colors"}" href="/dokter/history" title="History"><span class="${"material-symbols-outlined " + escape(
    currentPath.startsWith("/dokter/history") ? "" : "opacity-70",
    true
  )}">history</span> ${$isSidebarOpen ? `<span class="font-medium text-sm whitespace-nowrap" data-svelte-h="svelte-l3fwin">History</span>` : ``}</a></nav> <div class="mt-auto p-4 border-t border-white/10">${validate_component(ShiftTimer, "ShiftTimer").$$render($$result, {}, {}, {})}</div></aside>` : `${role === "suster" ? `<aside class="sidebar bg-[#4C1D2F] flex flex-col text-white shadow-lg font-display"> <button class="absolute -right-3 top-8 bg-white text-[#4C1D2F] rounded-full shadow-md border border-slate-200 size-6 flex items-center justify-center hover:bg-slate-50 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-[#E11D48]" title="Toggle Sidebar"><span class="material-symbols-outlined text-[16px]">${escape($isSidebarOpen ? "menu_open" : "menu")}</span></button> <div class="${"p-6 flex items-center gap-3 " + escape($isSidebarOpen ? "" : "justify-center p-4", true)}"><div class="size-10 bg-[#E11D48] rounded-lg flex items-center justify-center shrink-0" data-svelte-h="svelte-erxuf7"><span class="material-symbols-outlined text-white">health_and_safety</span></div> ${$isSidebarOpen ? `<div class="overflow-hidden whitespace-nowrap" data-svelte-h="svelte-1weey0r"><h1 class="font-bold text-lg leading-none">Oratio Clinic</h1> <p class="text-[10px] text-[#FB7185] uppercase tracking-widest mt-1">Suster Access</p></div>` : ``}</div> <nav class="${"flex-1 px-4 space-y-2 mt-4 " + escape($isSidebarOpen ? "" : "!px-2", true)}"><a class="${"flex items-center " + escape(
    $isSidebarOpen ? "gap-3 px-4 py-3" : "justify-center p-3",
    true
  ) + " " + escape(
    currentPath.startsWith("/suster/history") ? "bg-[#E11D48]/20 border-l-4 border-[#E11D48] !text-[#FB7185] hover:!text-[#FFE4E6]" : "hover:bg-white/10 !text-white/70 hover:!text-white",
    true
  ) + " rounded-lg transition-colors"}" href="/suster/history" title="History"><span class="${"material-symbols-outlined " + escape(
    currentPath.startsWith("/suster/history") ? "" : "opacity-70",
    true
  )}">history</span> ${$isSidebarOpen ? `<span class="font-medium text-sm whitespace-nowrap" data-svelte-h="svelte-l3fwin">History</span>` : ``}</a> <a class="${"flex items-center " + escape(
    $isSidebarOpen ? "gap-3 px-4 py-3" : "justify-center p-3",
    true
  ) + " " + escape(
    currentPath.startsWith("/suster/patients") ? "bg-[#E11D48]/20 border-l-4 border-[#E11D48] !text-[#FB7185] hover:!text-[#FFE4E6]" : "hover:bg-white/10 !text-white/70 hover:!text-white",
    true
  ) + " rounded-lg transition-colors"}" href="/suster/patients" title="Data Pasien"><span class="${"material-symbols-outlined " + escape(
    currentPath.startsWith("/suster/patients") ? "" : "opacity-70",
    true
  )}">patient_list</span> ${$isSidebarOpen ? `<span class="font-medium text-sm whitespace-nowrap" data-svelte-h="svelte-1v72szr">Data Pasien</span>` : ``}</a></nav> <div class="mt-auto p-4 border-t border-white/10">${validate_component(ShiftTimer, "ShiftTimer").$$render($$result, {}, {}, {})}</div></aside>` : `<aside class="sidebar"> <button class="sidebar-toggle-btn absolute -right-3 top-8 bg-white text-gray-700 rounded-full shadow-md border border-gray-200 size-6 flex items-center justify-center hover:bg-gray-50 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-primary" style="width: 24px; height: 24px; top: 32px; right: -12px; cursor: pointer;" title="Toggle Sidebar"><span class="material-symbols-outlined" style="font-size: 16px;">${escape($isSidebarOpen ? "menu_open" : "menu")}</span></button> <div class="sidebar-header" data-svelte-h="svelte-1lubj6g"><img src="/logo.png" alt="Klinik Utama Oratio" style="max-width: 100%; height: 52px; width: auto; object-fit: contain; "></div> <nav class="sidebar-nav"><div class="sidebar-section" data-svelte-h="svelte-karbua">Menu</div> ${each(items, (item) => {
    return `<a${add_attribute("href", item.href, 0)} class="${[
      "sidebar-link",
      currentPath === item.href || item.href !== "/" + role && currentPath.startsWith(item.href) ? "active" : ""
    ].join(" ").trim()}"${add_attribute("title", item.label, 0)}><span class="icon">${escape(item.icon)}</span> <span class="sidebar-link-text">${escape(item.label)}</span> </a>`;
  })}</nav></aside>`}`}`}`;
});
export {
  Sidebar as S
};
