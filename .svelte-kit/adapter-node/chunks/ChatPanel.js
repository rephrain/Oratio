import { c as create_ssr_component, a as subscribe, o as onDestroy, e as escape, v as validate_component, g as each, f as add_attribute } from "./ssr.js";
import { p as page } from "./stores.js";
import "./NotificationPanel.js";
import { b as isSidebarOpen } from "./layout.js";
import { w as writable } from "./index2.js";
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
  )}">history</span> ${$isSidebarOpen ? `<span class="font-medium text-sm whitespace-nowrap" data-svelte-h="svelte-l3fwin">History</span>` : ``}</a></nav> <div class="mt-auto p-4 border-t border-white/10">${validate_component(ShiftTimer, "ShiftTimer").$$render($$result, {}, {}, {})}</div></aside>` : `<aside class="sidebar"> <button class="sidebar-toggle-btn absolute -right-3 top-8 bg-white text-gray-700 rounded-full shadow-md border border-gray-200 size-6 flex items-center justify-center hover:bg-gray-50 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-primary" style="width: 24px; height: 24px; top: 32px; right: -12px; cursor: pointer;" title="Toggle Sidebar"><span class="material-symbols-outlined" style="font-size: 16px;">${escape($isSidebarOpen ? "menu_open" : "menu")}</span></button> <div class="sidebar-header" data-svelte-h="svelte-1lubj6g"><img src="/logo.png" alt="Klinik Utama Oratio" style="max-width: 100%; height: 52px; width: auto; object-fit: contain; "></div> <nav class="sidebar-nav"><div class="sidebar-section" data-svelte-h="svelte-karbua">Menu</div> ${each(items, (item) => {
    return `<a${add_attribute("href", item.href, 0)} class="${[
      "sidebar-link",
      currentPath === item.href || item.href !== "/" + role && currentPath.startsWith(item.href) ? "active" : ""
    ].join(" ").trim()}"${add_attribute("title", item.label, 0)}><span class="icon">${escape(item.icon)}</span> <span class="sidebar-link-text">${escape(item.label)}</span> </a>`;
  })}</nav></aside>`}`}`;
});
const isChatOpen = writable(false);
const unreadCount = writable(0);
const ChatPanel_svelte_svelte_type_style_lang = "";
const css = {
  code: ".chat-backdrop.svelte-1hex7v0.svelte-1hex7v0{position:fixed;inset:0;background:rgba(15, 23, 42, 0.4);backdrop-filter:blur(6px);z-index:998;border:none;cursor:default;animation:svelte-1hex7v0-fadeInBackdrop 0.3s ease}@keyframes svelte-1hex7v0-fadeInBackdrop{from{opacity:0}to{opacity:1}}.chat-panel.svelte-1hex7v0.svelte-1hex7v0{position:fixed;top:16px;right:16px;bottom:16px;width:440px;max-width:calc(100vw - 32px);background:rgba(255, 255, 255, 0.95);backdrop-filter:blur(24px);border-radius:28px;border:1px solid rgba(255, 255, 255, 0.6);box-shadow:0 24px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.5);z-index:999;display:flex;flex-direction:column;animation:svelte-1hex7v0-slideInRightFloat 0.4s cubic-bezier(0.16, 1, 0.3, 1);overflow:hidden}@keyframes svelte-1hex7v0-slideInRightFloat{from{transform:translateX(120%) scale(0.95);opacity:0}to{transform:translateX(0) scale(1);opacity:1}}.chat-panel-header.svelte-1hex7v0.svelte-1hex7v0{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid rgba(226, 232, 240, 0.6);background:rgba(255, 255, 255, 0.7);backdrop-filter:blur(16px);flex-shrink:0;z-index:10}.chat-panel-header-left.svelte-1hex7v0.svelte-1hex7v0{display:flex;align-items:center;gap:16px;min-width:0}.chat-panel-header-right.svelte-1hex7v0.svelte-1hex7v0{display:flex;align-items:center;gap:8px;flex-shrink:0}.chat-panel-header.svelte-1hex7v0 h2.svelte-1hex7v0{font-size:1.15rem;font-weight:700;color:#0f172a;margin:0;white-space:nowrap;letter-spacing:-0.01em}.chat-header-icon.svelte-1hex7v0.svelte-1hex7v0{font-size:24px;color:var(--primary, #3b82f6);background:rgba(59, 130, 246, 0.1);padding:8px;border-radius:12px}.chat-icon-btn.svelte-1hex7v0.svelte-1hex7v0{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;border:none;background:transparent;color:#64748b;cursor:pointer;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1)}.chat-icon-btn.svelte-1hex7v0.svelte-1hex7v0:hover{background:#f1f5f9;color:#0f172a;transform:translateY(-1px)}.chat-icon-btn.svelte-1hex7v0.svelte-1hex7v0:active{transform:scale(0.95)}.chat-icon-btn.svelte-1hex7v0 .material-symbols-outlined.svelte-1hex7v0{font-size:22px}.chat-header-user.svelte-1hex7v0.svelte-1hex7v0{display:flex;align-items:center;gap:14px;min-width:0}.chat-header-name.svelte-1hex7v0.svelte-1hex7v0{font-size:1rem;font-weight:700;color:#0f172a;margin:0 0 2px 0;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.chat-panel-body.svelte-1hex7v0.svelte-1hex7v0{flex:1;overflow:hidden;display:flex;flex-direction:column;background:#f8fafc}.chat-empty-state.svelte-1hex7v0.svelte-1hex7v0{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 32px;gap:12px;flex:1;text-align:center}.chat-empty-icon.svelte-1hex7v0.svelte-1hex7v0{font-size:64px;color:#cbd5e1;margin-bottom:8px;animation:svelte-1hex7v0-floating 3s ease-in-out infinite}@keyframes svelte-1hex7v0-floating{0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)}}.chat-empty-title.svelte-1hex7v0.svelte-1hex7v0{font-size:1.15rem;font-weight:700;color:#334155;margin:0}.chat-empty-subtitle.svelte-1hex7v0.svelte-1hex7v0{font-size:0.95rem;color:#94a3b8;margin:0;max-width:80%}.chat-start-btn.svelte-1hex7v0.svelte-1hex7v0{display:flex;align-items:center;gap:8px;margin-top:16px;padding:12px 24px;background:var(--primary, #3b82f6);color:white;border:none;border-radius:14px;font-size:0.95rem;font-weight:600;cursor:pointer;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);box-shadow:0 4px 14px rgba(0, 0, 0, 0.12)}.chat-start-btn.svelte-1hex7v0.svelte-1hex7v0:hover{filter:brightness(1.05);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0, 0, 0, 0.15)}.chat-start-btn.svelte-1hex7v0.svelte-1hex7v0:active{transform:scale(0.97)}.chat-spinner.svelte-1hex7v0.svelte-1hex7v0{width:40px;height:40px;border:4px solid #e2e8f0;border-top-color:var(--primary, #3b82f6);border-radius:50%;animation:svelte-1hex7v0-chatSpin 0.7s linear infinite}@keyframes svelte-1hex7v0-chatSpin{to{transform:rotate(360deg)}}.chat-avatar.svelte-1hex7v0.svelte-1hex7v0{width:56px;height:56px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;color:white;background:#94a3b8;flex-shrink:0;position:relative;overflow:visible;box-shadow:0 2px 8px rgba(0,0,0,0.06);transition:transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)}.chat-avatar.svelte-1hex7v0 img.svelte-1hex7v0{width:100%;height:100%;object-fit:cover;border-radius:inherit}.chat-avatar-sm.svelte-1hex7v0.svelte-1hex7v0,.chat-msg-avatar-sm.svelte-1hex7v0.svelte-1hex7v0{width:40px;height:40px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;color:white;background:#94a3b8;flex-shrink:0;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.08)}.chat-msg-avatar-sm.svelte-1hex7v0.svelte-1hex7v0{width:32px;height:32px;border-radius:10px;font-size:0.75rem;margin-top:auto;margin-bottom:2px}.role-dokter-avatar.svelte-1hex7v0.svelte-1hex7v0{background:linear-gradient(135deg, #3b82f6, #1d4ed8)}.role-kasir-avatar.svelte-1hex7v0.svelte-1hex7v0{background:linear-gradient(135deg, #10b981, #047857)}.chat-role-dot.svelte-1hex7v0.svelte-1hex7v0{position:absolute;bottom:-2px;right:-2px;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.1)}.role-dokter-dot.svelte-1hex7v0.svelte-1hex7v0{background:#3b82f6}.role-kasir-dot.svelte-1hex7v0.svelte-1hex7v0{background:#10b981}.chat-role-badge.svelte-1hex7v0.svelte-1hex7v0{display:inline-block;padding:2px 10px;border-radius:8px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em}.role-dokter-badge.svelte-1hex7v0.svelte-1hex7v0{background:#dbeafe;color:#1d4ed8}.role-kasir-badge.svelte-1hex7v0.svelte-1hex7v0{background:#d1fae5;color:#047857}.chat-conversation-list.svelte-1hex7v0.svelte-1hex7v0{overflow-y:auto;flex:1;padding:12px}.chat-conversation-item.svelte-1hex7v0.svelte-1hex7v0{display:flex;align-items:center;gap:16px;padding:16px;margin-bottom:6px;border:none;border-radius:20px;background:transparent;width:100%;text-align:left;cursor:pointer;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1)}.chat-conversation-item.svelte-1hex7v0.svelte-1hex7v0:hover{background:white;box-shadow:0 6px 16px rgba(0,0,0,0.04);transform:translateY(-2px)}.chat-conversation-item.svelte-1hex7v0:hover .chat-avatar.svelte-1hex7v0{transform:scale(1.05)}.chat-conversation-item.has-unread.svelte-1hex7v0.svelte-1hex7v0{background:white;box-shadow:0 4px 12px rgba(0,0,0,0.05)}.chat-conversation-item.has-unread.svelte-1hex7v0.svelte-1hex7v0:hover{box-shadow:0 8px 24px rgba(0,0,0,0.08)}.chat-conversation-info.svelte-1hex7v0.svelte-1hex7v0{flex:1;min-width:0}.chat-conversation-top.svelte-1hex7v0.svelte-1hex7v0{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px}.chat-conversation-name.svelte-1hex7v0.svelte-1hex7v0{font-size:1rem;font-weight:700;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.chat-conversation-time.svelte-1hex7v0.svelte-1hex7v0{font-size:0.75rem;color:#94a3b8;font-weight:500;flex-shrink:0}.has-unread.svelte-1hex7v0 .chat-conversation-time.svelte-1hex7v0{color:var(--primary, #3b82f6);font-weight:700}.chat-conversation-bottom.svelte-1hex7v0.svelte-1hex7v0{display:flex;justify-content:space-between;align-items:center;gap:12px}.chat-conversation-preview.svelte-1hex7v0.svelte-1hex7v0{font-size:0.9rem;color:#64748b;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0}.has-unread.svelte-1hex7v0 .chat-conversation-preview.svelte-1hex7v0{color:#1e293b;font-weight:600}.chat-you.svelte-1hex7v0.svelte-1hex7v0{color:#94a3b8;font-weight:500}.chat-no-msg.svelte-1hex7v0.svelte-1hex7v0{color:#cbd5e1;font-style:italic}.chat-unread-badge.svelte-1hex7v0.svelte-1hex7v0{background:var(--primary, #3b82f6);color:white;font-size:0.75rem;font-weight:700;min-width:24px;height:24px;border-radius:12px;display:flex;align-items:center;justify-content:center;padding:0 6px;flex-shrink:0;box-shadow:0 4px 10px rgba(59, 130, 246, 0.4);animation:svelte-1hex7v0-pulseBadge 2s infinite}@keyframes svelte-1hex7v0-pulseBadge{0%{box-shadow:0 0 0 0 rgba(59, 130, 246, 0.4)}70%{box-shadow:0 0 0 8px rgba(59, 130, 246, 0)}100%{box-shadow:0 0 0 0 rgba(59, 130, 246, 0)}}.chat-search-wrapper.svelte-1hex7v0.svelte-1hex7v0{position:relative;padding:16px 24px 8px;flex-shrink:0;background:#f8fafc}.chat-search-icon.svelte-1hex7v0.svelte-1hex7v0{position:absolute;left:40px;top:55%;transform:translateY(-50%);font-size:22px;color:#64748b}.chat-search-input.svelte-1hex7v0.svelte-1hex7v0{width:100%;padding:14px 16px 14px 48px;border:1px solid rgba(226, 232, 240, 0.8);border-radius:16px;font-size:0.95rem;outline:none;background:white;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);font-family:inherit;color:#0f172a;box-shadow:0 2px 6px rgba(0,0,0,0.02)}.chat-search-input.svelte-1hex7v0.svelte-1hex7v0:focus{border-color:var(--primary, #3b82f6);box-shadow:0 0 0 4px rgba(59,130,246,0.15)}.chat-user-list.svelte-1hex7v0.svelte-1hex7v0{overflow-y:auto;flex:1;padding:12px}.chat-user-item.svelte-1hex7v0.svelte-1hex7v0{display:flex;align-items:center;gap:16px;padding:14px 16px;margin-bottom:6px;border:none;border-radius:20px;background:transparent;width:100%;text-align:left;cursor:pointer;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1)}.chat-user-item.svelte-1hex7v0.svelte-1hex7v0:hover{background:white;box-shadow:0 6px 16px rgba(0,0,0,0.04);transform:translateY(-2px)}.chat-user-info.svelte-1hex7v0.svelte-1hex7v0{display:flex;flex-direction:column;align-items:flex-start;gap:6px}.chat-user-name.svelte-1hex7v0.svelte-1hex7v0{font-size:1rem;font-weight:700;color:#0f172a}.chat-messages.svelte-1hex7v0.svelte-1hex7v0{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:20px;scroll-behavior:smooth}.chat-messages.svelte-1hex7v0.svelte-1hex7v0::-webkit-scrollbar{width:6px}.chat-messages.svelte-1hex7v0.svelte-1hex7v0::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:6px}.chat-messages.svelte-1hex7v0.svelte-1hex7v0::-webkit-scrollbar-thumb:hover{background:#94a3b8}.chat-date-sep.svelte-1hex7v0.svelte-1hex7v0{display:flex;align-items:center;justify-content:center;margin:16px 0 8px}.chat-date-sep.svelte-1hex7v0 span.svelte-1hex7v0{background:rgba(226, 232, 240, 0.7);color:#475569;font-size:0.75rem;font-weight:600;padding:6px 16px;border-radius:12px;backdrop-filter:blur(4px)}.chat-message.svelte-1hex7v0.svelte-1hex7v0{display:flex;gap:12px;max-width:85%;animation:svelte-1hex7v0-msgPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;opacity:0;transform:translateY(16px) scale(0.95)}@keyframes svelte-1hex7v0-msgPopIn{to{opacity:1;transform:translateY(0) scale(1)}}.chat-message-self.svelte-1hex7v0.svelte-1hex7v0{align-self:flex-end;flex-direction:row-reverse}.chat-message-other.svelte-1hex7v0.svelte-1hex7v0{align-self:flex-start}.chat-bubble.svelte-1hex7v0.svelte-1hex7v0{padding:14px 18px;border-radius:20px;max-width:100%;word-wrap:break-word;position:relative;box-shadow:0 4px 6px rgba(0,0,0,0.02)}.chat-bubble-self.svelte-1hex7v0.svelte-1hex7v0{background:var(--primary, #3b82f6);color:white;border-bottom-right-radius:4px;box-shadow:0 6px 16px rgba(0,0,0,0.1)}.chat-bubble-other.svelte-1hex7v0.svelte-1hex7v0{background:white;color:#0f172a;border-bottom-left-radius:4px;border:1px solid rgba(226, 232, 240, 0.6);box-shadow:0 4px 12px rgba(0,0,0,0.03)}.chat-bubble-text.svelte-1hex7v0.svelte-1hex7v0{margin:0;font-size:0.95rem;line-height:1.5;white-space:pre-wrap}.chat-bubble-meta.svelte-1hex7v0.svelte-1hex7v0{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-top:6px}.chat-bubble-time.svelte-1hex7v0.svelte-1hex7v0{font-size:0.7rem;opacity:0.75;font-weight:500}.chat-read-icon.svelte-1hex7v0.svelte-1hex7v0{font-size:16px;opacity:0.6}.chat-read-icon.is-read.svelte-1hex7v0.svelte-1hex7v0{opacity:1;color:#fff;filter:drop-shadow(0 0 2px rgba(255,255,255,0.4))}.chat-bubble-other.svelte-1hex7v0 .chat-read-icon.is-read.svelte-1hex7v0{color:var(--primary, #3b82f6)}.chat-input-wrapper.svelte-1hex7v0.svelte-1hex7v0{padding:16px 24px 20px;background:rgba(255, 255, 255, 0.85);backdrop-filter:blur(16px);border-top:1px solid rgba(226, 232, 240, 0.6);flex-shrink:0;z-index:10}.chat-input-box.svelte-1hex7v0.svelte-1hex7v0{display:flex;align-items:flex-end;gap:12px;background:white;border:1px solid rgba(226, 232, 240, 0.8);border-radius:24px;padding:8px 8px 8px 20px;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);box-shadow:0 4px 12px rgba(0,0,0,0.04)}.chat-textarea.svelte-1hex7v0.svelte-1hex7v0{flex:1;border:none;outline:none;font-size:0.95rem;font-family:inherit;resize:none;max-height:120px;padding:12px 0;line-height:1.5;background:transparent;color:#0f172a}.chat-textarea.svelte-1hex7v0.svelte-1hex7v0:focus{outline:none !important;box-shadow:none !important;border:none !important}.chat-textarea.svelte-1hex7v0.svelte-1hex7v0::placeholder{color:#94a3b8}.chat-send-btn.svelte-1hex7v0.svelte-1hex7v0{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:18px;border:none;background:var(--primary, #3b82f6);color:white;cursor:pointer;transition:all 0.2s cubic-bezier(0.16, 1, 0.3, 1);flex-shrink:0;box-shadow:0 4px 12px rgba(59,130,246,0.3)}.chat-send-btn.svelte-1hex7v0.svelte-1hex7v0:hover:not(:disabled){filter:brightness(1.08);transform:scale(1.05) rotate(-8deg);box-shadow:0 8px 20px rgba(59,130,246,0.4)}.chat-send-btn.svelte-1hex7v0.svelte-1hex7v0:active:not(:disabled){transform:scale(0.95)}.chat-send-btn.svelte-1hex7v0.svelte-1hex7v0:disabled{background:#e2e8f0;color:#94a3b8;cursor:not-allowed;box-shadow:none}.chat-send-btn.svelte-1hex7v0 .material-symbols-outlined.svelte-1hex7v0{font-size:20px;margin-left:2px}.chat-online-dot.svelte-1hex7v0.svelte-1hex7v0{position:absolute;bottom:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 0 0 1px rgba(16, 185, 129, 0.3);animation:svelte-1hex7v0-onlineDotPulse 2s infinite}@keyframes svelte-1hex7v0-onlineDotPulse{0%{box-shadow:0 0 0 0 rgba(16, 185, 129, 0.4)}70%{box-shadow:0 0 0 6px rgba(16, 185, 129, 0)}100%{box-shadow:0 0 0 0 rgba(16, 185, 129, 0)}}.chat-online-pill.svelte-1hex7v0.svelte-1hex7v0{display:inline-flex;align-items:center;gap:6px;background:rgba(16, 185, 129, 0.1);color:#047857;padding:3px 8px;border-radius:12px;font-size:0.65rem;font-weight:700;letter-spacing:0.02em}.chat-online-pulse.svelte-1hex7v0.svelte-1hex7v0{width:6px;height:6px;background:#10b981;border-radius:50%;animation:svelte-1hex7v0-smallPulse 2s infinite}@keyframes svelte-1hex7v0-smallPulse{0%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}100%{opacity:1;transform:scale(1)}}.chat-read-icon.svelte-1hex7v0.svelte-1hex7v0{font-size:14px;opacity:0.8}",
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
  let $$unsubscribe_unreadCount;
  let $isChatOpen, $$unsubscribe_isChatOpen;
  $$unsubscribe_unreadCount = subscribe(unreadCount, (value) => value);
  $$unsubscribe_isChatOpen = subscribe(isChatOpen, (value) => $isChatOpen = value);
  let { user = null } = $$props;
  let view = "conversations";
  let conversations = [];
  let chatUsers = [];
  let messages = [];
  let activeConversation = null;
  let messageInput = "";
  let searchQuery = "";
  let loadingConversations = false;
  let sending = false;
  let messagesContainer;
  let pollConvInterval;
  let pollMsgInterval;
  let pollUnreadInterval;
  let wasChatOpen = false;
  onDestroy(() => {
    clearInterval(pollConvInterval);
    clearInterval(pollMsgInterval);
    clearInterval(pollUnreadInterval);
  });
  function onPanelOpen() {
    clearInterval(pollConvInterval);
    fetchConversations();
    pollConvInterval = setInterval(fetchConversations, 1e4);
  }
  function onPanelClose() {
    clearInterval(pollConvInterval);
    clearInterval(pollMsgInterval);
    view = "conversations";
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
  $$unsubscribe_unreadCount();
  $$unsubscribe_isChatOpen();
  return `${$isChatOpen ? ` <button class="chat-backdrop svelte-1hex7v0" aria-label="Close chat"></button>  <div class="chat-panel svelte-1hex7v0"> <div class="chat-panel-header svelte-1hex7v0">${view === "conversations" ? `<div class="chat-panel-header-left svelte-1hex7v0" data-svelte-h="svelte-qqzopf"><span class="material-symbols-outlined chat-header-icon svelte-1hex7v0">chat</span> <h2 class="svelte-1hex7v0">Messages</h2></div> <div class="chat-panel-header-right svelte-1hex7v0"><button class="chat-icon-btn svelte-1hex7v0" title="New Chat" data-svelte-h="svelte-157w2ir"><span class="material-symbols-outlined svelte-1hex7v0">edit_square</span></button> <button class="chat-icon-btn svelte-1hex7v0" title="Close" data-svelte-h="svelte-1q5jghp"><span class="material-symbols-outlined svelte-1hex7v0">close</span></button></div>` : `${view === "newChat" ? `<div class="chat-panel-header-left svelte-1hex7v0"><button class="chat-icon-btn svelte-1hex7v0" title="Back" data-svelte-h="svelte-1ab99mn"><span class="material-symbols-outlined svelte-1hex7v0">arrow_back</span></button> <h2 class="svelte-1hex7v0" data-svelte-h="svelte-a7xcfy">New Chat</h2></div> <div class="chat-panel-header-right svelte-1hex7v0"><button class="chat-icon-btn svelte-1hex7v0" title="Close" data-svelte-h="svelte-1q5jghp"><span class="material-symbols-outlined svelte-1hex7v0">close</span></button></div>` : `<div class="chat-panel-header-left svelte-1hex7v0"><button class="chat-icon-btn svelte-1hex7v0" title="Back" data-svelte-h="svelte-dzsx6p"><span class="material-symbols-outlined svelte-1hex7v0">arrow_back</span></button> ${activeConversation?.otherUser ? `<div class="chat-header-user svelte-1hex7v0"><div class="${[
    "chat-avatar-sm svelte-1hex7v0",
    (activeConversation.otherUser.role === "dokter" ? "role-dokter-avatar" : "") + " " + (activeConversation.otherUser.role === "kasir" ? "role-kasir-avatar" : "")
  ].join(" ").trim()}">${activeConversation.otherUser.profile_image_url ? `<img${add_attribute("src", activeConversation.otherUser.profile_image_url, 0)}${add_attribute("alt", activeConversation.otherUser.name, 0)}>` : `${escape(getInitials(activeConversation.otherUser.name))}`}</div> <div style="display: flex; flex-direction: column; gap: 4px;"><div style="display: flex; align-items: center; gap: 8px;"><p class="chat-header-name svelte-1hex7v0">${escape(activeConversation.otherUser.name)}</p> ${activeConversation.otherUser.is_online ? `<div class="chat-online-pill svelte-1hex7v0" data-svelte-h="svelte-1d2dxay"><span class="chat-online-pulse svelte-1hex7v0"></span>
											Online</div>` : ``}</div> <div><span class="${[
    "chat-role-badge svelte-1hex7v0",
    (activeConversation.otherUser.role === "dokter" ? "role-dokter-badge" : "") + " " + (activeConversation.otherUser.role === "kasir" ? "role-kasir-badge" : "")
  ].join(" ").trim()}">${escape(activeConversation.otherUser.role === "dokter" ? "Dokter" : "Kasir")}</span></div></div></div>` : ``}</div> <div class="chat-panel-header-right svelte-1hex7v0"><button class="chat-icon-btn svelte-1hex7v0" title="Close" data-svelte-h="svelte-1q5jghp"><span class="material-symbols-outlined svelte-1hex7v0">close</span></button></div>`}`}</div>  <div class="chat-panel-body svelte-1hex7v0">${view === "conversations" ? ` ${loadingConversations ? `<div class="chat-empty-state svelte-1hex7v0" data-svelte-h="svelte-1bzlrh5"><div class="chat-spinner svelte-1hex7v0"></div> <p>Loading conversations...</p></div>` : `${conversations.length === 0 ? `<div class="chat-empty-state svelte-1hex7v0"><span class="material-symbols-outlined chat-empty-icon svelte-1hex7v0" data-svelte-h="svelte-62e0jw">forum</span> <p class="chat-empty-title svelte-1hex7v0" data-svelte-h="svelte-jzslmx">No conversations yet</p> <p class="chat-empty-subtitle svelte-1hex7v0" data-svelte-h="svelte-130js0d">Start a new chat with your team</p> <button class="chat-start-btn svelte-1hex7v0" data-svelte-h="svelte-1kdeiyt"><span class="material-symbols-outlined">add</span>
							New Chat</button></div>` : `<div class="chat-conversation-list svelte-1hex7v0">${each(conversations, (conv) => {
    return `<button class="${[
      "chat-conversation-item svelte-1hex7v0",
      conv.unreadCount > 0 ? "has-unread" : ""
    ].join(" ").trim()}"><div class="${[
      "chat-avatar svelte-1hex7v0",
      (conv.otherUser?.role === "dokter" ? "role-dokter-avatar" : "") + " " + (conv.otherUser?.role === "kasir" ? "role-kasir-avatar" : "")
    ].join(" ").trim()}">${conv.otherUser?.profile_image_url ? `<img${add_attribute("src", conv.otherUser.profile_image_url, 0)}${add_attribute("alt", conv.otherUser?.name, 0)} class="svelte-1hex7v0">` : `${escape(getInitials(conv.otherUser?.name))}`} ${conv.otherUser?.is_online ? `<span class="chat-online-dot svelte-1hex7v0"></span>` : `<span class="${[
      "chat-role-dot svelte-1hex7v0",
      (conv.otherUser?.role === "dokter" ? "role-dokter-dot" : "") + " " + (conv.otherUser?.role === "kasir" ? "role-kasir-dot" : "")
    ].join(" ").trim()}"></span>`}</div> <div class="chat-conversation-info svelte-1hex7v0"><div class="chat-conversation-top svelte-1hex7v0"><span class="chat-conversation-name svelte-1hex7v0">${escape(conv.otherUser?.name || "Unknown")}</span> <span class="chat-conversation-time svelte-1hex7v0">${escape(timeAgo(conv.lastMessage?.created_at || conv.created_at))}</span></div> <div class="chat-conversation-bottom svelte-1hex7v0"><p class="chat-conversation-preview svelte-1hex7v0">${conv.lastMessage ? `${conv.lastMessage.sender_id === user?.id ? `<span class="chat-you svelte-1hex7v0" data-svelte-h="svelte-zqp5ug">You: </span>` : ``}${escape(conv.lastMessage.content)}` : `<span class="chat-no-msg svelte-1hex7v0" data-svelte-h="svelte-7ul4bu">No messages yet</span>`}</p> ${conv.unreadCount > 0 ? `<span class="chat-unread-badge svelte-1hex7v0">${escape(conv.unreadCount)}</span>` : ``} </div></div> </button>`;
  })}</div>`}`}` : `${view === "newChat" ? ` <div class="chat-search-wrapper svelte-1hex7v0"><span class="material-symbols-outlined chat-search-icon svelte-1hex7v0" data-svelte-h="svelte-1r59eqs">search</span> <input class="chat-search-input svelte-1hex7v0" placeholder="Search by name..." type="text"${add_attribute("value", searchQuery, 0)}></div> ${`${filteredUsers.length === 0 ? `<div class="chat-empty-state svelte-1hex7v0" data-svelte-h="svelte-1yt054v"><span class="material-symbols-outlined chat-empty-icon svelte-1hex7v0">person_off</span> <p class="chat-empty-title svelte-1hex7v0">No users found</p></div>` : `<div class="chat-user-list svelte-1hex7v0">${each(filteredUsers, (u) => {
    return `<button class="chat-user-item svelte-1hex7v0"><div class="${[
      "chat-avatar svelte-1hex7v0",
      (u.role === "dokter" ? "role-dokter-avatar" : "") + " " + (u.role === "kasir" ? "role-kasir-avatar" : "")
    ].join(" ").trim()}">${u.profile_image_url ? `<img${add_attribute("src", u.profile_image_url, 0)}${add_attribute("alt", u.name, 0)} class="svelte-1hex7v0">` : `${escape(getInitials(u.name))}`} ${u.is_online ? `<span class="chat-online-dot svelte-1hex7v0"></span>` : ``}</div> <div class="chat-user-info svelte-1hex7v0"><span class="chat-user-name svelte-1hex7v0">${escape(u.name)}</span> <span class="${[
      "chat-role-badge svelte-1hex7v0",
      (u.role === "dokter" ? "role-dokter-badge" : "") + " " + (u.role === "kasir" ? "role-kasir-badge" : "")
    ].join(" ").trim()}">${escape(u.role === "dokter" ? "Dokter" : "Kasir")} </span></div> </button>`;
  })}</div>`}`}` : ` <div class="chat-messages svelte-1hex7v0"${add_attribute("this", messagesContainer, 0)}>${`${messages.length === 0 ? `<div class="chat-empty-state svelte-1hex7v0" data-svelte-h="svelte-1xvtefe"><span class="material-symbols-outlined chat-empty-icon svelte-1hex7v0">waving_hand</span> <p class="chat-empty-title svelte-1hex7v0">Say hello!</p> <p class="chat-empty-subtitle svelte-1hex7v0">Start the conversation</p></div>` : `${each(messages, (msg, idx) => {
    return `${shouldShowDateSeparator(idx) ? `<div class="chat-date-sep svelte-1hex7v0"><span class="svelte-1hex7v0">${escape(formatDateSeparator(msg.created_at))}</span> </div>` : ``} <div class="${[
      "chat-message svelte-1hex7v0",
      (msg.sender_id === user?.id ? "chat-message-self" : "") + " " + (msg.sender_id !== user?.id ? "chat-message-other" : "")
    ].join(" ").trim()}">${msg.sender_id !== user?.id ? `<div class="${[
      "chat-msg-avatar-sm svelte-1hex7v0",
      (msg.sender_role === "dokter" ? "role-dokter-avatar" : "") + " " + (msg.sender_role === "kasir" ? "role-kasir-avatar" : "")
    ].join(" ").trim()}">${msg.sender_profile_image_url ? `<img${add_attribute("src", msg.sender_profile_image_url, 0)}${add_attribute("alt", msg.sender_name, 0)}>` : `${escape(getInitials(msg.sender_name))}`} </div>` : ``} <div class="${[
      "chat-bubble svelte-1hex7v0",
      (msg.sender_id === user?.id ? "chat-bubble-self" : "") + " " + (msg.sender_id !== user?.id ? "chat-bubble-other" : "")
    ].join(" ").trim()}"><p class="chat-bubble-text svelte-1hex7v0">${escape(msg.content)}</p> <div class="chat-bubble-meta svelte-1hex7v0"><span class="chat-bubble-time svelte-1hex7v0">${escape(formatTime(msg.created_at))}</span> ${msg.sender_id === user?.id ? `<span class="${[
      "material-symbols-outlined chat-read-icon svelte-1hex7v0",
      msg.read_at ? "is-read" : ""
    ].join(" ").trim()}">${escape(msg.read_at ? "done_all" : "done")} </span>` : ``} </div></div> </div>`;
  })}`}`}</div>  <div class="chat-input-wrapper svelte-1hex7v0"><div class="chat-input-box svelte-1hex7v0"><textarea class="chat-textarea svelte-1hex7v0" placeholder="Type a message..." rows="1" ${""}>${escape("")}</textarea> <button class="chat-send-btn svelte-1hex7v0" ${!messageInput.trim() || sending ? "disabled" : ""} title="Send"><span class="material-symbols-outlined svelte-1hex7v0">${escape("send")}</span></button></div></div>`}`}</div></div>` : ``}`;
});
export {
  ChatPanel as C,
  Sidebar as S,
  isChatOpen as i,
  unreadCount as u
};
