import { c as create_ssr_component, e as each, v as validate_component, g as add_attribute, f as escape, d as createEventDispatcher } from './ssr-a9ffd974.js';
import { A as ADMIN_TABLES } from './constants-d4b86fe3.js';
import 'papaparse';

const AdminFileUpload = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { accept = "" } = $$props;
  let { label = "Upload file" } = $$props;
  let { maxSize = 5 * 1024 * 1024 } = $$props;
  createEventDispatcher();
  if ($$props.accept === void 0 && $$bindings.accept && accept !== void 0)
    $$bindings.accept(accept);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0)
    $$bindings.label(label);
  if ($$props.maxSize === void 0 && $$bindings.maxSize && maxSize !== void 0)
    $$bindings.maxSize(maxSize);
  return `<div class="${"w-full flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all cursor-pointer " + escape(
    "border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900",
    true
  )}"><input type="file"${add_attribute("accept", accept, 0)} class="hidden"> <div class="${"size-16 rounded-full flex items-center justify-center mb-4 transition-colors " + escape(
    "bg-slate-100 dark:bg-slate-800 text-slate-400",
    true
  )}"><span class="material-symbols-outlined text-3xl" data-svelte-h="svelte-l4gz7">cloud_upload</span></div> <p class="${"font-bold text-slate-900 dark:text-white mb-1 transition-colors " + escape("", true)}">${escape(label)}</p> <p class="text-sm font-medium text-slate-500 dark:text-slate-400" data-svelte-h="svelte-fd6lx0">Drag &amp; drop atau klik untuk memuat</p></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-1tar2ky_START -->${$$result.title = `<title>CSV Import — Admin — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-1tar2ky_END -->`, ""} <div class="p-8 space-y-8 overflow-y-auto custom-scrollbar"><div class="flex items-end justify-between" data-svelte-h="svelte-1fo281x"><div><h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">📤 CSV Import</h1> <p class="text-slate-500 font-medium">Migrasi data massal ke dalam database sistem</p></div> <a href="/admin" class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"><span class="material-symbols-outlined text-[18px]">arrow_back</span>
			Dashboard</a></div> ${`<div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm"><h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6" data-svelte-h="svelte-1awr00c">1. Pilih Tabel &amp; Upload File</h3> <div class="mb-8 max-w-lg"><label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" data-svelte-h="svelte-1m242k2">Tabel Tujuan</label> <select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-slate-900 dark:text-white"><option value="" data-svelte-h="svelte-18zgnia">-- Pilih Tabel --</option>${each(Object.entries(ADMIN_TABLES), ([slug, config]) => {
    return `<option${add_attribute("value", slug, 0)}>${escape(config.label)}</option>`;
  })}</select></div> ${``} <div class="max-w-2xl"><label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" data-svelte-h="svelte-1vyg6j1">File CSV</label> ${validate_component(AdminFileUpload, "AdminFileUpload").$$render($$result, { accept: ".csv", label: "Upload file CSV" }, {}, {})}</div></div>`}</div>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-b6a8697e.js.map
