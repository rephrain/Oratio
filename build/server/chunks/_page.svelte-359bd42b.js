import { c as create_ssr_component, f as add_attribute, e as escape, d as each, v as validate_component } from './ssr-631a3160.js';
import { S as SearchableSelect } from './SearchableSelect-39e7cc67.js';
import { B as BLOOD_TYPES, a as ALLERGY_REACTIONS } from './constants-6ed35477.js';

async function searchAllergy(term) {
  const res = await fetch(`/api/snowstorm?term=${encodeURIComponent(term)}&count=10`);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    value: r.code,
    label: r.display || r.preferred
  }));
}
async function searchComplaint(term) {
  const res = await fetch(`/api/snowstorm?term=${encodeURIComponent(term)}&type=reason`);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    value: r.code,
    label: r.display || r.preferred
  }));
}
async function searchMedication(term) {
  const res = await fetch(`/api/kfa?query=${encodeURIComponent(term)}`);
  const data = await res.json();
  return (data.results || []).map((r) => ({ value: r.code, label: r.display }));
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let errors = {};
  let doctors = [];
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
    language: "id",
    blood_type: "",
    rhesus: "+",
    pregnancy_status: false,
    tekanan_darah: "",
    doctor_id: "",
    chief_complaint_code: "",
    chief_complaint_display: ""
  };
  let diseaseHistory = [];
  let allergies = [];
  let medications = [];
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${$$result.head += `<!-- HEAD_svelte-1b3v2ak_START -->${$$result.title = `<title>Pasien Baru — Oratio Clinic</title>`, ""}<!-- HEAD_svelte-1b3v2ak_END -->`, ""} <div><div class="flex items-center justify-between mb-6" data-svelte-h="svelte-1f2ajgp"><h1 class="page-title" style="margin: 0;">Registrasi Pasien Baru</h1> <a href="/kasir" class="btn btn-secondary">← Kembali</a></div> <form> <div class="card mb-6"><h3 class="card-title mb-4" data-svelte-h="svelte-y9wmkx">📋 Data Identitas</h3> <div class="form-row"><div class="form-group"><label class="form-label" data-svelte-h="svelte-rqxmfl">NIK <span class="required">*</span></label> <input class="${["form-input", errors.nik ? "error" : ""].join(" ").trim()}" maxlength="16" placeholder="16 digit NIK"${add_attribute("value", form.nik, 0)}> ${errors.nik ? `<span class="form-error">${escape(errors.nik)}</span>` : ``}</div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-9zuj26">Nama Lengkap <span class="required">*</span></label> <input class="${["form-input", errors.nama_lengkap ? "error" : ""].join(" ").trim()}"${add_attribute("value", form.nama_lengkap, 0)}> ${errors.nama_lengkap ? `<span class="form-error">${escape(errors.nama_lengkap)}</span>` : ``}</div></div> <div class="form-row mt-4"><div class="form-group"><label class="form-label" data-svelte-h="svelte-d2gpd1">Tanggal Lahir <span class="required">*</span></label> <input type="date" class="${["form-input", errors.birth_date ? "error" : ""].join(" ").trim()}"${add_attribute("value", form.birth_date, 0)}> ${errors.birth_date ? `<span class="form-error">${escape(errors.birth_date)}</span>` : ``}</div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-rw3a8x">Tempat Lahir</label> <input class="form-input"${add_attribute("value", form.birthplace, 0)}></div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-1u9namb">Jenis Kelamin <span class="required">*</span></label> <select class="form-select"><option value="male" data-svelte-h="svelte-31djdy">Laki-laki</option><option value="female" data-svelte-h="svelte-1qho3pp">Perempuan</option></select></div></div> <div class="form-row mt-4"><div class="form-group"><label class="form-label" data-svelte-h="svelte-1v0cgwz">Nomor KK</label> <input class="form-input" maxlength="16"${add_attribute("value", form.nomor_kk, 0)}></div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-1lpqipq">Status Perkawinan</label> <select class="form-select"><option value="S" data-svelte-h="svelte-2jvi5b">Belum Menikah</option><option value="M" data-svelte-h="svelte-1gglx9i">Menikah</option><option value="W" data-svelte-h="svelte-vt28qq">Janda/Duda</option><option value="D" data-svelte-h="svelte-xwd8qy">Cerai</option></select></div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-72uhtf">Kewarganegaraan</label> <select class="form-select"><option value="WNI" data-svelte-h="svelte-1pgceba">WNI</option><option value="WNA" data-svelte-h="svelte-108hfxi">WNA</option></select></div></div></div>  <div class="card mb-6"><h3 class="card-title mb-4" data-svelte-h="svelte-r5rk5w">📍 Alamat</h3> <div class="form-group"><label class="form-label" data-svelte-h="svelte-jx7a2r">Alamat Lengkap <span class="required">*</span></label> <textarea class="${["form-textarea", errors.address ? "error" : ""].join(" ").trim()}" rows="2">${escape("")}</textarea> ${errors.address ? `<span class="form-error">${escape(errors.address)}</span>` : ``}</div> <div class="form-row mt-4"><div class="form-group"><label class="form-label" data-svelte-h="svelte-c9qrt4">Provinsi</label> <input class="form-input"${add_attribute("value", form.province, 0)}></div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-x7lwz3">Kota/Kabupaten</label> <input class="form-input"${add_attribute("value", form.city, 0)}></div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-s9iqcv">Kecamatan</label> <input class="form-input"${add_attribute("value", form.district, 0)}></div></div> <div class="form-row mt-4"><div class="form-group"><label class="form-label" data-svelte-h="svelte-1yazvx">Kelurahan/Desa</label> <input class="form-input"${add_attribute("value", form.village, 0)}></div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-vv31ea">RT</label> <input class="form-input" maxlength="5"${add_attribute("value", form.rt, 0)}></div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-15mk0bz">RW</label> <input class="form-input" maxlength="5"${add_attribute("value", form.rw, 0)}></div></div></div>  <div class="card mb-6"><h3 class="card-title mb-4" data-svelte-h="svelte-158v1eq">🩺 Data Medis &amp; Kontak</h3> <div class="form-row"><div class="form-group"><label class="form-label" data-svelte-h="svelte-1td2bj9">Handphone</label> <input class="form-input" placeholder="08xx-xxxx-xxxx"${add_attribute("value", form.handphone, 0)}> ${errors.handphone ? `<span class="form-error">${escape(errors.handphone)}</span>` : ``}</div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-63e5ns">Email</label> <input type="email" class="form-input"${add_attribute("value", form.email, 0)}> ${errors.email ? `<span class="form-error">${escape(errors.email)}</span>` : ``}</div></div> <div class="form-row mt-4"><div class="form-group"><label class="form-label" data-svelte-h="svelte-1xp9xhw">Golongan Darah <span class="required">*</span></label> <select class="${["form-select", errors.blood_type ? "error" : ""].join(" ").trim()}"><option value="" data-svelte-h="svelte-1wj0zs">-- Pilih --</option>${each(BLOOD_TYPES, (bt) => {
      return `<option${add_attribute("value", bt, 0)}>${escape(bt)}</option>`;
    })}</select> ${errors.blood_type ? `<span class="form-error">${escape(errors.blood_type)}</span>` : ``}</div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-mqe92e">Rhesus</label> <select class="form-select"><option value="+" data-svelte-h="svelte-ctfljb">Positif (+)</option><option value="-" data-svelte-h="svelte-hcjlwj">Negatif (-)</option></select></div> <div class="form-group"><label class="form-label" data-svelte-h="svelte-1flnak6">Status Kehamilan</label> <select class="form-select"><option${add_attribute("value", false, 0)} data-svelte-h="svelte-17oogs4">Tidak</option><option${add_attribute("value", true, 0)} data-svelte-h="svelte-1v6x8tw">Ya</option></select></div></div> <div class="form-row mt-4"><div class="form-group"><label class="form-label" data-svelte-h="svelte-1jiygh6">Tekanan Darah</label> <input class="form-input" placeholder="120/80"${add_attribute("value", form.tekanan_darah, 0)}> ${errors.tekanan_darah ? `<span class="form-error">${escape(errors.tekanan_darah)}</span>` : ``}</div></div></div>  <div class="card mb-6"><h3 class="card-title mb-4" data-svelte-h="svelte-1cco4n3">👨‍⚕️ Penugasan Dokter</h3> <div class="form-row"><div class="form-group"><label class="form-label" data-svelte-h="svelte-13d0wpd">Kode Dokter <span class="required">*</span></label> <select class="${["form-select", errors.doctor_id ? "error" : ""].join(" ").trim()}"><option value="" data-svelte-h="svelte-11fre5w">-- Pilih Dokter (On-Shift Hari Ini) --</option>${each(doctors, (doc) => {
      return `<option${add_attribute("value", doc.id, 0)}>${escape(doc.name)} (${escape(doc.doctor_code)})</option>`;
    })}</select> ${errors.doctor_id ? `<span class="form-error">${escape(errors.doctor_id)}</span>` : ``} ${doctors.length === 0 ? `<span class="form-hint" data-svelte-h="svelte-13rq5eb">Tidak ada dokter on-shift hari ini</span>` : ``}</div></div> <div class="form-row mt-4">${validate_component(SearchableSelect, "SearchableSelect").$$render(
      $$result,
      {
        label: "Keluhan Utama",
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
    )}</div></div>  <div class="card mb-6"><div class="card-header"><h3 class="card-title" data-svelte-h="svelte-s6supa">📝 Riwayat Penyakit</h3> <button type="button" class="btn btn-secondary btn-sm" data-svelte-h="svelte-1ft1fx5">+ Tambah</button></div> ${each(diseaseHistory, (item, i) => {
      return `<div class="flex gap-3 items-end mt-2"><div class="form-group" style="flex: 0 0 120px;"><select class="form-select"><option value="personal" data-svelte-h="svelte-icz86z">Pribadi</option><option value="family" data-svelte-h="svelte-tlbtti">Keluarga</option></select></div> <div class="form-group" style="flex: 1;"><input class="form-input" placeholder="Deskripsi penyakit"${add_attribute("value", item.description, 0)}></div> <button type="button" class="btn btn-danger btn-sm btn-icon" data-svelte-h="svelte-1unrzki">✕</button> </div>`;
    })} ${diseaseHistory.length === 0 ? `<p class="text-sm text-muted mt-2" data-svelte-h="svelte-1d470z1">Belum ada riwayat penyakit</p>` : ``}</div>  <div class="card mb-6"><div class="card-header"><h3 class="card-title" data-svelte-h="svelte-1bypnat">⚠️ Alergi</h3> <button type="button" class="btn btn-secondary btn-sm" data-svelte-h="svelte-159ghct">+ Tambah</button></div> ${each(allergies, (item, i) => {
      return `<div class="flex gap-3 items-end mt-2"><div class="form-group" style="flex: 1;">${validate_component(SearchableSelect, "SearchableSelect").$$render(
        $$result,
        {
          placeholder: "Cari substansi...",
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
      )}</div> <div class="form-group" style="flex: 1;"><select class="form-select"><option value="" data-svelte-h="svelte-5d2bgv">-- Reaksi --</option>${each(ALLERGY_REACTIONS, (r) => {
        return `<option${add_attribute("value", r.code, 0)}>${escape(r.display)}</option>`;
      })}</select></div> <button type="button" class="btn btn-danger btn-sm btn-icon" data-svelte-h="svelte-y7a8t4">✕</button> </div>`;
    })} ${allergies.length === 0 ? `<p class="text-sm text-muted mt-2" data-svelte-h="svelte-k0rscb">Belum ada data alergi</p>` : ``}</div>  <div class="card mb-6"><div class="card-header"><h3 class="card-title" data-svelte-h="svelte-orlkxx">💊 Riwayat Pengobatan</h3> <button type="button" class="btn btn-secondary btn-sm" data-svelte-h="svelte-1nad1o0">+ Tambah</button></div> ${each(medications, (item, i) => {
      return `<div class="flex gap-3 items-end mt-2"><div class="form-group" style="flex: 1;">${validate_component(SearchableSelect, "SearchableSelect").$$render(
        $$result,
        {
          placeholder: "Cari obat (KFA)...",
          searchFn: searchMedication,
          value: item.code
        },
        {
          value: ($$value) => {
            item.code = $$value;
            $$settled = false;
          }
        },
        {}
      )}</div> <div class="form-group" style="flex: 0 0 150px;"><input class="form-input" placeholder="Dosis"${add_attribute("value", item.dosage, 0)}></div> <button type="button" class="btn btn-danger btn-sm btn-icon" data-svelte-h="svelte-1o6cqh5">✕</button> </div>`;
    })} ${medications.length === 0 ? `<p class="text-sm text-muted mt-2" data-svelte-h="svelte-zzk6tt">Belum ada riwayat pengobatan</p>` : ``}</div>  <div class="flex justify-between"><a href="/kasir" class="btn btn-secondary" data-svelte-h="svelte-1hl0dkz">Batal</a> <button type="submit" class="btn btn-primary btn-lg" ${""}>${`➕ Daftarkan &amp; Antri`}</button></div></form></div>`;
  } while (!$$settled);
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-359bd42b.js.map
