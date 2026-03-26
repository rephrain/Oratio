import { c as create_ssr_component, a as subscribe, e as escape } from './ssr-631a3160.js';
import { p as page } from './stores-02bd8c1f.js';

/* empty css                                                             */const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  const patientId = $page.params.patientId;
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-1lf3bqy_START -->${$$result.title = `<title>Pasien ${escape(patientId)} — Oratio Dental</title>`, ""}<!-- HEAD_svelte-1lf3bqy_END -->`, ""} <div><div class="flex items-center justify-between mb-6" data-svelte-h="svelte-1iaeoec"><h1 class="page-title" style="margin: 0;">Detail Pasien</h1> <a href="/dokter" class="btn btn-secondary">← Kembali</a></div> ${`<div style="text-align: center; padding: var(--space-16);" data-svelte-h="svelte-h9r9zk"><div class="spinner spinner-lg" style="margin: 0 auto;"></div></div>`}</div>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-dcb0972b.js.map
