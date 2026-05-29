import { c as create_ssr_component, o as onDestroy, e as escape, g as each, f as add_attribute } from "../../../chunks/ssr.js";
/* empty css                                                       */import { b as getJakartaDateString, f as formatDate } from "../../../chunks/formatters.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let todayQueue;
  let inProgress;
  let sortedReferrals;
  let { data } = $$props;
  let encounters = [];
  let filterDate = getJakartaDateString();
  let selectedEncounterData = null;
  let referrals = [];
  let stats = {
    patientsToday: 0,
    completedToday: 0,
    avgWaitMinutes: 0,
    avgTreatmentMinutes: 0
  };
  onDestroy(() => {
  });
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  data?.user;
  todayQueue = encounters.filter((e) => ["Planned", "Arrived", "On Hold"].includes(e.encounter?.status));
  inProgress = encounters.filter((e) => e.encounter?.status === "In Progress");
  encounters.filter((e) => ["Discharged", "Completed"].includes(e.encounter?.status));
  sortedReferrals = [...referrals].sort((a, b) => {
    return 0;
  });
  (() => {
    const status = selectedEncounterData?.encounter?.status;
    const map = {
      "In Progress": {
        badge: "bg-blue-500",
        bg: "from-blue-100 to-blue-50",
        text: "text-blue-600"
      },
      Arrived: {
        badge: "bg-emerald-500",
        bg: "from-emerald-100 to-emerald-50",
        text: "text-emerald-600"
      },
      Planned: {
        badge: "bg-amber-400",
        bg: "from-amber-100 to-amber-50",
        text: "text-amber-600"
      },
      "On Hold": {
        badge: "bg-rose-400",
        bg: "from-rose-100 to-rose-50",
        text: "text-rose-600"
      },
      Referral: {
        badge: "bg-purple-500",
        bg: "from-purple-100 to-purple-50",
        text: "text-purple-600"
      },
      Discharged: {
        badge: "bg-emerald-500",
        bg: "from-emerald-100 to-emerald-50",
        text: "text-emerald-600"
      },
      Completed: {
        badge: "bg-emerald-500",
        bg: "from-emerald-100 to-emerald-50",
        text: "text-emerald-600"
      }
    };
    return map[status] || {
      badge: "bg-slate-400",
      bg: "from-slate-100 to-slate-50",
      text: "text-slate-600"
    };
  })();
  return `${$$result.head += `<!-- HEAD_svelte-3sbvp1_START -->${$$result.title = `<title>Dashboard Dokter — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-3sbvp1_END -->`, ""} <div class="-m-6 flex h-[calc(100vh-73px)] bg-slate-50 overflow-hidden font-sans relative"><section class="${"flex-1 min-w-0 " + escape(
    "mr-0",
    true
  ) + " transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden custom-scrollbar p-6"}"> <div class="flex items-center justify-end mb-6"><p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${escape((/* @__PURE__ */ new Date(filterDate + "T00:00:00")).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }))}</p></div> <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"> <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow"><div><p class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2" data-svelte-h="svelte-n3dbfh">Patients Today</p> <div class="flex items-center gap-2 mt-1"><h3 class="text-3xl font-black text-blue-900 leading-tight">${escape(0)}</h3> ${stats.patientsTodayChange !== void 0 ? (() => {
    let chg = stats.patientsTodayChange, isZero = chg === 0, isPos = chg > 0;
    return `   ${isZero ? `<span class="text-slate-400 text-xs font-bold flex items-center" data-svelte-h="svelte-j0onmh">-</span>` : `<span class="${escape(isPos ? "text-green-500" : "text-red-500", true) + " text-xs font-bold flex items-center"}">${escape(isPos ? "+" : "-")}${escape(Math.abs(chg))}% <span class="material-symbols-outlined text-[14px]">${escape(isPos ? "trending_up" : "trending_down")}</span></span>`}`;
  })() : ``}</div></div> <div class="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" data-svelte-h="svelte-wezqd5"><span class="material-symbols-outlined text-2xl">patient_list</span></div></div>  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow"><div><p class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2" data-svelte-h="svelte-9uoe3q">Avg. Wait Time</p> <div class="flex items-center gap-2 mt-1"><h3 class="text-3xl font-black text-blue-900 leading-tight">${escape(0)}<span class="text-sm font-bold text-slate-400 ml-1" data-svelte-h="svelte-em1fw">m</span></h3> ${stats.avgWaitMinutesChange !== void 0 ? (() => {
    let chg = stats.avgWaitMinutesChange, isZero = chg === 0, isPos = chg > 0;
    return `   ${isZero ? `<span class="text-slate-400 text-xs font-bold flex items-center" data-svelte-h="svelte-j0onmh">-</span>` : `<span class="${escape(isPos ? "text-green-500" : "text-red-500", true) + " text-xs font-bold flex items-center"}">${escape(isPos ? "+" : "-")}${escape(Math.abs(chg))}% <span class="material-symbols-outlined text-[14px]">${escape(isPos ? "trending_up" : "trending_down")}</span></span>`}`;
  })() : ``}</div></div> <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" data-svelte-h="svelte-1gc7yba"><span class="material-symbols-outlined text-2xl">hourglass_empty</span></div></div>  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow"><div><p class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2" data-svelte-h="svelte-hgtcxp">Avg. Treatment Time</p> <div class="flex items-center gap-2 mt-1"><h3 class="text-3xl font-black text-blue-900 leading-tight">${escape(0)}<span class="text-sm font-bold text-slate-400 ml-1" data-svelte-h="svelte-em1fw">m</span></h3> ${stats.avgTreatmentMinutesChange !== void 0 ? (() => {
    let chg = stats.avgTreatmentMinutesChange, isZero = chg === 0, isPos = chg > 0;
    return `   ${isZero ? `<span class="text-slate-400 text-xs font-bold flex items-center" data-svelte-h="svelte-j0onmh">-</span>` : `<span class="${escape(isPos ? "text-green-500" : "text-red-500", true) + " text-xs font-bold flex items-center"}">${escape(isPos ? "+" : "-")}${escape(Math.abs(chg))}% <span class="material-symbols-outlined text-[14px]">${escape(isPos ? "trending_up" : "trending_down")}</span></span>`}`;
  })() : ``}</div></div> <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" data-svelte-h="svelte-lisvrf"><span class="material-symbols-outlined text-2xl">schedule</span></div></div>  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-shadow"><div><p class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-2" data-svelte-h="svelte-7cr58r">Completed</p> <div class="flex items-center gap-2 mt-1"><h3 class="text-3xl font-black text-blue-900 leading-tight">${escape(0)} <span class="text-sm font-bold text-slate-300 mx-1" data-svelte-h="svelte-9uhk1h">/</span> <span class="text-xl text-slate-400">${escape(0)}</span></h3> ${stats.completedTodayChange !== void 0 ? (() => {
    let chg = stats.completedTodayChange, isZero = chg === 0, isPos = chg > 0;
    return `   ${isZero ? `<span class="text-slate-400 text-xs font-bold flex items-center" data-svelte-h="svelte-j0onmh">-</span>` : `<span class="${escape(isPos ? "text-green-500" : "text-red-500", true) + " text-xs font-bold flex items-center"}">${escape(isPos ? "+" : "-")}${escape(Math.abs(chg))}% <span class="material-symbols-outlined text-[14px]">${escape(isPos ? "trending_up" : "trending_down")}</span></span>`}`;
  })() : ``}</div></div> <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" data-svelte-h="svelte-3i1pyv"><span class="material-symbols-outlined text-2xl">check_circle</span></div></div></div>  <div class="mb-10" style="display: grid; grid-template-columns: minmax(0, 1fr);"><div class="flex items-center justify-between mb-6"><h3 class="text-lg font-bold text-blue-900 flex items-center gap-2" data-svelte-h="svelte-1rri4ys"><span class="material-symbols-outlined text-primary">pending_actions</span>
					Active Patient Queue</h3> <span class="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-md">${escape(todayQueue.length + inProgress.length)} IN QUEUE</span></div> ${`<div style="text-align: center; padding: 2rem;" data-svelte-h="svelte-1hiyi91"><div class="spinner spinner-lg" style="margin: 0 auto;"></div></div>`}</div>  <div><div class="flex items-center justify-between mb-6" data-svelte-h="svelte-u7njmg"><h3 class="text-lg font-bold text-blue-900 flex items-center gap-2"><span class="material-symbols-outlined text-primary">inbox</span>
					Referral Inbox</h3> <button class="text-[11px] font-bold text-primary uppercase tracking-widest hover:underline">View All</button></div> <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"><table class="w-full text-left"><thead><tr class="bg-slate-50/50"><th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors select-none group"><div class="flex items-center gap-1">Sender Doctor<span class="${"material-symbols-outlined text-[14px] " + escape(
    "text-slate-300 opacity-0 group-hover:opacity-100",
    true
  )}">${escape("unfold_more")}</span></div></th> <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors select-none group"><div class="flex items-center gap-1">Date<span class="${"material-symbols-outlined text-[14px] " + escape(
    "text-slate-300 opacity-0 group-hover:opacity-100",
    true
  )}">${escape("unfold_more")}</span></div></th> <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors select-none group"><div class="flex items-center gap-1">Patient Name<span class="${"material-symbols-outlined text-[14px] " + escape(
    "text-slate-300 opacity-0 group-hover:opacity-100",
    true
  )}">${escape("unfold_more")}</span></div></th> <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors select-none group"><div class="flex items-center gap-1">Note<span class="${"material-symbols-outlined text-[14px] " + escape(
    "text-slate-300 opacity-0 group-hover:opacity-100",
    true
  )}">${escape("unfold_more")}</span></div></th></tr></thead> <tbody class="divide-y divide-slate-50">${`${referrals.length > 0 ? `${each(sortedReferrals, (ref) => {
    return `<tr class="hover:bg-slate-50 transition-colors cursor-pointer group"><td class="px-6 py-5"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 shadow-sm overflow-hidden">${ref.sender_profile_image ? `<img${add_attribute("src", ref.sender_profile_image, 0)}${add_attribute("alt", ref.sender_name, 0)} class="w-full h-full object-cover">` : `${escape(ref.sender_name?.[0] || "D")}`}</div> <div><div class="text-sm font-bold text-slate-900">${escape(ref.sender_name)}</div> <div class="text-[10px] text-slate-400" data-svelte-h="svelte-1c1eu56">Sender Doctor
												</div></div> </div></td> <td class="px-6 py-5 text-xs text-slate-600 font-medium">${escape(formatDate(ref.referral_date))}</td> <td class="px-6 py-5"><div class="text-sm font-bold text-slate-900">${escape(ref.patient_name)}</div> <div class="text-[10px] text-slate-400">ID: ${escape(ref.patient_id)} </div></td> <td class="px-6 py-5"><p class="text-sm text-slate-500 line-clamp-1 italic">&quot;${escape(ref.note || "No note")}&quot;
										</p></td> </tr>`;
  })}` : `<tr data-svelte-h="svelte-1k97pf4"><td colspan="4" class="px-6 py-10 text-center text-slate-400 text-sm font-medium">Tidak ada rujukan masuk saat ini.</td></tr>`}`}</tbody></table></div></div></section>  <aside class="${"fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-slate-200 z-[40] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out " + escape(
    "translate-x-full",
    true
  )}">${`<div class="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400" data-svelte-h="svelte-1ggzdzk"><span class="material-symbols-outlined text-6xl mb-4 text-slate-200">person_search</span> <h3 class="text-lg font-bold text-slate-500 mb-2">No Patient Selected</h3> <p class="text-xs">Select a patient from the active queue to view details</p></div>`}</aside>  ${``}</div>`;
});
export {
  Page as default
};
