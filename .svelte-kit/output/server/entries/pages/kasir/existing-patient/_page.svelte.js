import { c as create_ssr_component, v as validate_component } from "../../../../chunks/ssr.js";
import { S as SearchableSelect } from "../../../../chunks/SearchableSelect.js";
async function searchPatient(term) {
  const res = await fetch(`/api/patients?search=${encodeURIComponent(term)}&limit=10`);
  const data = await res.json();
  return (data.data || []).map((p) => ({
    value: p.id,
    label: p.nama_lengkap,
    // Changed to just string for UI aesthetics
    sublabel: `NIK: ${p.nik || "-"} • ID: ${p.id}`,
    patient: p
  }));
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-1yw5wz_START -->${$$result.title = `<title>Pasien Lama — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-1yw5wz_END -->`, ""} <div class="p-8 max-w-5xl mx-auto space-y-8"><div class="mb-8 flex justify-between items-end" data-svelte-h="svelte-7gn94y"><div><h2 class="text-3xl font-black text-slate-900 tracking-tight">Existing Patient Appointment</h2> <p class="text-slate-500 mt-1">Cari pasien lama dan daftarkan ke antrean poli.</p></div> <a href="/kasir" class="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">← Kembali</a></div>  <section class="relative"><div class="flex flex-col gap-2 mb-4"><span class="block text-sm font-semibold text-slate-700 px-1" data-svelte-h="svelte-rs1ggm">Cari Pasien</span> <div class="group relative [&amp;>div.form-group]:mb-0 [&amp;_input]:w-full [&amp;_input]:pl-12 [&amp;_input]:pr-4 [&amp;_input]:py-4 [&amp;_input]:rounded-xl [&amp;_input]:border-slate-200 [&amp;_input]:focus:border-primary [&amp;_input]:focus:ring-4 [&amp;_input]:focus:ring-primary/10 [&amp;_input]:transition-all [&amp;_input]:bg-white [&amp;_input]:text-lg [&amp;_input]:placeholder:text-slate-400 [&amp;_input]:shadow-sm"><div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10" data-svelte-h="svelte-buc56r"><span class="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span></div> <div class="relative w-full">${validate_component(SearchableSelect, "SearchableSelect").$$render(
      $$result,
      {
        placeholder: "Masukkan No. Rekam Medis, NIK, atau Nama Pasien...",
        searchFn: searchPatient
      },
      {},
      {}
    )}</div></div></div></section> ${``}</div>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  Page as default
};
