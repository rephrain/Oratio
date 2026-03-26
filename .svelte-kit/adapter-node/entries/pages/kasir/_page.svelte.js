import { c as create_ssr_component, o as onDestroy, d as add_attribute, e as escape } from "../../../chunks/ssr.js";
/* empty css                                                       */import { Q as QUEUE_COLUMNS } from "../../../chunks/constants.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let waitingCount;
  let inProgressCount;
  let dischargedCount;
  let completedCount;
  let encounters = [];
  let filterDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  onDestroy(() => {
  });
  waitingCount = encounters.filter((e) => ["Planned", "Arrived"].includes(e.encounter?.status)).length;
  inProgressCount = encounters.filter((e) => e.encounter?.status === "In Progress").length;
  dischargedCount = encounters.filter((e) => e.encounter?.status === "Discharged").length;
  completedCount = encounters.filter((e) => e.encounter?.status === "Completed").length;
  QUEUE_COLUMNS.map((col) => ({
    ...col,
    items: encounters.filter((e) => col.statuses.includes(e.encounter?.status))
  }));
  return `${$$result.head += `<!-- HEAD_svelte-1jxjtsd_START -->${$$result.title = `<title>Antrian — Oratio Dental</title>`, ""}<!-- HEAD_svelte-1jxjtsd_END -->`, ""} <div><div class="flex items-center justify-between mb-6"><h1 class="page-title" style="margin: 0;" data-svelte-h="svelte-10035vj">Manajemen Antrian</h1> <div class="flex gap-3"><input type="date" class="form-input" style="width: auto;"${add_attribute("value", filterDate, 0)}> <div class="flex gap-1" style="background: var(--gray-100); border-radius: var(--radius-md); padding: 2px;"><button class="${["tab", "active"].join(" ").trim()}" data-svelte-h="svelte-epyxkx">Board</button> <button class="${["tab", ""].join(" ").trim()}" data-svelte-h="svelte-1v40pf7">Tabel</button></div></div></div>  <div class="summary-bar"><div class="summary-item"><span class="summary-dot" style="background: var(--warning);"></span> <strong>${escape(waitingCount)}</strong> menunggu</div> <div class="summary-item"><span class="summary-dot" style="background: var(--primary);"></span> <strong>${escape(inProgressCount)}</strong> dalam proses</div> <div class="summary-item"><span class="summary-dot" style="background: var(--success);"></span> <strong>${escape(dischargedCount)}</strong> selesai periksa</div> <div class="summary-item"><span class="summary-dot" style="background: var(--gray-400);"></span> <strong>${escape(completedCount)}</strong> selesai hari ini</div></div> ${`<div style="text-align: center; padding: var(--space-16);" data-svelte-h="svelte-1a8rdz6"><div class="spinner spinner-lg" style="margin: 0 auto;"></div> <p class="text-muted mt-4">Memuat antrian...</p></div>`}</div>`;
});
export {
  Page as default
};
