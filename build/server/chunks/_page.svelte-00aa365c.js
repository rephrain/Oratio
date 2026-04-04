import { c as create_ssr_component, a as subscribe, e as escape, f as add_attribute, d as each, v as validate_component } from './ssr-631a3160.js';
import { S as SearchableSelect } from './SearchableSelect-39e7cc67.js';
import { C as COUNTRY_CALLING_CODES, B as BLOOD_TYPES, a as ALLERGY_REACTIONS } from './constants-4415c725.js';
import { w as writable } from './index2-ea876b50.js';

const provinces = writable([]);
const regencies = writable([]);
const districts = writable([]);
const villages = writable([]);
const loadingProvince = writable(false);
const loadingRegency = writable(false);
const loadingDistrict = writable(false);
const loadingVillage = writable(false);
const css = {
  code: "@keyframes svelte-2x98fo-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}",
  map: null
};
async function searchPersonalDisease(term) {
  const res = await fetch(`/api/snowstorm?filter=${encodeURIComponent(term)}&type=disease_personal`);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    value: r.code,
    label: r.display,
    meta: {
      display: r.display,
      system: r.system ?? "SNOMED"
    }
  }));
}
async function searchFamilyDisease(term) {
  const res = await fetch(`/api/snowstorm?filter=${encodeURIComponent(term)}&type=disease_family`);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    value: r.code,
    label: r.display,
    meta: {
      display: r.display,
      system: r.system ?? "SNOMED"
    }
  }));
}
async function searchAllergy(term) {
  const res = await fetch(`/api/snowstorm?filter=${encodeURIComponent(term)}&type=allergy`);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    value: r.code,
    label: r.display,
    meta: {
      display: r.display,
      system: r.system ?? "SNOMED"
    }
  }));
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let selectedCountryIsoCode;
  let $villages, $$unsubscribe_villages;
  let $districts, $$unsubscribe_districts;
  let $regencies, $$unsubscribe_regencies;
  let $provinces, $$unsubscribe_provinces;
  let $loadingProvince, $$unsubscribe_loadingProvince;
  let $loadingRegency, $$unsubscribe_loadingRegency;
  let $loadingDistrict, $$unsubscribe_loadingDistrict;
  let $loadingVillage, $$unsubscribe_loadingVillage;
  $$unsubscribe_villages = subscribe(villages, (value) => $villages = value);
  $$unsubscribe_districts = subscribe(districts, (value) => $districts = value);
  $$unsubscribe_regencies = subscribe(regencies, (value) => $regencies = value);
  $$unsubscribe_provinces = subscribe(provinces, (value) => $provinces = value);
  $$unsubscribe_loadingProvince = subscribe(loadingProvince, (value) => $loadingProvince = value);
  $$unsubscribe_loadingRegency = subscribe(loadingRegency, (value) => $loadingRegency = value);
  $$unsubscribe_loadingDistrict = subscribe(loadingDistrict, (value) => $loadingDistrict = value);
  $$unsubscribe_loadingVillage = subscribe(loadingVillage, (value) => $loadingVillage = value);
  let errors = {};
  let doctors = [];
  let selectedCountryCode = "+62";
  let inputPhoneNumber = "";
  let form = {
    nik: "",
    nama_lengkap: "",
    birth_date: "",
    birthplace: "",
    gender: "male",
    nomor_kk: "",
    address: "",
    province: "",
    city: "",
    district: "",
    village: "",
    rt: "",
    rw: "",
    handphone: "",
    email: "",
    marital_status: "S",
    citizenship: "WNI",
    blood_type: "",
    rhesus: "+",
    pregnancy_status: false,
    tekanan_darah: "",
    doctor_id: "",
    reason_type: "finding",
    chief_complaint_code: "",
    chief_complaint_display: ""
  };
  let diseaseHistory = [];
  let allergies = [];
  let medications = [];
  async function searchComplaint(term) {
    const reasonType = form.reason_type;
    const res = await fetch(`/api/snowstorm?filter=${encodeURIComponent(term)}&type=reason_${reasonType}`);
    const data = await res.json();
    return (data.results || []).map((r) => ({
      value: r.code,
      label: r.display,
      meta: {
        display: r.display,
        system: r.system ?? "SNOMED"
      }
    }));
  }
  let medicationSearchTerm = "";
  let medicationSearchResults = [];
  let medicationSearchLoading = false;
  let medicationSearchIndex = -1;
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    form.handphone = "";
    selectedCountryIsoCode = (() => {
      const c = COUNTRY_CALLING_CODES.find((x) => x.dial_code === selectedCountryCode);
      return c?.code?.toLowerCase() || "id";
    })();
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-xlx2ml_START -->${$$result.title = `<title>Pasien Baru — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-xlx2ml_END -->`, ""} <div class="p-8 max-w-5xl mx-auto"><div class="mb-8" data-svelte-h="svelte-jdvws"><h2 class="text-3xl font-black text-slate-900 tracking-tight">Registrasi Pasien Baru</h2> <p class="text-slate-500 mt-1">Lengkapi formulir pendaftaran pasien untuk memulai sesi konsultasi.</p></div> <form class="flex flex-col gap-8 pb-20"> <section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center gap-2 mb-6 text-primary" data-svelte-h="svelte-1modypf"><span class="material-symbols-outlined">badge</span> <h3 class="font-bold text-lg text-slate-800">Identitas Pasien</h3></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div class="col-span-full md:col-span-1"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-1kiuo9b">NIK (National ID) <span class="text-red-500">*</span></label> <input class="${"w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all " + escape(errors.nik ? "border-red-500 ring-1 ring-red-500" : "", true)}" placeholder="16-digit nomor induk" type="text" maxlength="16"${add_attribute("value", form.nik, 0)}> ${errors.nik ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.nik)}</span>` : ``}</div> <div class="col-span-full md:col-span-2"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-jz6fbc">Nama Lengkap <span class="text-red-500">*</span></label> <input class="${"w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all " + escape(
      errors.nama_lengkap ? "border-red-500 ring-1 ring-red-500" : "",
      true
    )}" placeholder="Nama sesuai KTP" type="text"${add_attribute("value", form.nama_lengkap, 0)}> ${errors.nama_lengkap ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.nama_lengkap)}</span>` : ``}</div> <div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-13xwy3l">Tanggal Lahir <span class="text-red-500">*</span></label> <input class="${"w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all " + escape(
      errors.birth_date ? "border-red-500 ring-1 ring-red-500" : "",
      true
    )}" type="date"${add_attribute("value", form.birth_date, 0)}> ${errors.birth_date ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.birth_date)}</span>` : ``}</div> <div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-qj47pt">Tempat Lahir</label> <div class="relative"><input class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" placeholder="Cari Kota/Kabupaten..." type="text"${add_attribute("value", form.birthplace, 0)} autocomplete="off"> ${``}</div></div> <div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-scikhf">Jenis Kelamin <span class="text-red-500">*</span></label> <select class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"><option value="male" data-svelte-h="svelte-o7gpp0">Laki-laki (Male)</option><option value="female" data-svelte-h="svelte-y7wxve">Perempuan (Female)</option><option value="other" data-svelte-h="svelte-mo83hr">Lainnya (Other)</option></select></div> <div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-9qc3au">Status Perkawinan</label> <select class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"><option value="S" data-svelte-h="svelte-2jvi5b">Belum Menikah</option><option value="M" data-svelte-h="svelte-1gglx9i">Menikah</option><option value="W" data-svelte-h="svelte-vt28qq">Janda/Duda</option><option value="D" data-svelte-h="svelte-xwd8qy">Cerai</option></select></div> <div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-1rsyx2f">Kewarganegaraan</label> <select class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"><option value="WNI" data-svelte-h="svelte-1pgceba">WNI</option><option value="WNA" data-svelte-h="svelte-108hfxi">WNA</option></select></div></div></section>  <section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center gap-2 mb-6 text-primary" data-svelte-h="svelte-gj1n9w"><span class="material-symbols-outlined">home</span> <h3 class="font-bold text-lg text-slate-800">Keluarga &amp; Alamat</h3></div> <div class="grid grid-cols-1 md:grid-cols-4 gap-6"><div class="col-span-full"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-1di05fq">Nomor KK (Family Card)</label> <input class="w-full md:w-1/2 rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all" placeholder="16-digit nomor kartu keluarga" type="text" maxlength="16"${add_attribute("value", form.nomor_kk, 0)}></div> <div class="col-span-full"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-1amjhrn">Alamat Lengkap <span class="text-red-500">*</span></label> <textarea class="${"w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all " + escape(
      errors.address ? "border-red-500 ring-1 ring-red-500" : "",
      true
    )}" placeholder="Nama jalan, nomor rumah, gedung..." rows="2">${escape("")}</textarea> ${errors.address ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.address)}</span>` : ``}</div>  <div class="col-span-2"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-qstmdo">Provinsi</label> <div class="relative"><select class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" ${$loadingProvince ? "disabled" : ""}><option value="">${escape($loadingProvince ? "Memuat..." : "Pilih Provinsi")}</option>${each($provinces, (p) => {
      return `<option${add_attribute("value", p.code, 0)} ${p.name === form.province ? "selected" : ""}>${escape(p.name)}</option>`;
    })}</select> <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">${$loadingProvince ? `<svg class="w-3.5 h-3.5 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>` : `<svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>`}</div></div></div>  <div class="col-span-2"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-hrei4z">Kota/Kabupaten</label> <div class="relative"><select class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" ${"disabled"}><option value="">${escape(
      "Pilih Provinsi dulu"
    )} </option>${each($regencies, (r) => {
      return `<option${add_attribute("value", r.code, 0)} ${r.name === form.city ? "selected" : ""}>${escape(r.name)}</option>`;
    })}</select> <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">${$loadingRegency ? `<svg class="w-3.5 h-3.5 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>` : `<svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>`}</div></div></div>  <div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-177kiab">Kecamatan</label> <div class="relative"><select class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" ${"disabled"}><option value="">${escape(
      "Pilih Kota dulu"
    )} </option>${each($districts, (d) => {
      return `<option${add_attribute("value", d.code, 0)} ${d.name === form.district ? "selected" : ""}>${escape(d.name)}</option>`;
    })}</select> <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">${$loadingDistrict ? `<svg class="w-3.5 h-3.5 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>` : `<svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>`}</div></div></div>  <div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-x5m339">Kelurahan/Desa</label> <div class="relative"><select class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" ${"disabled"}><option value="">${escape(
      "Pilih Kecamatan dulu"
    )} </option>${each($villages, (v) => {
      return `<option${add_attribute("value", v.code, 0)} ${v.name === form.village ? "selected" : ""}>${escape(v.name)}</option>`;
    })}</select> <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">${$loadingVillage ? `<svg class="w-3.5 h-3.5 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>` : `<svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>`}</div></div></div> <div class="col-span-1"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-13egwwq">RT</label> <input class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all" placeholder="000" type="text" maxlength="5"${add_attribute("value", form.rt, 0)}></div> <div class="col-span-1"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-qb4jsz">RW</label> <input class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all" placeholder="000" type="text" maxlength="5"${add_attribute("value", form.rw, 0)}></div></div></section>  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8"><section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center gap-2 mb-6 text-primary" data-svelte-h="svelte-1dac41w"><span class="material-symbols-outlined">contact_phone</span> <h3 class="font-bold text-lg text-slate-800">Kontak</h3></div> <div class="space-y-4"><div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-1us1h6o">Nomor Handphone</label> <div class="flex"> <div class="${"relative flex-shrink-0 w-28 bg-slate-50 hover:bg-slate-100 transition-colors border border-r-0 rounded-l-lg flex items-center px-3 " + escape(errors.handphone ? "border-red-400" : "border-slate-200", true) + " focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary overflow-hidden"}"> <span class="text-base leading-none mr-2 flex items-center"><span class="${"fi fi-" + escape(selectedCountryIsoCode, true)}"></span></span> <span class="text-sm font-medium text-slate-700 tabular-nums">${escape(selectedCountryCode)}</span>  <svg class="w-3 h-3 text-slate-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>  <select class="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none outline-none">${each(COUNTRY_CALLING_CODES, (country) => {
      return `<option${add_attribute("value", country.dial_code, 0)}${add_attribute("title", country.name, 0)}>${escape(country.name)} ${escape(country.dial_code)} </option>`;
    })}</select></div>  <input class="${"flex-1 rounded-r-lg border px-3 py-2 text-sm bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all " + escape(
      errors.handphone ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-slate-200 focus:ring-primary/30 focus:border-primary",
      true
    )}" placeholder="812-xxxx-xxxx" type="text"${add_attribute("value", inputPhoneNumber, 0)}></div>  ${errors.handphone ? `<span class="flex items-center gap-1 text-xs text-red-500 mt-1.5"><svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg> ${escape(errors.handphone)}</span> ` : `${``}`}</div> <div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-doko9w">Email</label> <input class="${"w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all " + escape(errors.email ? "border-red-500 ring-1 ring-red-500" : "", true)}" placeholder="contoh@email.com" type="email"${add_attribute("value", form.email, 0)}> ${errors.email ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.email)}</span>` : ``}</div></div></section> <section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center gap-2 mb-6 text-primary" data-svelte-h="svelte-1u5sa6g"><span class="material-symbols-outlined">medical_information</span> <h3 class="font-bold text-lg text-slate-800">Info Medis &amp; Vitals</h3></div> <div class="grid grid-cols-2 gap-4 mb-4"><div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-bxdj87">Gol. Darah <span class="text-red-500">*</span></label> <select class="${"w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all " + escape(
      errors.blood_type ? "border-red-500 ring-1 ring-red-500" : "",
      true
    )}"><option value="" data-svelte-h="svelte-1wj0zs">-- Pilih --</option>${each(BLOOD_TYPES, (bt) => {
      return `<option${add_attribute("value", bt, 0)}>${escape(bt)}</option>`;
    })}</select> ${errors.blood_type ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.blood_type)}</span>` : ``}</div> <div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-nyqd7i">Rhesus</label> <select class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"><option value="+" data-svelte-h="svelte-1mtre8o">+</option><option value="-" data-svelte-h="svelte-1x20f1g">-</option></select></div> <div class="col-span-2"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-1bc30iw">Tekanan Darah (Blood Pressure)</label> <div class="flex items-center gap-3"><input class="${"w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all " + escape(
      errors.tekanan_darah ? "border-red-500 ring-1 ring-red-500" : "",
      true
    )}" placeholder="120/80" type="text"${add_attribute("value", form.tekanan_darah, 0)}> <span class="text-xs text-slate-400 font-bold" data-svelte-h="svelte-1pk3g4o">mmHg</span></div> ${errors.tekanan_darah ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.tekanan_darah)}</span>` : ``}</div></div> <label class="flex items-center gap-3 cursor-pointer group mt-6 w-max"><div class="relative inline-flex items-center cursor-pointer"><input class="sr-only peer" type="checkbox"${add_attribute("checked", form.pregnancy_status, 1)}> <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div></div> <span class="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors" data-svelte-h="svelte-1ytf185">Status Kehamilan (Pregnancy Status)</span></label></section></div>  <section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center gap-2 mb-6 text-primary" data-svelte-h="svelte-1m3slte"><span class="material-symbols-outlined">assignment</span> <h3 class="font-bold text-lg text-slate-800">Penugasan &amp; Keluhan</h3></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-8"><div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-1loss72">Pilih Dokter <span class="text-red-500">*</span></label> <div class="relative"><select class="${"w-full pl-10 pr-4 py-2.5 rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all appearance-none " + escape(
      errors.doctor_id ? "border-red-500 ring-1 ring-red-500" : "",
      true
    )}"><option disabled selected value="" data-svelte-h="svelte-13ln8jx">Cari Dokter...</option>${each(doctors, (doc) => {
      return `<option${add_attribute("value", doc.id, 0)}>drg. ${escape(doc.name)} (${escape(doc.doctor_code)})</option>`;
    })}</select> <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" data-svelte-h="svelte-1e21ltg">stethoscope</span> <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" data-svelte-h="svelte-dtpkq4">expand_more</span></div> ${errors.doctor_id ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.doctor_id)}</span>` : ``} <div class="mt-2 flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> <p class="text-[11px] font-bold text-emerald-600 uppercase tracking-tight">${escape(doctors.length)} Doctors available for walk-in</p></div></div> <div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-5til0l">Alasan Kunjungan</label> <div class="flex flex-col gap-3"><select class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all text-sm"><option value="finding" data-svelte-h="svelte-johd1h">Finding (Clinical Finding)</option><option value="procedure" data-svelte-h="svelte-js6suc">Procedure</option><option value="situation" data-svelte-h="svelte-1pivad6">Situation</option><option value="event" data-svelte-h="svelte-1jiwq0e">Event</option></select> <div class="[&amp;>div.form-group]:mb-0 [&amp;_input]:w-full [&amp;_input]:rounded-lg [&amp;_input]:border-slate-200 [&amp;_input]:bg-slate-50 [&amp;_input]:focus:ring-primary [&amp;_input]:focus:border-primary">${validate_component(SearchableSelect, "SearchableSelect").$$render(
      $$result,
      {
        placeholder: "Cari keluhan (SNOMED)...",
        searchFn: searchComplaint,
        value: form.chief_complaint_code
      },
      {
        value: ($$value) => {
          form.chief_complaint_code = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div></div></div></div></section>  <section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center justify-between mb-6 border-b border-slate-100 pb-4"><div class="flex items-center gap-2 text-primary" data-svelte-h="svelte-15jl8lb"><span class="material-symbols-outlined">history</span> <h3 class="font-bold text-lg text-slate-800">Riwayat Penyakit</h3></div> <button type="button" class="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1" data-svelte-h="svelte-ey76f1"><span class="material-symbols-outlined text-sm">add</span> Tambah</button></div> <div class="space-y-4">${each(diseaseHistory, (item, i) => {
      return `<div class="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-100"><div class="w-full md:w-40 shrink-0"><select class="w-full h-11 rounded-lg border-slate-200 bg-white focus:ring-primary focus:border-primary text-sm"><option value="personal" data-svelte-h="svelte-icz86z">Pribadi</option><option value="family" data-svelte-h="svelte-tlbtti">Keluarga</option></select></div> <div class="flex-1 w-full min-w-0 [&amp;>div.form-group]:mb-0 [&amp;_input]:w-full [&amp;_input]:h-11 [&amp;_input]:rounded-lg [&amp;_input]:border-slate-200 [&amp;_input]:bg-white [&amp;_input]:focus:ring-primary [&amp;_input]:focus:border-primary [&amp;_input]:text-sm">${validate_component(SearchableSelect, "SearchableSelect").$$render(
        $$result,
        {
          placeholder: "Cari penyakit (SNOMED)...",
          searchFn: item.type === "family" ? searchFamilyDisease : searchPersonalDisease,
          value: item.code
        },
        {
          value: ($$value) => {
            item.code = $$value;
            $$settled = false;
          }
        },
        {}
      )}</div> <button type="button" class="w-full md:w-auto h-11 px-4 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors shrink-0 flex items-center justify-center gap-2" data-svelte-h="svelte-stslod"><span class="material-symbols-outlined text-[18px]">delete</span> <span class="md:hidden text-sm font-semibold">Hapus</span></button> </div>`;
    })} ${diseaseHistory.length === 0 ? `<p class="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50" data-svelte-h="svelte-1jhdrsu">Belum ada riwayat penyakit</p>` : ``}</div></section>  <section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center justify-between mb-6 border-b border-slate-100 pb-4"><div class="flex items-center gap-2 text-primary" data-svelte-h="svelte-126u1vt"><span class="material-symbols-outlined">warning</span> <h3 class="font-bold text-lg text-slate-800">Alergi</h3></div> <button type="button" class="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1" data-svelte-h="svelte-11m8pn5"><span class="material-symbols-outlined text-sm">add</span> Tambah</button></div> <div class="space-y-4">${each(allergies, (item, i) => {
      return `<div class="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-100"><div class="flex-1 w-full min-w-0 [&amp;>div.form-group]:mb-0 [&amp;_input]:w-full [&amp;_input]:h-11 [&amp;_input]:rounded-lg [&amp;_input]:border-slate-200 [&amp;_input]:bg-white [&amp;_input]:focus:ring-primary [&amp;_input]:focus:border-primary [&amp;_input]:text-sm">${validate_component(SearchableSelect, "SearchableSelect").$$render(
        $$result,
        {
          placeholder: "Cari alergen/substansi...",
          searchFn: searchAllergy,
          value: item.substance_code
        },
        {
          value: ($$value) => {
            item.substance_code = $$value;
            $$settled = false;
          }
        },
        {}
      )}</div> <div class="w-full md:w-64 shrink-0"><select class="w-full h-11 rounded-lg border-slate-200 bg-white focus:ring-primary focus:border-primary text-sm"><option value="" data-svelte-h="svelte-5d2bgv">-- Reaksi --</option>${each(ALLERGY_REACTIONS, (r) => {
        return `<option${add_attribute("value", r.code, 0)}>${escape(r.display)}</option>`;
      })}</select></div> <button type="button" class="w-full md:w-auto h-11 px-4 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors shrink-0 flex items-center justify-center gap-2" data-svelte-h="svelte-glesdb"><span class="material-symbols-outlined text-[18px]">delete</span> <span class="md:hidden text-sm font-semibold">Hapus</span></button> </div>`;
    })} ${allergies.length === 0 ? `<p class="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50" data-svelte-h="svelte-1hvd6zg">Belum ada data alergi</p>` : ``}</div></section>  <section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center justify-between mb-6 border-b border-slate-100 pb-4"><div class="flex items-center gap-2 text-primary" data-svelte-h="svelte-c8os7m"><span class="material-symbols-outlined">medication</span> <h3 class="font-bold text-lg text-slate-800">Riwayat Pengobatan</h3></div> <button type="button" class="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1" data-svelte-h="svelte-1k5kx7y"><span class="material-symbols-outlined text-sm">add</span> Tambah</button></div> <div class="space-y-4">${each(medications, (item, i) => {
      return `<div class="flex flex-col gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100">${item.product_name ? `<div class="flex items-center gap-2 text-sm"><span class="material-symbols-outlined text-primary text-[16px]" data-svelte-h="svelte-h4pe0j">check_circle</span> <span class="font-medium text-slate-800">${escape(item.product_name)}</span> ${item.dosage_form ? `<span class="text-slate-400">— ${escape(item.dosage_form)}</span>` : ``} <span class="text-xs text-slate-400 ml-auto">KFA: ${escape(item.kfa_code)}</span> <button type="button" class="text-xs text-slate-400 hover:text-red-500 transition-colors" data-svelte-h="svelte-1xix59g">✕</button> </div>` : `<div class="flex flex-col gap-3"><div class="flex p-1 bg-slate-100 rounded-lg w-fit"><button type="button" class="${"px-3 py-1 text-[10px] font-bold rounded-md transition-all " + escape(
        "bg-white text-primary shadow-sm",
        true
      )}">MERK KNOWN</button> <button type="button" class="${"px-3 py-1 text-[10px] font-bold rounded-md transition-all " + escape(
        "text-slate-500",
        true
      )}">MERK UNKNOWN</button></div> <div class="flex flex-col sm:flex-row gap-2"><input class="flex-1 h-11 rounded-lg border-slate-200 bg-white focus:ring-primary focus:border-primary text-sm" placeholder="Ketik nama obat..."${add_attribute("value", medicationSearchTerm, 0)}> <button type="button" class="h-11 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50" ${""}>${`<span class="material-symbols-outlined text-sm" data-svelte-h="svelte-zmmbvx">search</span>`}
                                        Cari KFA</button> </div></div> ${medicationSearchIndex === i && medicationSearchResults.length > 0 ? `<div class="bg-white border border-slate-200 rounded-lg max-h-48 overflow-y-auto shadow-sm">${each(medicationSearchResults, (result) => {
        return `<button type="button" class="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"><div class="text-sm font-medium text-slate-800">${escape(result.product_name)}</div> <div class="text-xs text-slate-400">${escape(result.dosage_form ? result.dosage_form + " — " : "")}KFA: ${escape(result.kfa_code)}</div> </button>`;
      })} </div>` : ``} ${medicationSearchIndex === i && !medicationSearchLoading && medicationSearchResults.length === 0 && medicationSearchTerm.length >= 2 ? `<p class="text-xs text-slate-400 text-center py-2">Tidak ditemukan hasil untuk &quot;${escape(medicationSearchTerm)}&quot;
                                </p>` : ``}`} <div class="flex flex-row gap-3 items-center"><div class="w-full md:w-40 shrink-0"><input class="w-full h-11 rounded-lg border-slate-200 bg-white focus:ring-primary focus:border-primary text-sm" placeholder="Dosis"${add_attribute("value", item.dosage, 0)}></div> <div class="flex-1"><input class="w-full h-11 rounded-lg border-slate-200 bg-white focus:ring-primary focus:border-primary text-sm" placeholder="Catatan (opsional)"${add_attribute("value", item.note, 0)}></div> <button type="button" class="w-auto h-11 px-4 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors shrink-0 flex items-center justify-center gap-2" data-svelte-h="svelte-1wi2z7n"><span class="material-symbols-outlined text-[18px]">delete</span> </button></div> </div>`;
    })} ${medications.length === 0 ? `<p class="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50" data-svelte-h="svelte-1v8vse6">Belum ada riwayat pengobatan</p>` : ``}</div></section>  <div class="flex items-center justify-end gap-4 mt-12 border-t border-slate-200 pt-8"><button ${""} class="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50" type="button">Batal</button> <button class="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed" type="submit" ${""}>${`<span data-svelte-h="svelte-jj1km6">Submit &amp; Queue Patient</span> <span class="material-symbols-outlined text-[20px]" data-svelte-h="svelte-6stym3">send</span>`}</button></div></form> </div>`;
  } while (!$$settled);
  $$unsubscribe_villages();
  $$unsubscribe_districts();
  $$unsubscribe_regencies();
  $$unsubscribe_provinces();
  $$unsubscribe_loadingProvince();
  $$unsubscribe_loadingRegency();
  $$unsubscribe_loadingDistrict();
  $$unsubscribe_loadingVillage();
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-00aa365c.js.map
