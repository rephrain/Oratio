import { c as create_ssr_component, o as onDestroy, f as add_attribute, e as escape } from './ssr-631a3160.js';

/* empty css                                                       */const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let todayQueue;
  let inProgress;
  let completedToday;
  let { data } = $$props;
  let encounters = [];
  let filterDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  onDestroy(() => {
  });
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  data?.user;
  todayQueue = encounters.filter((e) => ["Planned", "Arrived"].includes(e.encounter?.status));
  inProgress = encounters.filter((e) => e.encounter?.status === "In Progress");
  completedToday = encounters.filter((e) => ["Discharged", "Completed"].includes(e.encounter?.status));
  return `${$$result.head += `<!-- HEAD_svelte-jz3vod_START -->${$$result.title = `<title>Dashboard Dokter — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-jz3vod_END -->`, ""} <div> ${`${``}`} <div style="margin-top: var(--space-4);"><div class="flex items-center justify-between mb-6"><h1 class="page-title" style="margin: 0;" data-svelte-h="svelte-1940k1g">Dashboard</h1> <input type="date" class="form-input" style="width: auto;"${add_attribute("value", filterDate, 0)}></div>  <div class="stats-grid mb-6"><div class="stat-card"><div class="stat-icon stat-icon-warning" data-svelte-h="svelte-9ruu85">⏳</div> <div><div class="stat-value">${escape(todayQueue.length)}</div> <div class="stat-label" data-svelte-h="svelte-1ogr8pq">Menunggu</div></div></div> <div class="stat-card"><div class="stat-icon stat-icon-primary" data-svelte-h="svelte-zgav5f">🔄</div> <div><div class="stat-value">${escape(inProgress.length)}</div> <div class="stat-label" data-svelte-h="svelte-110wnmv">Dalam Proses</div></div></div> <div class="stat-card"><div class="stat-icon stat-icon-success" data-svelte-h="svelte-1nlwppm">✅</div> <div><div class="stat-value">${escape(completedToday.length)}</div> <div class="stat-label" data-svelte-h="svelte-1os7vky">Selesai</div></div></div> <div class="stat-card"><div class="stat-icon" style="background: var(--info-light); color: var(--info);" data-svelte-h="svelte-1qix80i">📊</div> <div><div class="stat-value">${escape(encounters.length)}</div> <div class="stat-label" data-svelte-h="svelte-119ug0s">Total Hari Ini</div></div></div></div>  ${`<div style="text-align: center; padding: var(--space-16);" data-svelte-h="svelte-t114a0"><div class="spinner spinner-lg" style="margin: 0 auto;"></div></div>`}</div></div>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-c9aa1f6f.js.map
