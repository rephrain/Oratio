import { c as create_ssr_component, o as onDestroy, f as add_attribute } from './ssr-631a3160.js';

function getMonthStart() {
  const d = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  let encounters = [];
  let dateFrom = getMonthStart();
  let dateTo = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Jakarta" })).toISOString().split("T")[0];
  onDestroy(() => {
  });
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  data?.user;
  encounters.filter((e) => {
    const d = new Date(e.encounter?.created_at).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
    const today = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Jakarta" })).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
    return d === today;
  }).length;
  encounters.filter((e) => {
    const d = new Date(e.encounter?.created_at);
    const now = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
    return d >= weekAgo;
  }).length;
  encounters.filter((e) => e.encounter?.status === "Completed").length;
  encounters.filter((e) => e.encounter?.status === "Discharged").length;
  encounters.filter((e) => ["Cancelled", "Discontinued"].includes(e.encounter?.status)).length;
  encounters.filter((e) => e.encounter?.status === "In Progress").length;
  (() => {
    const completed = encounters.filter((e) => ["Completed", "Discharged"].includes(e.encounter?.status));
    if (!completed.length)
      return 0;
    let totalMs = 0;
    let validCount = 0;
    for (const e of completed) {
      const start = new Date(e.encounter.created_at);
      const end = new Date(e.encounter.updated_at);
      const diff = end - start;
      if (diff > 0 && diff < 24 * 60 * 60 * 1e3) {
        totalMs += diff;
        validCount++;
      }
    }
    return validCount > 0 ? Math.round(totalMs / validCount / 6e4) : 0;
  })();
  (() => {
    const map = {};
    encounters.forEach((e) => {
      if (e.encounter?.assessment) {
        const key = e.encounter.assessment.substring(0, 60);
        map[key] = (map[key] || 0) + 1;
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  })();
  (() => {
    const map = {};
    encounters.forEach((e) => {
      const d = new Date(e.encounter?.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map);
  })();
  [...encounters].sort((a, b) => new Date(b.encounter?.created_at) - new Date(a.encounter?.created_at)).slice(0, 10);
  (() => {
    const refs = {};
    encounters.forEach((e) => {
      if (e.encounter?.referral_source) {
        const src = e.encounter.referral_source;
        const doc = e.doctor_name || "Unknown";
        const key = `${src} → ${doc}`;
        refs[key] = (refs[key] || 0) + 1;
      }
    });
    return Object.entries(refs).sort((a, b) => b[1] - a[1]).slice(0, 10);
  })();
  return `${$$result.head += `<!-- HEAD_svelte-1a2wfng_START -->${$$result.title = `<title>Analytics — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-1a2wfng_END -->`, ""} <div><div class="flex items-center justify-between mb-6"><h1 class="page-title" style="margin: 0;" data-svelte-h="svelte-10kqvz9">📊 Analytics &amp; Statistik</h1> <div class="flex gap-3 items-center"><input type="date" class="form-input" style="width: auto;"${add_attribute("value", dateFrom, 0)}> <span class="text-muted" data-svelte-h="svelte-1b6xofy">—</span> <input type="date" class="form-input" style="width: auto;"${add_attribute("value", dateTo, 0)}> <button class="btn btn-primary btn-sm" data-svelte-h="svelte-tqt8be">Filter</button></div></div> ${`<div style="text-align: center; padding: var(--space-16);" data-svelte-h="svelte-h9r9zk"><div class="spinner spinner-lg" style="margin: 0 auto;"></div></div>`}</div>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-cb160d73.js.map
