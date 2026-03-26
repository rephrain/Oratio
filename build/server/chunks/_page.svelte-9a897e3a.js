import { c as create_ssr_component, v as validate_component } from './ssr-631a3160.js';
import { S as SearchableSelect } from './SearchableSelect-39e7cc67.js';

async function searchPatient(term) {
  const res = await fetch(`/api/patients?search=${encodeURIComponent(term)}&limit=10`);
  const data = await res.json();
  return (data.data || []).map((p) => ({
    value: p.id,
    label: `${p.nama_lengkap} (${p.id})`,
    sublabel: `NIK: ${p.nik || "-"}`,
    patient: p
  }));
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-1tuj27f_START -->${$$result.title = `<title>Pasien Lama — Oratio Dental</title>`, ""}<!-- HEAD_svelte-1tuj27f_END -->`, ""} <div><div class="flex items-center justify-between mb-6" data-svelte-h="svelte-1n4btz9"><h1 class="page-title" style="margin: 0;">Pendaftaran Pasien Lama</h1> <a href="/kasir" class="btn btn-secondary">← Kembali</a></div> <form><div class="card mb-6"><h3 class="card-title mb-4" data-svelte-h="svelte-pqvy7n">🔍 Cari Pasien</h3> ${validate_component(SearchableSelect, "SearchableSelect").$$render(
    $$result,
    {
      label: "Cari berdasarkan Nama, NIK, atau No. RM",
      placeholder: "Ketik minimal 2 karakter...",
      searchFn: searchPatient
    },
    {},
    {}
  )}</div> ${``}</form></div>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-9a897e3a.js.map
