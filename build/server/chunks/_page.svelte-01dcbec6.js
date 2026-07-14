import { c as create_ssr_component, a as subscribe, f as escape, g as add_attribute, v as validate_component, e as each } from './ssr-4a5a9ccc.js';
import { p as page } from './stores-468b91fe.js';
import { S as SearchableSelect } from './SearchableSelect-4aa6c810.js';
import { R as RichSelect } from './RichSelect-b89df93a.js';
import { C as COUNTRY_CALLING_CODES, b as ALLERGY_REACTIONS, c as BLOOD_TYPES } from './constants-7804d9c5.js';
import { v as villages, d as districts, r as regencies, p as provinces, l as loadingProvince, a as loadingRegency, b as loadingDistrict, c as loadingVillage } from './wilayah-18035e12.js';
import './index2-bd557b7d.js';

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
  let bloodTypeOptions;
  let provinceOptions;
  let regencyOptions;
  let districtOptions;
  let villageOptions;
  let reactionOptions;
  let $villages, $$unsubscribe_villages;
  let $districts, $$unsubscribe_districts;
  let $regencies, $$unsubscribe_regencies;
  let $provinces, $$unsubscribe_provinces;
  let $page, $$unsubscribe_page;
  let $loadingProvince, $$unsubscribe_loadingProvince;
  let $loadingRegency, $$unsubscribe_loadingRegency;
  let $loadingDistrict, $$unsubscribe_loadingDistrict;
  let $loadingVillage, $$unsubscribe_loadingVillage;
  $$unsubscribe_villages = subscribe(villages, (value) => $villages = value);
  $$unsubscribe_districts = subscribe(districts, (value) => $districts = value);
  $$unsubscribe_regencies = subscribe(regencies, (value) => $regencies = value);
  $$unsubscribe_provinces = subscribe(provinces, (value) => $provinces = value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_loadingProvince = subscribe(loadingProvince, (value) => $loadingProvince = value);
  $$unsubscribe_loadingRegency = subscribe(loadingRegency, (value) => $loadingRegency = value);
  $$unsubscribe_loadingDistrict = subscribe(loadingDistrict, (value) => $loadingDistrict = value);
  $$unsubscribe_loadingVillage = subscribe(loadingVillage, (value) => $loadingVillage = value);
  let errors = {};
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
    tekanan_darah: ""
  };
  let diseaseHistory = [];
  let allergies = [];
  let medications = [];
  let selectedProvinceCode = "";
  let selectedRegencyCode = "";
  let selectedDistrictCode = "";
  const GENDER_OPTIONS = [
    { value: "male", label: "Laki-laki (Male)" },
    {
      value: "female",
      label: "Perempuan (Female)"
    },
    { value: "other", label: "Lainnya (Other)" }
  ];
  const MARITAL_OPTIONS = [
    { value: "S", label: "Belum Menikah" },
    { value: "M", label: "Menikah" },
    { value: "W", label: "Janda/Duda" },
    { value: "D", label: "Cerai" }
  ];
  const CITIZENSHIP_OPTIONS = [{ value: "WNI", label: "WNI" }, { value: "WNA", label: "WNA" }];
  const RHESUS_OPTIONS = [{ value: "+", label: "+" }, { value: "-", label: "-" }];
  const DISEASE_TYPE_OPTIONS = [
    { value: "personal", label: "Pribadi" },
    { value: "family", label: "Keluarga" }
  ];
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
    $page.url.searchParams.get("id");
    form.handphone = "";
    selectedCountryIsoCode = (() => {
      const c = COUNTRY_CALLING_CODES.find((x) => x.dial_code === selectedCountryCode);
      return c?.code?.toLowerCase() || "id";
    })();
    bloodTypeOptions = BLOOD_TYPES.map((bt) => ({ value: bt, label: bt }));
    provinceOptions = $provinces.map((p) => ({ value: p.code, label: p.name }));
    regencyOptions = $regencies.map((r) => ({ value: r.code, label: r.name }));
    districtOptions = $districts.map((d) => ({ value: d.code, label: d.name }));
    villageOptions = $villages.map((v) => ({ value: v.code, label: v.name }));
    reactionOptions = ALLERGY_REACTIONS.map((r) => ({ value: r.code, label: r.display }));
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-1burbyf_START -->${$$result.title = `<title>Ubah Data Pasien — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-1burbyf_END -->`, ""} <div class="p-8 max-w-5xl mx-auto"><div class="mb-8" data-svelte-h="svelte-gha6uj"><h2 class="text-3xl font-black text-slate-900 tracking-tight">Ubah Data Pasien</h2> <p class="text-slate-500 mt-1">Perbarui formulir pendaftaran pasien untuk memperbarui data identitas pasien.</p></div> <form class="flex flex-col gap-8 pb-20"> <section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center gap-2 mb-6 text-primary" data-svelte-h="svelte-1modypf"><span class="material-symbols-outlined">badge</span> <h3 class="font-bold text-lg text-slate-800">Identitas Pasien</h3></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div class="col-span-full md:col-span-1"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-tcnks5">Patient ID (National ID) <span class="text-red-500">*</span></label> <input class="${"w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all " + escape(errors.nik ? "border-red-500 ring-1 ring-red-500" : "", true)}" placeholder="16-digit nomor induk" type="text" maxlength="16"${add_attribute("value", form.nik, 0)}> ${errors.nik ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.nik)}</span>` : ``}</div> <div class="col-span-full md:col-span-2"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-jz6fbc">Nama Lengkap <span class="text-red-500">*</span></label> <input class="${"w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all " + escape(
      errors.nama_lengkap ? "border-red-500 ring-1 ring-red-500" : "",
      true
    )}" placeholder="Nama sesuai KTP" type="text"${add_attribute("value", form.nama_lengkap, 0)}> ${errors.nama_lengkap ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.nama_lengkap)}</span>` : ``}</div> <div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-13xwy3l">Tanggal Lahir <span class="text-red-500">*</span></label> <input class="${"w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all " + escape(
      errors.birth_date ? "border-red-500 ring-1 ring-red-500" : "",
      true
    )}" type="date"${add_attribute("value", form.birth_date, 0)}> ${errors.birth_date ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.birth_date)}</span>` : ``}</div> <div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-qj47pt">Tempat Lahir</label> <div class="relative"><input class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" placeholder="Cari Kota/Kabupaten..." type="text"${add_attribute("value", form.birthplace, 0)} autocomplete="off"> ${``}</div></div> <div>${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        label: "Jenis Kelamin",
        options: GENDER_OPTIONS,
        required: true,
        value: form.gender
      },
      {
        value: ($$value) => {
          form.gender = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div> <div>${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        label: "Status Perkawinan",
        options: MARITAL_OPTIONS,
        value: form.marital_status
      },
      {
        value: ($$value) => {
          form.marital_status = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div> <div>${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        label: "Kewarganegaraan",
        options: CITIZENSHIP_OPTIONS,
        value: form.citizenship
      },
      {
        value: ($$value) => {
          form.citizenship = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div></div></section>  <section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center gap-2 mb-6 text-primary" data-svelte-h="svelte-gj1n9w"><span class="material-symbols-outlined">home</span> <h3 class="font-bold text-lg text-slate-800">Keluarga &amp; Alamat</h3></div> <div class="grid grid-cols-1 md:grid-cols-4 gap-6"><div class="col-span-full"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-1di05fq">Nomor KK (Family Card)</label> <input class="w-full md:w-1/2 rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all" placeholder="16-digit nomor kartu keluarga" type="text" maxlength="16"${add_attribute("value", form.nomor_kk, 0)}></div> <div class="col-span-full"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-1amjhrn">Alamat Lengkap <span class="text-red-500">*</span></label> <textarea class="${"w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all " + escape(
      errors.address ? "border-red-500 ring-1 ring-red-500" : "",
      true
    )}" placeholder="Nama jalan, nomor rumah, gedung..." rows="2">${escape("")}</textarea> ${errors.address ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.address)}</span>` : ``}</div>  <div class="col-span-2">${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        label: "Provinsi",
        placeholder: "Pilih Provinsi",
        options: provinceOptions,
        loading: $loadingProvince,
        value: selectedProvinceCode
      },
      {
        value: ($$value) => {
          selectedProvinceCode = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>  <div class="col-span-2">${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        label: "Kota/Kabupaten",
        placeholder: "Pilih Kota",
        options: regencyOptions,
        loading: $loadingRegency,
        disabled: !selectedProvinceCode,
        value: selectedRegencyCode
      },
      {
        value: ($$value) => {
          selectedRegencyCode = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>  <div class="col-span-1">${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        label: "Kecamatan",
        placeholder: "Pilih Kecamatan",
        options: districtOptions,
        loading: $loadingDistrict,
        disabled: !selectedRegencyCode,
        value: selectedDistrictCode
      },
      {
        value: ($$value) => {
          selectedDistrictCode = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>  <div class="col-span-1">${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        label: "Kelurahan/Desa",
        placeholder: "Pilih Kelurahan",
        options: villageOptions,
        loading: $loadingVillage,
        disabled: !selectedDistrictCode
      },
      {},
      {}
    )}</div> <div class="col-span-1"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-13egwwq">RT</label> <input class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all" placeholder="000" type="text" maxlength="5"${add_attribute("value", form.rt, 0)}></div> <div class="col-span-1"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-qb4jsz">RW</label> <input class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all" placeholder="000" type="text" maxlength="5"${add_attribute("value", form.rw, 0)}></div></div></section>  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8"><section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center gap-2 mb-6 text-primary" data-svelte-h="svelte-1dac41w"><span class="material-symbols-outlined">contact_phone</span> <h3 class="font-bold text-lg text-slate-800">Kontak</h3></div> <div class="space-y-4"><div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-1us1h6o">Nomor Handphone</label> <div class="flex"> <div class="${"relative flex-shrink-0 w-28 bg-slate-50 hover:bg-slate-100 transition-colors border border-r-0 rounded-l-lg flex items-center px-3 " + escape(errors.handphone ? "border-red-400" : "border-slate-200", true) + " focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary overflow-hidden"}"> <span class="text-base leading-none mr-2 flex items-center"><span class="${"fi fi-" + escape(selectedCountryIsoCode, true)}"></span></span> <span class="text-sm font-medium text-slate-700 tabular-nums">${escape(selectedCountryCode)}</span>  <svg class="w-3 h-3 text-slate-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>  <select class="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none outline-none">${each(COUNTRY_CALLING_CODES, (country) => {
      return `<option${add_attribute("value", country.dial_code, 0)}${add_attribute("title", country.name, 0)}>${escape(country.name)} ${escape(country.dial_code)} </option>`;
    })}</select></div>  <input class="${"flex-1 rounded-r-lg border px-3 py-2 text-sm bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all " + escape(
      errors.handphone ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-slate-200 focus:ring-primary/30 focus:border-primary",
      true
    )}" placeholder="812-xxxx-xxxx" type="text"${add_attribute("value", inputPhoneNumber, 0)}></div>  ${errors.handphone ? `<span class="flex items-center gap-1 text-xs text-red-500 mt-1.5"><svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg> ${escape(errors.handphone)}</span> ` : `${``}`}</div> <div><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-doko9w">Email</label> <input class="${"w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all " + escape(errors.email ? "border-red-500 ring-1 ring-red-500" : "", true)}" placeholder="contoh@email.com" type="email"${add_attribute("value", form.email, 0)}> ${errors.email ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.email)}</span>` : ``}</div></div></section> <section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center gap-2 mb-6 text-primary" data-svelte-h="svelte-1u5sa6g"><span class="material-symbols-outlined">medical_information</span> <h3 class="font-bold text-lg text-slate-800">Info Medis &amp; Vitals</h3></div> <div class="grid grid-cols-2 gap-4 mb-4"><div>${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        label: "Gol. Darah",
        options: bloodTypeOptions,
        required: true,
        value: form.blood_type
      },
      {
        value: ($$value) => {
          form.blood_type = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${errors.blood_type ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.blood_type)}</span>` : ``}</div> <div>${validate_component(RichSelect, "RichSelect").$$render(
      $$result,
      {
        label: "Rhesus",
        options: RHESUS_OPTIONS,
        value: form.rhesus
      },
      {
        value: ($$value) => {
          form.rhesus = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div> <div class="col-span-2"><label class="block text-sm font-semibold text-slate-700 mb-2" data-svelte-h="svelte-1bc30iw">Tekanan Darah (Blood Pressure)</label> <div class="flex items-center gap-3"><input class="${"w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all " + escape(
      errors.tekanan_darah ? "border-red-500 ring-1 ring-red-500" : "",
      true
    )}" placeholder="120/80" type="text"${add_attribute("value", form.tekanan_darah, 0)}> <span class="text-xs text-slate-400 font-bold" data-svelte-h="svelte-1pk3g4o">mmHg</span></div> ${errors.tekanan_darah ? `<span class="text-xs text-red-500 mt-1 block">${escape(errors.tekanan_darah)}</span>` : ``}</div></div> <label class="flex items-center gap-3 cursor-pointer group mt-6 w-max"><div class="relative inline-flex items-center cursor-pointer"><input class="sr-only peer" type="checkbox"${add_attribute("checked", form.pregnancy_status, 1)}> <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div></div> <span class="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors" data-svelte-h="svelte-1ytf185">Status Kehamilan (Pregnancy Status)</span></label></section></div>  <section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center justify-between mb-6 border-b border-slate-100 pb-4"><div class="flex items-center gap-2 text-primary" data-svelte-h="svelte-15jl8lb"><span class="material-symbols-outlined">history</span> <h3 class="font-bold text-lg text-slate-800">Riwayat Penyakit</h3></div> <button type="button" class="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1" data-svelte-h="svelte-ey76f1"><span class="material-symbols-outlined text-sm">add</span> Tambah</button></div> <div class="space-y-4">${each(diseaseHistory, (item, i) => {
      return `<div class="flex flex-col gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100">${item.code ? `<div class="flex items-center gap-2 text-sm"><span class="material-symbols-outlined text-primary text-[16px]" data-svelte-h="svelte-h4pe0j">check_circle</span> <span class="font-medium text-slate-800">${escape(item.display)}</span> ${item.type ? `<span class="text-xs text-slate-400 ml-auto px-2 py-1 bg-slate-200 rounded">${escape(item.type === "family" ? "Keluarga" : "Pribadi")} </span>` : ``} <button type="button" class="text-red-500 hover:text-red-700" data-svelte-h="svelte-lzcqap">✕</button> </div>` : `<div class="flex flex-col md:flex-row gap-4 items-center"><div class="flex-1 w-full min-w-0 [&amp;>div.form-group]:mb-0 [&amp;_input]:w-full [&amp;_input]:h-11 [&amp;_input]:rounded-lg [&amp;_input]:border-slate-200 [&amp;_input]:bg-white [&amp;_input]:focus:ring-primary [&amp;_input]:focus:border-primary [&amp;_input]:text-sm">${validate_component(SearchableSelect, "SearchableSelect").$$render(
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
      )}</div> <div class="w-full md:w-40 shrink-0">${validate_component(RichSelect, "RichSelect").$$render(
        $$result,
        {
          placeholder: "Tipe",
          options: DISEASE_TYPE_OPTIONS,
          value: item.type
        },
        {
          value: ($$value) => {
            item.type = $$value;
            $$settled = false;
          }
        },
        {}
      )}</div> <button type="button" class="w-full md:w-auto h-11 px-4 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors shrink-0 flex items-center justify-center gap-2" data-svelte-h="svelte-1j67s1p"><span class="material-symbols-outlined text-[18px]">delete</span> <span class="md:hidden text-sm font-semibold">Hapus</span></button> </div>`} </div>`;
    })} ${diseaseHistory.length === 0 ? `<p class="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50" data-svelte-h="svelte-1jhdrsu">Belum ada riwayat penyakit</p>` : ``}</div></section>  <section class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"><div class="flex items-center justify-between mb-6 border-b border-slate-100 pb-4"><div class="flex items-center gap-2 text-primary" data-svelte-h="svelte-126u1vt"><span class="material-symbols-outlined">warning</span> <h3 class="font-bold text-lg text-slate-800">Alergi</h3></div> <button type="button" class="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1" data-svelte-h="svelte-11m8pn5"><span class="material-symbols-outlined text-sm">add</span> Tambah</button></div> <div class="space-y-4">${each(allergies, (item, i) => {
      return `<div class="flex flex-col gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100">${item.substance_code && item.reaction_code ? `<div class="flex items-center gap-2 text-sm"><span class="material-symbols-outlined text-primary text-[16px]" data-svelte-h="svelte-h4pe0j">check_circle</span> <span class="font-medium text-slate-800">${escape(item.substance_display)}</span> ${item.reaction_display ? `<span class="text-xs text-slate-400 ml-auto px-2 py-1 bg-slate-200 rounded">${escape(item.reaction_display)} </span>` : ``} <button type="button" class="text-red-500 hover:text-red-700" data-svelte-h="svelte-7s1fnr">✕</button> </div>` : `<div class="flex flex-col md:flex-row gap-4 items-center"><div class="flex-1 w-full min-w-0 [&amp;>div.form-group]:mb-0 [&amp;_input]:w-full [&amp;_input]:h-11 [&amp;_input]:rounded-lg [&amp;_input]:border-slate-200 [&amp;_input]:bg-white [&amp;_input]:focus:ring-primary [&amp;_input]:focus:border-primary [&amp;_input]:text-sm">${validate_component(SearchableSelect, "SearchableSelect").$$render(
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
      )}</div> <div class="w-full md:w-64 shrink-0">${validate_component(RichSelect, "RichSelect").$$render(
        $$result,
        {
          placeholder: "Pilih Reaksi",
          options: reactionOptions,
          value: item.reaction_code
        },
        {
          value: ($$value) => {
            item.reaction_code = $$value;
            $$settled = false;
          }
        },
        {}
      )}</div> <button type="button" class="w-full md:w-auto h-11 px-4 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors shrink-0 flex items-center justify-center gap-2" data-svelte-h="svelte-fe2zsv"><span class="material-symbols-outlined text-[18px]">delete</span> <span class="md:hidden text-sm font-semibold">Hapus</span></button> </div>`} </div>`;
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
  $$unsubscribe_page();
  $$unsubscribe_loadingProvince();
  $$unsubscribe_loadingRegency();
  $$unsubscribe_loadingDistrict();
  $$unsubscribe_loadingVillage();
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-01dcbec6.js.map
