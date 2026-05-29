import { c as create_ssr_component, v as validate_component } from "../../../../chunks/ssr.js";
import { S as SearchableSelect } from "../../../../chunks/SearchableSelect.js";
async function searchPatient(term) {
  const res = await fetch(`/api/patients?search=${encodeURIComponent(term)}&limit=10`);
  const data = await res.json();
  return (data.data || []).map((p) => ({
    value: p.id,
    label: p.nama_lengkap,
    // Changed to just string for UI aesthetics
    sublabel: `ID: ${p.id || "-"}`,
    patient: p
  }));
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-mhfp9h_START -->${$$result.title = `<title>Data Pasien — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-mhfp9h_END -->`, ""} <div class="h-full flex flex-col space-y-6"> <div class="flex items-end justify-between px-2" data-svelte-h="svelte-8ptn7m"><div><h1 class="text-3xl font-black text-slate-900 tracking-tight mb-2">Data Pasien</h1> <p class="text-slate-500 font-medium">Lihat dan kelola direktori pasien dengan aman</p></div></div>  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"><label class="block text-sm font-semibold text-slate-700 mb-2 px-1" data-svelte-h="svelte-1m8f2cz">Cari Pasien</label> <div class="group relative [&amp;>div.form-group]:mb-0 [&amp;_input]:w-full [&amp;_input]:pl-12 [&amp;_input]:pr-4 [&amp;_input]:py-4 [&amp;_input]:rounded-xl [&amp;_input]:border-slate-200 [&amp;_input]:focus:border-primary [&amp;_input]:focus:ring-4 [&amp;_input]:focus:ring-primary/10 [&amp;_input]:transition-all [&amp;_input]:bg-white [&amp;_input]:text-lg [&amp;_input]:placeholder:text-slate-400 [&amp;_input]:shadow-sm"><div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10" data-svelte-h="svelte-1rwruvm"><span class="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span></div> <div class="relative w-full">${validate_component(SearchableSelect, "SearchableSelect").$$render(
    $$result,
    {
      placeholder: "Masukkan No. Rekam Medis, Patient ID, NIK, atau Nama Pasien...",
      searchFn: searchPatient
    },
    {},
    {}
  )}</div></div></div> ${` <div class="flex-1 flex flex-col items-center justify-center text-center py-20 px-4 bg-white/50 rounded-2xl border border-slate-200 border-dashed" data-svelte-h="svelte-1mbb0j5"><div class="size-24 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-6"><span class="material-symbols-outlined text-4xl">search_hands_free</span></div> <h3 class="text-xl font-bold text-slate-800 mb-2">Cari Data Pasien</h3> <p class="text-sm text-slate-500 max-w-sm">Silahkan cari pasien menggunakan kolom pencarian di atas untuk
                melihat detail lengkap dan riwayat medis pasien.</p></div>`} </div>`;
});
export {
  Page as default
};
