<script>
    import { goto } from "$app/navigation";
    import SearchableSelect from "$lib/components/Forms/SearchableSelect.svelte";
    import { ALLERGY_REACTIONS, BLOOD_TYPES } from "$lib/utils/constants.js";
    import { validatePatientForm } from "$lib/utils/validators.js";
    import { addToast } from "$lib/stores/toast.js";

    let loading = false;
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
        chief_complaint_display: "",
    };

    let diseaseHistory = [];
    let allergies = [];
    let medications = [];

    // Load on-shift doctors
    async function loadDoctors() {
        const today = new Date().getDay();
        const res = await fetch(`/api/doctors?day=${today}`);
        const data = await res.json();
        doctors = data.doctors || [];
    }

    // Snowstorm search — split personal/family disease history
    async function searchPersonalDisease(term) {
        const res = await fetch(
            `/api/snowstorm?term=${encodeURIComponent(term)}&type=disease_personal`,
        );
        const data = await res.json();
        return (data.results || []).map((r) => ({
            value: r.code,
            label: r.display || r.preferred,
        }));
    }
    async function searchFamilyDisease(term) {
        const res = await fetch(
            `/api/snowstorm?term=${encodeURIComponent(term)}&type=disease_family`,
        );
        const data = await res.json();
        return (data.results || []).map((r) => ({
            value: r.code,
            label: r.display || r.preferred,
        }));
    }

    async function searchAllergy(term) {
        const res = await fetch(
            `/api/snowstorm?term=${encodeURIComponent(term)}&type=allergy`,
        );
        const data = await res.json();
        return (data.results || []).map((r) => ({
            value: r.code,
            label: r.display || r.preferred,
        }));
    }

    async function searchComplaint(term) {
        const res = await fetch(
            `/api/snowstorm?term=${encodeURIComponent(term)}&type=reason`,
        );
        const data = await res.json();
        return (data.results || []).map((r) => ({
            value: r.code,
            label: r.display || r.preferred,
        }));
    }

    async function searchMedication(term) {
        const res = await fetch(`/api/kfa?query=${encodeURIComponent(term)}`);
        const data = await res.json();
        return (data.results || []).map((r) => ({
            value: r.code,
            label: r.display,
        }));
    }

    function addDiseaseHistory() {
        diseaseHistory = [
            ...diseaseHistory,
            { type: "personal", description: "", code: "" },
        ];
    }
    function removeDiseaseHistory(i) {
        diseaseHistory = diseaseHistory.filter((_, idx) => idx !== i);
    }

    function addAllergy() {
        allergies = [
            ...allergies,
            {
                substance_code: "",
                substance_display: "",
                reaction_code: "",
                reaction_display: "",
            },
        ];
    }
    function removeAllergy(i) {
        allergies = allergies.filter((_, idx) => idx !== i);
    }

    function addMedication() {
        medications = [
            ...medications,
            { code: "", display: "", dosage: "", note: "" },
        ];
    }
    function removeMedication(i) {
        medications = medications.filter((_, idx) => idx !== i);
    }

    async function handleSubmit() {
        const validation = validatePatientForm(form);
        if (!validation.valid) {
            errors = validation.errors;
            return;
        }

        if (!form.doctor_id) {
            errors.doctor_id = "Pilih dokter";
            return;
        }

        loading = true;
        errors = {};

        try {
            // 1. Create patient
            const patientRes = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    disease_history: diseaseHistory,
                    allergies,
                    medications,
                }),
            });

            if (!patientRes.ok) {
                const err = await patientRes.json();
                addToast(err.error || "Gagal membuat pasien", "error");
                loading = false;
                return;
            }

            const patientData = await patientRes.json();
            const patientId = patientData.patient.id;

            // 2. Create encounter (auto-queue)
            const encRes = await fetch("/api/encounters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patient_id: patientId,
                    doctor_id: form.doctor_id,
                    chief_complaint_code: form.chief_complaint_code,
                    chief_complaint_display: form.chief_complaint_display,
                    tekanan_darah: form.tekanan_darah,
                }),
            });

            if (!encRes.ok) {
                const err = await encRes.json();
                addToast(err.error || "Gagal membuat antrian", "error");
                loading = false;
                return;
            }

            const encData = await encRes.json();

            addToast(
                `Pasien ${form.nama_lengkap} ditambahkan ke antrian #${encData.queue_number}`,
                "success",
            );
            goto("/kasir");
        } catch (err) {
            addToast("Terjadi kesalahan", "error");
        } finally {
            loading = false;
        }
    }

    import { onMount } from "svelte";
    onMount(loadDoctors);
</script>

<svelte:head>
    <title>Pasien Baru — Oratio Dental</title>
</svelte:head>

<div class="p-8 max-w-5xl mx-auto">
    <div class="mb-8">
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">
            Registrasi Pasien Baru
        </h2>
        <p class="text-slate-500 mt-1">
            Lengkapi formulir pendaftaran pasien untuk memulai sesi konsultasi.
        </p>
    </div>

    <form class="flex flex-col gap-8 pb-20" on:submit|preventDefault={handleSubmit}>
        <!-- Section: Patient Identity -->
        <section
            class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
            <div class="flex items-center gap-2 mb-6 text-primary">
                <span class="material-symbols-outlined">badge</span>
                <h3 class="font-bold text-lg text-slate-800">
                    Identitas Pasien
                </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="col-span-full md:col-span-1">
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >NIK (National ID) <span class="text-red-500">*</span
                        ></label
                    >
                    <input
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all {errors.nik
                            ? 'border-red-500 ring-1 ring-red-500'
                            : ''}"
                        placeholder="16-digit nomor induk"
                        type="text"
                        bind:value={form.nik}
                        maxlength="16"
                    />
                    {#if errors.nik}<span
                            class="text-xs text-red-500 mt-1 block"
                            >{errors.nik}</span
                        >{/if}
                </div>
                <div class="col-span-full md:col-span-2">
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Nama Lengkap <span class="text-red-500">*</span></label
                    >
                    <input
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all {errors.nama_lengkap
                            ? 'border-red-500 ring-1 ring-red-500'
                            : ''}"
                        placeholder="Nama sesuai KTP"
                        type="text"
                        bind:value={form.nama_lengkap}
                    />
                    {#if errors.nama_lengkap}<span
                            class="text-xs text-red-500 mt-1 block"
                            >{errors.nama_lengkap}</span
                        >{/if}
                </div>
                <div>
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Tanggal Lahir <span class="text-red-500">*</span
                        ></label
                    >
                    <input
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all {errors.birth_date
                            ? 'border-red-500 ring-1 ring-red-500'
                            : ''}"
                        type="date"
                        bind:value={form.birth_date}
                    />
                    {#if errors.birth_date}<span
                            class="text-xs text-red-500 mt-1 block"
                            >{errors.birth_date}</span
                        >{/if}
                </div>
                <div>
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Tempat Lahir</label
                    >
                    <input
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Kota/Kabupaten"
                        type="text"
                        bind:value={form.birthplace}
                    />
                </div>
                <div>
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Jenis Kelamin <span class="text-red-500">*</span
                        ></label
                    >
                    <select
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"
                        bind:value={form.gender}
                    >
                        <option value="male">Laki-laki (Male)</option>
                        <option value="female">Perempuan (Female)</option>
                        <option value="other">Lainnya (Other)</option>
                    </select>
                </div>
                <div>
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Status Perkawinan</label
                    >
                    <select
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"
                        bind:value={form.marital_status}
                    >
                        <option value="S">Belum Menikah</option>
                        <option value="M">Menikah</option>
                        <option value="W">Janda/Duda</option>
                        <option value="D">Cerai</option>
                    </select>
                </div>
                <div>
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Kewarganegaraan</label
                    >
                    <select
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"
                        bind:value={form.citizenship}
                    >
                        <option value="WNI">WNI</option>
                        <option value="WNA">WNA</option>
                    </select>
                </div>
            </div>
        </section>

        <!-- Section: Keluarga & Alamat -->
        <section
            class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
            <div class="flex items-center gap-2 mb-6 text-primary">
                <span class="material-symbols-outlined">home</span>
                <h3 class="font-bold text-lg text-slate-800">
                    Keluarga & Alamat
                </h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="col-span-full">
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Nomor KK (Family Card)</label
                    >
                    <input
                        class="w-full md:w-1/2 rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"
                        placeholder="16-digit nomor kartu keluarga"
                        type="text"
                        bind:value={form.nomor_kk}
                        maxlength="16"
                    />
                </div>
                <div class="col-span-full">
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Alamat Lengkap <span class="text-red-500">*</span
                        ></label
                    >
                    <textarea
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all {errors.address
                            ? 'border-red-500 ring-1 ring-red-500'
                            : ''}"
                        placeholder="Nama jalan, nomor rumah, gedung..."
                        rows="2"
                        bind:value={form.address}
                    ></textarea>
                    {#if errors.address}<span
                            class="text-xs text-red-500 mt-1 block"
                            >{errors.address}</span
                        >{/if}
                </div>
                <div class="col-span-2">
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Provinsi</label
                    >
                    <input
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Cari Provinsi..."
                        type="text"
                        bind:value={form.province}
                    />
                </div>
                <div class="col-span-2">
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Kota/Kabupaten</label
                    >
                    <input
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Cari Kota..."
                        type="text"
                        bind:value={form.city}
                    />
                </div>
                <div>
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Kecamatan</label
                    >
                    <input
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"
                        type="text"
                        bind:value={form.district}
                    />
                </div>
                <div>
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Kelurahan/Desa</label
                    >
                    <input
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"
                        type="text"
                        bind:value={form.village}
                    />
                </div>
                <div class="col-span-1">
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >RT</label
                    >
                    <input
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"
                        placeholder="000"
                        type="text"
                        bind:value={form.rt}
                        maxlength="5"
                    />
                </div>
                <div class="col-span-1">
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >RW</label
                    >
                    <input
                        class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"
                        placeholder="000"
                        type="text"
                        bind:value={form.rw}
                        maxlength="5"
                    />
                </div>
            </div>
        </section>

        <!-- Section: Contact & Medical -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section
                class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            >
                <div class="flex items-center gap-2 mb-6 text-primary">
                    <span class="material-symbols-outlined">contact_phone</span>
                    <h3 class="font-bold text-lg text-slate-800">Kontak</h3>
                </div>
                <div class="space-y-4">
                    <div>
                        <label
                            class="block text-sm font-semibold text-slate-700 mb-2"
                            >Nomor Handphone</label
                        >
                        <div class="flex">
                            <span
                                class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-100 text-slate-500 text-sm font-medium"
                                >+62</span
                            >
                            <input
                                class="flex-1 rounded-r-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all {errors.handphone
                                    ? 'border-red-500 ring-red-500'
                                    : ''}"
                                placeholder="812-xxxx-xxxx"
                                type="text"
                                bind:value={form.handphone}
                            />
                        </div>
                        {#if errors.handphone}<span
                                class="text-xs text-red-500 mt-1 block"
                                >{errors.handphone}</span
                            >{/if}
                    </div>
                    <div>
                        <label
                            class="block text-sm font-semibold text-slate-700 mb-2"
                            >Email</label
                        >
                        <input
                            class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all {errors.email
                                ? 'border-red-500 ring-1 ring-red-500'
                                : ''}"
                            placeholder="contoh@email.com"
                            type="email"
                            bind:value={form.email}
                        />
                        {#if errors.email}<span
                                class="text-xs text-red-500 mt-1 block"
                                >{errors.email}</span
                            >{/if}
                    </div>
                </div>
            </section>

            <section
                class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            >
                <div class="flex items-center gap-2 mb-6 text-primary">
                    <span class="material-symbols-outlined"
                        >medical_information</span
                    >
                    <h3 class="font-bold text-lg text-slate-800">
                        Info Medis & Vitals
                    </h3>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label
                            class="block text-sm font-semibold text-slate-700 mb-2"
                            >Gol. Darah <span class="text-red-500">*</span
                            ></label
                        >
                        <select
                            class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all {errors.blood_type
                                ? 'border-red-500 ring-1 ring-red-500'
                                : ''}"
                            bind:value={form.blood_type}
                        >
                            <option value="">-- Pilih --</option>
                            {#each BLOOD_TYPES as bt}
                                <option value={bt}>{bt}</option>
                            {/each}
                        </select>
                        {#if errors.blood_type}<span
                                class="text-xs text-red-500 mt-1 block"
                                >{errors.blood_type}</span
                            >{/if}
                    </div>
                    <div>
                        <label
                            class="block text-sm font-semibold text-slate-700 mb-2"
                            >Rhesus</label
                        >
                        <select
                            class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all"
                            bind:value={form.rhesus}
                        >
                            <option value="+">+</option>
                            <option value="-">-</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label
                            class="block text-sm font-semibold text-slate-700 mb-2"
                            >Tekanan Darah (Blood Pressure)</label
                        >
                        <div class="flex items-center gap-3">
                            <input
                                class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all {errors.tekanan_darah
                                    ? 'border-red-500 ring-1 ring-red-500'
                                    : ''}"
                                placeholder="120/80"
                                type="text"
                                bind:value={form.tekanan_darah}
                            />
                            <span class="text-xs text-slate-400 font-bold"
                                >mmHg</span
                            >
                        </div>
                        {#if errors.tekanan_darah}<span
                                class="text-xs text-red-500 mt-1 block"
                                >{errors.tekanan_darah}</span
                            >{/if}
                    </div>
                </div>
                <label
                    class="flex items-center gap-3 cursor-pointer group mt-6 w-max"
                >
                    <div
                        class="relative inline-flex items-center cursor-pointer"
                    >
                        <input
                            class="sr-only peer"
                            type="checkbox"
                            bind:checked={form.pregnancy_status}
                        />
                        <div
                            class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                        ></div>
                    </div>
                    <span
                        class="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors"
                        >Status Kehamilan (Pregnancy Status)</span
                    >
                </label>
            </section>
        </div>

        <!-- Section: Assignment & Condition -->
        <section
            class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
            <div class="flex items-center gap-2 mb-6 text-primary">
                <span class="material-symbols-outlined">assignment</span>
                <h3 class="font-bold text-lg text-slate-800">
                    Penugasan & Keluhan
                </h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Pilih Dokter <span class="text-red-500">*</span></label
                    >
                    <div class="relative">
                        <select
                            class="w-full pl-10 pr-4 py-2.5 rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all appearance-none {errors.doctor_id
                                ? 'border-red-500 ring-1 ring-red-500'
                                : ''}"
                            bind:value={form.doctor_id}
                        >
                            <option disabled selected value=""
                                >Cari Dokter...</option
                            >
                            {#each doctors as doc}
                                <option value={doc.id}
                                    >drg. {doc.name} ({doc.doctor_code})</option
                                >
                            {/each}
                        </select>
                        <span
                            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            >stethoscope</span
                        >
                        <span
                            class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            >expand_more</span
                        >
                    </div>
                    {#if errors.doctor_id}<span
                            class="text-xs text-red-500 mt-1 block"
                            >{errors.doctor_id}</span
                        >{/if}
                    <div class="mt-2 flex items-center gap-1.5">
                        <div
                            class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                        ></div>
                        <p
                            class="text-[11px] font-bold text-emerald-600 uppercase tracking-tight"
                        >
                            {doctors.length} Doctors available for walk-in
                        </p>
                    </div>
                </div>
                <div>
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Keluhan Utama (Main Complaint)</label
                    >
                    <div
                        class="[&>div.form-group]:mb-0 [&_input]:w-full [&_input]:rounded-lg [&_input]:border-slate-200 [&_input]:bg-slate-50 [&_input]:focus:ring-primary [&_input]:focus:border-primary"
                    >
                        <SearchableSelect
                            placeholder="Cari keluhan (SNOMED)..."
                            searchFn={searchComplaint}
                            bind:value={form.chief_complaint_code}
                            on:select={(e) => {
                                form.chief_complaint_display = e.detail.label;
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>

        <!-- Section: Riwayat Penyakit -->
        <section
            class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
            <div
                class="flex items-center justify-between mb-6 border-b border-slate-100 pb-4"
            >
                <div class="flex items-center gap-2 text-primary">
                    <span class="material-symbols-outlined">history</span>
                    <h3 class="font-bold text-lg text-slate-800">
                        Riwayat Penyakit
                    </h3>
                </div>
                <button
                    type="button"
                    class="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                    on:click={addDiseaseHistory}
                >
                    <span class="material-symbols-outlined text-sm">add</span> Tambah
                </button>
            </div>
            <div class="space-y-4">
                {#each diseaseHistory as item, i}
                    <div
                        class="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-100"
                    >
                        <div class="w-full md:w-40 shrink-0">
                            <select
                                class="w-full h-11 rounded-lg border-slate-200 bg-white focus:ring-primary focus:border-primary text-sm"
                                bind:value={item.type}
                            >
                                <option value="personal">Pribadi</option>
                                <option value="family">Keluarga</option>
                            </select>
                        </div>
                        <div
                            class="flex-1 w-full min-w-0 [&>div.form-group]:mb-0 [&_input]:w-full [&_input]:h-11 [&_input]:rounded-lg [&_input]:border-slate-200 [&_input]:bg-white [&_input]:focus:ring-primary [&_input]:focus:border-primary [&_input]:text-sm"
                        >
                            <SearchableSelect
                                placeholder="Cari penyakit (SNOMED)..."
                                searchFn={item.type === "family"
                                    ? searchFamilyDisease
                                    : searchPersonalDisease}
                                bind:value={item.code}
                                on:select={(e) => {
                                    item.description = e.detail.label;
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            class="w-full md:w-auto h-11 px-4 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors shrink-0 flex items-center justify-center gap-2"
                            on:click={() => removeDiseaseHistory(i)}
                        >
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                            <span class="md:hidden text-sm font-semibold">Hapus</span>
                        </button>
                    </div>
                {/each}
                {#if diseaseHistory.length === 0}
                    <p
                        class="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50"
                    >
                        Belum ada riwayat penyakit
                    </p>
                {/if}
            </div>
        </section>

        <!-- Section: Alergi -->
        <section
            class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
            <div
                class="flex items-center justify-between mb-6 border-b border-slate-100 pb-4"
            >
                <div class="flex items-center gap-2 text-primary">
                    <span class="material-symbols-outlined">warning</span>
                    <h3 class="font-bold text-lg text-slate-800">Alergi</h3>
                </div>
                <button
                    type="button"
                    class="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                    on:click={addAllergy}
                >
                    <span class="material-symbols-outlined text-sm">add</span> Tambah
                </button>
            </div>
            <div class="space-y-4">
                {#each allergies as item, i}
                    <div
                        class="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-100"
                    >
                        <div class="flex-1 w-full min-w-0 [&>div.form-group]:mb-0 [&_input]:w-full [&_input]:h-11 [&_input]:rounded-lg [&_input]:border-slate-200 [&_input]:bg-white [&_input]:focus:ring-primary [&_input]:focus:border-primary [&_input]:text-sm">
                            <SearchableSelect
                                placeholder="Cari alergen/substansi..."
                                searchFn={searchAllergy}
                                bind:value={item.substance_code}
                                on:select={(e) => {
                                    item.substance_display = e.detail.label;
                                }}
                            />
                        </div>
                        <div class="w-full md:w-64 shrink-0">
                            <select
                                class="w-full h-11 rounded-lg border-slate-200 bg-white focus:ring-primary focus:border-primary text-sm"
                                bind:value={item.reaction_code}
                                on:change={(e) => {
                                    const sel = ALLERGY_REACTIONS.find(
                                        (r) => r.code === item.reaction_code,
                                    );
                                    if (sel)
                                        item.reaction_display = sel.display;
                                }}
                            >
                                <option value="">-- Reaksi --</option>
                                {#each ALLERGY_REACTIONS as r}
                                    <option value={r.code}>{r.display}</option>
                                {/each}
                            </select>
                        </div>
                        <button
                            type="button"
                            class="w-full md:w-auto h-11 px-4 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors shrink-0 flex items-center justify-center gap-2"
                            on:click={() => removeAllergy(i)}
                        >
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                            <span class="md:hidden text-sm font-semibold">Hapus</span>
                        </button>
                    </div>
                {/each}
                {#if allergies.length === 0}
                    <p
                        class="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50"
                    >
                        Belum ada data alergi
                    </p>
                {/if}
            </div>
        </section>

        <!-- Section: Riwayat Pengobatan -->
        <section
            class="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
            <div
                class="flex items-center justify-between mb-6 border-b border-slate-100 pb-4"
            >
                <div class="flex items-center gap-2 text-primary">
                    <span class="material-symbols-outlined">medication</span>
                    <h3 class="font-bold text-lg text-slate-800">
                        Riwayat Pengobatan
                    </h3>
                </div>
                <button
                    type="button"
                    class="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                    on:click={addMedication}
                >
                    <span class="material-symbols-outlined text-sm">add</span> Tambah
                </button>
            </div>
            <div class="space-y-4">
                {#each medications as item, i}
                    <div
                        class="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-100"
                    >
                        <div class="flex-1 w-full min-w-0 [&>div.form-group]:mb-0 [&_input]:w-full [&_input]:h-11 [&_input]:rounded-lg [&_input]:border-slate-200 [&_input]:bg-white [&_input]:focus:ring-primary [&_input]:focus:border-primary [&_input]:text-sm">
                            <SearchableSelect
                                placeholder="Cari obat (KFA)..."
                                searchFn={searchMedication}
                                bind:value={item.code}
                                on:select={(e) => {
                                    item.display = e.detail.label;
                                }}
                            />
                        </div>
                        <div class="w-full md:w-32 shrink-0">
                            <input
                                class="w-full h-11 rounded-lg border-slate-200 bg-white focus:ring-primary focus:border-primary text-sm"
                                bind:value={item.dosage}
                                placeholder="Dosis"
                            />
                        </div>
                        <button
                            type="button"
                            class="w-full md:w-auto h-11 px-4 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors shrink-0 flex items-center justify-center gap-2"
                            on:click={() => removeMedication(i)}
                        >
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                            <span class="md:hidden text-sm font-semibold">Hapus</span>
                        </button>
                    </div>
                {/each}
                {#if medications.length === 0}
                    <p
                        class="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50"
                    >
                        Belum ada riwayat pengobatan
                    </p>
                {/if}
            </div>
        </section>

        <!-- Form Actions -->
        <div
            class="flex items-center justify-end gap-4 mt-12 border-t border-slate-200 pt-8"
        >
            <button
                disabled={loading}
                class="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
                type="button"
                on:click={() => goto("/kasir")}
            >
                Batal
            </button>
            <button
                class="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
            >
                {#if loading}
                    <span
                        class="material-symbols-outlined animate-spin"
                        style="animation: spin 1s linear infinite;"
                        >refresh</span
                    >
                    <span>Memproses...</span>
                {:else}
                    <span>Submit & Queue Patient</span>
                    <span class="material-symbols-outlined text-[20px]"
                        >send</span
                    >
                {/if}
            </button>
        </div>
    </form>
</div>

<style>
    /* Use exact animation definition to match login spinner logic visually */
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
