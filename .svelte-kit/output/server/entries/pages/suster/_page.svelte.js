import { c as create_ssr_component, o as onDestroy, f as add_attribute, e as escape, g as each } from "../../../chunks/ssr.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "@keyframes svelte-83o9qe-fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}@keyframes svelte-83o9qe-scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}@keyframes svelte-83o9qe-float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-16px) scale(1.05)}}.animate-fade-in-up.svelte-83o9qe{animation:svelte-83o9qe-fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards}.animate-scale-in.svelte-83o9qe{animation:svelte-83o9qe-scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards}.animate-float.svelte-83o9qe{animation:svelte-83o9qe-float 10s ease-in-out infinite}.animate-float-slow.svelte-83o9qe{animation:svelte-83o9qe-float 14s ease-in-out infinite;animation-delay:2s}.delay-100.svelte-83o9qe{animation-delay:100ms}.delay-200.svelte-83o9qe{animation-delay:200ms}.delay-300.svelte-83o9qe{animation-delay:300ms}.delay-400.svelte-83o9qe{animation-delay:400ms}.opacity-0.svelte-83o9qe{opacity:0}@media(prefers-reduced-motion: reduce){.animate-fade-in-up.svelte-83o9qe,.animate-scale-in.svelte-83o9qe,.animate-float.svelte-83o9qe,.animate-float-slow.svelte-83o9qe{animation:none !important;opacity:1 !important;transform:none !important}}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let user;
  let formattedDate;
  let formattedTime;
  let { data } = $$props;
  let greeting = "";
  let glCanvas;
  let now = /* @__PURE__ */ new Date();
  const todayStats = [
    {
      icon: "groups",
      value: "8",
      label: "Patients Today"
    },
    {
      icon: "fact_check",
      value: "3",
      label: "Charts Pending Review"
    },
    {
      icon: "event_upcoming",
      value: "10:30",
      label: "Next Appointment · Room 3"
    }
  ];
  const accentStyles = {
    primary: {
      blob: "bg-primary/5",
      iconBg: "bg-primary/10",
      iconText: "text-primary",
      hoverBorder: "hover:border-primary/30",
      hoverShadow: "hover:shadow-[0_8px_30px_rgba(225,29,72,0.15)]",
      hoverTitle: "group-hover:text-primary",
      ctaText: "text-primary"
    },
    teal: {
      blob: "bg-teal-500/5",
      iconBg: "bg-teal-500/10",
      iconText: "text-teal-600",
      hoverBorder: "hover:border-teal-600/30",
      hoverShadow: "hover:shadow-[0_8px_30px_rgba(13,148,136,0.15)]",
      hoverTitle: "group-hover:text-teal-600",
      ctaText: "text-teal-600"
    },
    sky: {
      blob: "bg-sky-500/5",
      iconBg: "bg-sky-500/10",
      iconText: "text-sky-600",
      hoverBorder: "hover:border-sky-600/30",
      hoverShadow: "hover:shadow-[0_8px_30px_rgba(2,132,199,0.15)]",
      hoverTitle: "group-hover:text-sky-600",
      ctaText: "text-sky-600"
    },
    amber: {
      blob: "bg-amber-500/5",
      iconBg: "bg-amber-500/10",
      iconText: "text-amber-600",
      hoverBorder: "hover:border-amber-600/30",
      hoverShadow: "hover:shadow-[0_8px_30px_rgba(217,119,6,0.15)]",
      hoverTitle: "group-hover:text-amber-600",
      ctaText: "text-amber-600"
    }
  };
  const quickActions = [
    {
      href: "/suster/history",
      icon: "history",
      title: "Encounter History",
      description: "Access recent patient records, review detailed SOAP notes, and manage ongoing clinical encounters.",
      cta: "View Records",
      accent: "primary",
      delay: "delay-100"
    },
    {
      href: "/suster/patients",
      icon: "patient_list",
      title: "Patient Registry",
      description: "Browse the complete patient database, verify medical histories, and update critical allergy information.",
      cta: "Manage Registry",
      accent: "teal",
      delay: "delay-200"
    },
    {
      href: "/suster/schedule",
      icon: "calendar_today",
      title: "Today's Schedule",
      description: "View today's full appointment list, confirm arrivals, and prepare treatment rooms ahead of time.",
      cta: "View Schedule",
      accent: "sky",
      delay: "delay-300"
    },
    {
      href: "/suster/sterilization",
      icon: "sanitizer",
      title: "Sterilization Log",
      description: "Record and verify instrument sterilization cycles to keep every treatment room compliant and safe.",
      cta: "Open Log",
      accent: "amber",
      delay: "delay-400"
    }
  ];
  onDestroy(() => {
  });
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  user = data?.user;
  formattedDate = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  formattedTime = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${$$result.head += `<!-- HEAD_svelte-c7aonc_START -->${$$result.title = `<title>Suster Dashboard — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-c7aonc_END -->`, ""}  <canvas aria-hidden="true" class="fixed inset-0 w-full h-full -z-10 dark:opacity-5 transition-opacity duration-500"${add_attribute("this", glCanvas, 0)}></canvas> <div class="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full animate-fade-in-up opacity-0 svelte-83o9qe"> <section aria-labelledby="welcome-heading" class="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-[0px_8px_32px_rgba(225,29,72,0.08)] mb-8 p-8 lg:p-12 animate-scale-in opacity-0 svelte-83o9qe"><div class="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-float svelte-83o9qe"></div> <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl pointer-events-none animate-float-slow svelte-83o9qe"></div> <div class="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"><div class="max-w-2xl"><div class="flex flex-wrap items-center gap-2 mb-6"><div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary" data-svelte-h="svelte-1gbyxzq"><span class="material-symbols-outlined text-[16px]">medical_services</span> <span class="text-xs font-bold uppercase tracking-wider">Clinical Dashboard</span></div> <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"><span class="material-symbols-outlined text-[16px]" data-svelte-h="svelte-1xxm79w">calendar_today</span> <span class="text-xs font-semibold">${escape(formattedDate)}</span></div></div> <h2 id="welcome-heading" class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight leading-tight">${escape(greeting)}, <span class="text-primary">${escape(user?.name || "Suster")}</span></h2> <p class="text-lg text-slate-600 dark:text-slate-400" data-svelte-h="svelte-89mv68">Your shift is currently active. You have access to patient histories and editing capabilities for today&#39;s encounters.</p></div>  <div class="hidden lg:flex flex-col items-center justify-center gap-2 w-48 h-48 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 shadow-xl flex-shrink-0 p-6"><span class="relative flex h-3 w-3 mb-1" data-svelte-h="svelte-1u837hs"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span> <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span> <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider" data-svelte-h="svelte-519z7i">Shift Active</p> <p class="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight" aria-label="Current time">${escape(formattedTime)}</p> <p class="text-xs text-slate-500 dark:text-slate-400 text-center leading-snug">WIB · ${escape(user?.name ? "On duty" : "Nurse station")}</p></div></div></section>  <section aria-labelledby="glance-heading" class="mb-12"><h3 id="glance-heading" class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 animate-fade-in-up opacity-0 delay-100 svelte-83o9qe" data-svelte-h="svelte-167xtap"><span class="material-symbols-outlined text-primary text-[20px]">insights</span>
			Today at a Glance</h3> <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">${each(todayStats, (stat, i) => {
    return `<div class="flex items-center gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-[0px_4px_20px_rgba(225,29,72,0.04)] animate-fade-in-up opacity-0 svelte-83o9qe" style="${"animation-delay: " + escape(150 + i * 100, true) + "ms"}"><div class="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0"><span class="material-symbols-outlined text-[22px]">${escape(stat.icon)}</span></div> <div class="min-w-0"><p class="text-2xl font-extrabold text-slate-900 dark:text-white leading-none tabular-nums">${escape(stat.value)}</p> <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">${escape(stat.label)}</p></div> </div>`;
  })}</div></section>  <section aria-labelledby="operations-heading"><h3 id="operations-heading" class="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 animate-fade-in-up opacity-0 delay-100 svelte-83o9qe" data-svelte-h="svelte-n4wz7y"><span class="material-symbols-outlined text-primary">bolt</span>
			Quick Operations</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-6">${each(quickActions, (action) => {
    let s = accentStyles[action.accent];
    return ` <a${add_attribute("href", action.href, 0)} class="${"group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 lg:p-8 shadow-[0px_4px_20px_rgba(225,29,72,0.04)] border border-slate-200/50 dark:border-slate-700/50 " + escape(s.hoverBorder, true) + " transition-all duration-300 hover:-translate-y-1 " + escape(s.hoverShadow, true) + " flex flex-col h-full animate-fade-in-up opacity-0 " + escape(action.delay, true) + " svelte-83o9qe"}"><div class="${"absolute top-0 right-0 w-32 h-32 " + escape(s.blob, true) + " rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 svelte-83o9qe"}"></div> <div class="${"w-14 h-14 rounded-xl " + escape(s.iconBg, true) + " flex items-center justify-center mb-6 " + escape(s.iconText, true) + " group-hover:animate-pulse transition-all svelte-83o9qe"}"><span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">${escape(action.icon)}</span></div> <h4 class="${"text-xl font-bold text-slate-900 dark:text-white mb-2 " + escape(s.hoverTitle, true) + " transition-colors svelte-83o9qe"}">${escape(action.title)}</h4> <p class="text-base text-slate-500 dark:text-slate-400 mb-8 flex-1">${escape(action.description)}</p> <div class="${"flex items-center " + escape(s.ctaText, true) + " text-sm font-bold mt-auto svelte-83o9qe"}">${escape(action.cta)} <span class="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform" data-svelte-h="svelte-1t1kprj">arrow_forward</span></div> </a>`;
  })}</div></section> </div>`;
});
export {
  Page as default
};
