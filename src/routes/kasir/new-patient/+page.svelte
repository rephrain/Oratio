<script>
    import { goto } from "$app/navigation";
    import SearchableSelect from "$lib/components/Forms/SearchableSelect.svelte";
    import {
        ALLERGY_REACTIONS,
        BLOOD_TYPES,
        COUNTRY_CALLING_CODES,
    } from "$lib/utils/constants.js";
    import { validatePatientForm } from "$lib/utils/validators.js";
    import { addToast } from "$lib/stores/toast.js";
    import { onMount } from "svelte";
    import { parsePhoneNumberFromString } from "libphonenumber-js";
    import {
        fetchProvinces,
        fetchRegencies,
        fetchDistricts,
        fetchVillages,
    } from "$lib/api/wilayah.js";
    import {
        provinces,
        regencies,
        districts,
        villages,
        loadingProvince,
        loadingRegency,
        loadingDistrict,
        loadingVillage,
    } from "$lib/stores/wilayah.js";
    import { searchPlaces } from "$lib/api/geonames";

    let loading = false;
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
        chief_complaint_display: "",
    };

    let diseaseHistory = [];
    let allergies = [];
    let medications = [];

    let selectedProvinceCode = "";
    let selectedRegencyCode = "";
    let selectedDistrictCode = "";

    let birthplaceSuggestions = [];
    let showBirthplaceSuggestions = false;
    let birthplaceDebounce;

    let phoneValid = false;

    $: form.handphone = inputPhoneNumber
        ? `${selectedCountryCode} ${inputPhoneNumber.replace(/^0+/, "")}`
        : "";

    $: selectedCountryIsoCode = (() => {
        const c = COUNTRY_CALLING_CODES.find(
            (x) => x.dial_code === selectedCountryCode,
        );
        return c?.code?.toLowerCase() || "id";
    })();

    // ── Doctors ──────────────────────────────────────────────────────────────
    async function loadDoctors() {
        const res = await fetch(`/api/doctors`);
        const data = await res.json();
        doctors = data.doctors || [];
    }

    // ── Snowstorm searches ───────────────────────────────────────────────────
    // All functions now use `filter=` consistently (family was wrongly using `term=`)
    async function searchPersonalDisease(term) {
        const res = await fetch(
            `/api/snowstorm?filter=${encodeURIComponent(term)}&type=disease_personal`,
        );
        const data = await res.json();
        // FIX: carry `display` and `system` in `meta` so onDiseaseSelected can write them back
        return (data.results || []).map((r) => ({
            value: r.code,
            label: r.display,
            meta: { display: r.display, system: r.system ?? "SNOMED" },
        }));
    }

    async function searchFamilyDisease(term) {
        // FIX: was `/api/snowstorm?term=...` — unified to `filter=`
        const res = await fetch(
            `/api/snowstorm?filter=${encodeURIComponent(term)}&type=disease_family`,
        );
        const data = await res.json();
        return (data.results || []).map((r) => ({
            value: r.code,
            label: r.display,
            meta: { display: r.display, system: r.system ?? "SNOMED" },
        }));
    }

    async function searchAllergy(term) {
        const res = await fetch(
            `/api/snowstorm?filter=${encodeURIComponent(term)}&type=allergy`,
        );
        const data = await res.json();
        return (data.results || []).map((r) => ({
            value: r.code,
            label: r.display,
            meta: { display: r.display, system: r.system ?? "SNOMED" },
        }));
    }

    async function searchComplaint(term) {
        const reasonType = form.reason_type || "finding";
        const res = await fetch(
            `/api/snowstorm?filter=${encodeURIComponent(term)}&type=reason_${reasonType}`,
        );
        const data = await res.json();
        return (data.results || []).map((r) => ({
            value: r.code,
            label: r.display,
            meta: { display: r.display, system: r.system ?? "SNOMED" },
        }));
    }

    // Medication: button-triggered search (KFA doesn't auto-suggest)
    let medicationSearchTerm = "";
    let medicationSearchResults = [];
    let medicationSearchLoading = false;
    let medicationSearchIndex = -1; // which medication row triggered the search
    let medicationMerkType = "known"; // 'known' or 'unknown'

    async function triggerMedicationSearch(i) {
        const term = medicationSearchTerm.trim();
        if (!term || term.length < 2) return;
        medicationSearchLoading = true;
        medicationSearchIndex = i;
        try {
            const res = await fetch(
                `/api/kfa?query=${encodeURIComponent(term)}&merkType=${medicationMerkType}`,
            );
            const data = await res.json();
            medicationSearchResults = (data.results || []).map((r) => ({
                kfa_code: r.kfa_code || r.code,
                product_name: r.display || r.product_name || "",
                dosage_form: r.dosage_form || "",
                code: r.code,
                display: r.display,
            }));
        } catch {
            medicationSearchResults = [];
        }
        medicationSearchLoading = false;
    }

    function selectMedicationResult(i, result) {
        medications = medications.map((entry, idx) => {
            if (idx !== i) return entry;
            return {
                ...entry,
                kfa_code: result.kfa_code,
                product_name: result.product_name,
                dosage_form: result.dosage_form,
                code: result.code,
                display: result.product_name,
            };
        });
        medicationSearchResults = [];
        medicationSearchIndex = -1;
        medicationSearchTerm = "";
    }

    // ── Disease history helpers ──────────────────────────────────────────────
    function addDiseaseHistory() {
        diseaseHistory = [
            ...diseaseHistory,
            // FIX: include `display` and `system` — the API skips entries missing these
            {
                type: "personal",
                code: "",
                display: "",
                system: "SNOMED",
                description: "",
            },
        ];
    }

    function removeDiseaseHistory(i) {
        diseaseHistory = diseaseHistory.filter((_, idx) => idx !== i);
    }

    /**
     * FIX: new handler — writes code + display + system from the selected option
     * back into diseaseHistory[i]. Without this, `display` stayed "" and the
     * patients API's `if (!entry.code || !entry.display) continue` silently
     * skipped every entry, so nothing was ever saved to terminology_master /
     * patient_disease_history.
     */
    function onDiseaseSelected(i, option) {
        diseaseHistory = diseaseHistory.map((entry, idx) => {
            if (idx !== i) return entry;
            return {
                ...entry,
                code: option.value,
                display: option.label, // <- was never set before
                system: option.meta?.system ?? "SNOMED",
            };
        });
    }

    // ── Allergy helpers ──────────────────────────────────────────────────────
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

    function onAllergySelected(i, option) {
        allergies = allergies.map((entry, idx) => {
            if (idx !== i) return entry;
            return {
                ...entry,
                substance_code: option.value,
                substance_display: option.label,
            };
        });
    }

    // ── Medication helpers ───────────────────────────────────────────────────
    function addMedication() {
        medications = [
            ...medications,
            {
                kfa_code: "",
                product_name: "",
                dosage_form: "",
                code: "",
                display: "",
                dosage: "",
                note: "",
            },
        ];
    }

    function removeMedication(i) {
        medications = medications.filter((_, idx) => idx !== i);
    }

    // ── Submit ───────────────────────────────────────────────────────────────
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
            // 1. Create patient (disease_history now carries code + display + system)
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
                    reason_type: form.reason_type || "finding",
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
            console.error(err);
            addToast("Terjadi kesalahan", "error");
        } finally {
            loading = false;
        }
    }

    onMount(async () => {
        loadDoctors();

        loadingProvince.set(true);
        try {
            provinces.set(await fetchProvinces());
        } finally {
            loadingProvince.set(false); // ← always runs, even if fetch fails
        }
    });

    async function onProvinceChange(e) {
        selectedProvinceCode = e.target.value;
        form.province =
            $provinces.find((p) => p.code === selectedProvinceCode)?.name ?? "";
        // Reset downstream
        form.city = "";
        form.district = "";
        form.village = "";
        selectedRegencyCode = "";
        selectedDistrictCode = "";
        regencies.set([]);
        districts.set([]);
        villages.set([]);

        if (!selectedProvinceCode) return;
        loadingRegency.set(true);
        regencies.set(await fetchRegencies(selectedProvinceCode));
        loadingRegency.set(false);

        if (!selectedProvinceCode) return;
        loadingRegency.set(true);
        try {
            regencies.set(await fetchRegencies(selectedProvinceCode));
        } finally {
            loadingRegency.set(false);
        }
    }

    async function onRegencyChange(e) {
        selectedRegencyCode = e.target.value;
        form.city =
            $regencies.find((r) => r.code === selectedRegencyCode)?.name ?? "";
        form.district = "";
        form.village = "";
        selectedDistrictCode = "";
        districts.set([]);
        villages.set([]);

        if (!selectedRegencyCode) return;
        loadingDistrict.set(true);
        districts.set(await fetchDistricts(selectedRegencyCode));
        loadingDistrict.set(false);
    }

    async function onDistrictChange(e) {
        selectedDistrictCode = e.target.value;
        form.district =
            $districts.find((d) => d.code === selectedDistrictCode)?.name ?? "";
        form.village = "";
        villages.set([]);

        if (!selectedDistrictCode) return;
        loadingVillage.set(true);
        villages.set(await fetchVillages(selectedDistrictCode));
        loadingVillage.set(false);
    }

    function onVillageChange(e) {
        form.village =
            $villages.find((v) => v.code === e.target.value)?.name ?? "";
    }

    function onBirthplaceInput(e) {
        const val = e.target.value;
        form.birthplace = val;
        clearTimeout(birthplaceDebounce);
        if (val.length < 2) {
            birthplaceSuggestions = [];
            showBirthplaceSuggestions = false;
            return;
        }
        birthplaceDebounce = setTimeout(async () => {
            birthplaceSuggestions = await searchPlaces(val);
            showBirthplaceSuggestions = birthplaceSuggestions.length > 0;
        }, 300);
    }

    function selectBirthplace(place) {
        form.birthplace =
            place.name +
            (place.adminName1 ? `, ${place.adminName1}` : "") +
            `, ${place.countryName}`;
        birthplaceSuggestions = [];
        showBirthplaceSuggestions = false;
    }

    function onBirthplaceBlur() {
        setTimeout(() => {
            showBirthplaceSuggestions = false;
        }, 150);
    }

    function validatePhone() {
        if (!inputPhoneNumber) {
            errors.handphone = "Nomor handphone wajib diisi";
            phoneValid = false;
            return;
        }
        try {
            const parsed = parsePhoneNumberFromString(
                selectedCountryCode +
                    inputPhoneNumber.replace(/[\s\-()+]/g, ""),
            );
            if (parsed?.isValid()) {
                errors.handphone = "";
                phoneValid = true;
            } else {
                errors.handphone = "Nomor handphone tidak valid";
                phoneValid = false;
            }
        } catch {
            errors.handphone = "Nomor handphone tidak valid";
            phoneValid = false;
        }
    }
</script>

<svelte:head>
    <title>Pasien Baru — Oratio Clinic</title>
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

    <form
        class="flex flex-col gap-8 pb-20"
        on:submit|preventDefault={handleSubmit}
    >
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
                        >Patient ID (National ID) <span class="text-red-500">*</span
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
                    <div class="relative">
                        <input
                            class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm
                                focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                            placeholder="Cari Kota/Kabupaten..."
                            type="text"
                            value={form.birthplace}
                            on:input={onBirthplaceInput}
                            on:blur={onBirthplaceBlur}
                            autocomplete="off"
                        />

                        {#if showBirthplaceSuggestions}
                            <ul
                                class="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto py-1"
                            >
                                {#each birthplaceSuggestions as place}
                                    <button
                                        type="button"
                                        class="w-full flex flex-col px-3 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                                        on:mousedown={() =>
                                            selectBirthplace(place)}
                                    >
                                        <span
                                            class="text-sm font-medium text-slate-700"
                                            >{place.name}</span
                                        >
                                        <span class="text-xs text-slate-400">
                                            {[
                                                place.adminName1,
                                                place.countryName,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </span>
                                    </button>
                                {/each}
                            </ul>
                        {/if}
                    </div>
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
                <!-- Provinsi -->
                <div class="col-span-2">
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Provinsi</label
                    >
                    <div class="relative">
                        <select
                            class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700
                            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all
                            appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            on:change={onProvinceChange}
                            disabled={$loadingProvince}
                        >
                            <option value=""
                                >{$loadingProvince
                                    ? "Memuat..."
                                    : "Pilih Provinsi"}</option
                            >
                            {#each $provinces as p}
                                <option
                                    value={p.code}
                                    selected={p.name === form.province}
                                    >{p.name}</option
                                >
                            {/each}
                        </select>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                        >
                            {#if $loadingProvince}
                                <svg
                                    class="w-3.5 h-3.5 text-slate-400 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        class="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        stroke-width="4"
                                    />
                                    <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8z"
                                    />
                                </svg>
                            {:else}
                                <svg
                                    class="w-3 h-3 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Kota/Kabupaten -->
                <div class="col-span-2">
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Kota/Kabupaten</label
                    >
                    <div class="relative">
                        <select
                            class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700
                            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all
                            appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            on:change={onRegencyChange}
                            disabled={!selectedProvinceCode || $loadingRegency}
                        >
                            <option value="">
                                {!selectedProvinceCode
                                    ? "Pilih Provinsi dulu"
                                    : $loadingRegency
                                      ? "Memuat..."
                                      : "Pilih Kota/Kabupaten"}
                            </option>
                            {#each $regencies as r}
                                <option
                                    value={r.code}
                                    selected={r.name === form.city}
                                    >{r.name}</option
                                >
                            {/each}
                        </select>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                        >
                            {#if $loadingRegency}
                                <svg
                                    class="w-3.5 h-3.5 text-slate-400 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        class="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        stroke-width="4"
                                    />
                                    <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8z"
                                    />
                                </svg>
                            {:else}
                                <svg
                                    class="w-3 h-3 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Kecamatan -->
                <div>
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Kecamatan</label
                    >
                    <div class="relative">
                        <select
                            class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700
                            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all
                            appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            on:change={onDistrictChange}
                            disabled={!selectedRegencyCode || $loadingDistrict}
                        >
                            <option value="">
                                {!selectedRegencyCode
                                    ? "Pilih Kota dulu"
                                    : $loadingDistrict
                                      ? "Memuat..."
                                      : "Pilih Kecamatan"}
                            </option>
                            {#each $districts as d}
                                <option
                                    value={d.code}
                                    selected={d.name === form.district}
                                    >{d.name}</option
                                >
                            {/each}
                        </select>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                        >
                            {#if $loadingDistrict}
                                <svg
                                    class="w-3.5 h-3.5 text-slate-400 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        class="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        stroke-width="4"
                                    />
                                    <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8z"
                                    />
                                </svg>
                            {:else}
                                <svg
                                    class="w-3 h-3 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- Kelurahan/Desa -->
                <div>
                    <label
                        class="block text-sm font-semibold text-slate-700 mb-2"
                        >Kelurahan/Desa</label
                    >
                    <div class="relative">
                        <select
                            class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700
                            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all
                            appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            on:change={onVillageChange}
                            disabled={!selectedDistrictCode || $loadingVillage}
                        >
                            <option value="">
                                {!selectedDistrictCode
                                    ? "Pilih Kecamatan dulu"
                                    : $loadingVillage
                                      ? "Memuat..."
                                      : "Pilih Kelurahan/Desa"}
                            </option>
                            {#each $villages as v}
                                <option
                                    value={v.code}
                                    selected={v.name === form.village}
                                    >{v.name}</option
                                >
                            {/each}
                        </select>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-3 flex items-center"
                        >
                            {#if $loadingVillage}
                                <svg
                                    class="w-3.5 h-3.5 text-slate-400 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        class="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        stroke-width="4"
                                    />
                                    <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8z"
                                    />
                                </svg>
                            {:else}
                                <svg
                                    class="w-3 h-3 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            {/if}
                        </div>
                    </div>
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
                        >
                            Nomor Handphone
                        </label>
                        <div class="flex">
                            <!-- Country code select with transparent native overlay -->
                            <div
                                class="relative flex-shrink-0 w-28 bg-slate-50 hover:bg-slate-100 transition-colors border border-r-0 rounded-l-lg flex items-center px-3 {errors.handphone
                                    ? 'border-red-400'
                                    : 'border-slate-200'} focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary overflow-hidden"
                            >
                                <!-- Visual Display -->
                                <span
                                    class="text-base leading-none mr-2 flex items-center"
                                >
                                    <span class="fi fi-{selectedCountryIsoCode}"
                                    ></span>
                                </span>
                                <span
                                    class="text-sm font-medium text-slate-700 tabular-nums"
                                    >{selectedCountryCode}</span
                                >

                                <!-- Custom chevron -->
                                <svg
                                    class="w-3 h-3 text-slate-400 ml-auto"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>

                                <!-- Invisible Select (Handles click & dropdown correctly) -->
                                <select
                                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none outline-none"
                                    bind:value={selectedCountryCode}
                                    on:change={validatePhone}
                                >
                                    {#each COUNTRY_CALLING_CODES as country}
                                        <option
                                            value={country.dial_code}
                                            title={country.name}
                                        >
                                            {country.name}
                                            {country.dial_code}
                                        </option>
                                    {/each}
                                </select>
                            </div>

                            <!-- Phone number input -->
                            <input
                                class="flex-1 rounded-r-lg border px-3 py-2 text-sm
                                    bg-slate-50 text-slate-800 placeholder:text-slate-400
                                    focus:outline-none focus:ring-2 transition-all
                                    {errors.handphone
                                    ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                                    : 'border-slate-200 focus:ring-primary/30 focus:border-primary'}"
                                placeholder="812-xxxx-xxxx"
                                type="text"
                                bind:value={inputPhoneNumber}
                                on:input={validatePhone}
                                on:blur={validatePhone}
                            />
                        </div>

                        <!-- Error state -->
                        {#if errors.handphone}
                            <span
                                class="flex items-center gap-1 text-xs text-red-500 mt-1.5"
                            >
                                <svg
                                    class="w-3.5 h-3.5 shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                                {errors.handphone}
                            </span>
                            <!-- Valid state -->
                        {:else if phoneValid}
                            <span
                                class="flex items-center gap-1 text-xs text-emerald-600 mt-1.5"
                            >
                                <svg
                                    class="w-3.5 h-3.5 shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                                Nomor valid
                            </span>
                        {/if}
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
                        >Alasan Kunjungan</label
                    >
                    <div class="flex flex-col gap-3">
                        <select
                            class="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all text-sm"
                            bind:value={form.reason_type}
                            on:change={() => {
                                form.chief_complaint_code = "";
                                form.chief_complaint_display = "";
                            }}
                        >
                            <option value="finding"
                                >Finding (Clinical Finding)</option
                            >
                            <option value="procedure">Procedure</option>
                            <option value="situation">Situation</option>
                            <option value="event">Event</option>
                        </select>
                        <div
                            class="[&>div.form-group]:mb-0 [&_input]:w-full [&_input]:rounded-lg [&_input]:border-slate-200 [&_input]:bg-slate-50 [&_input]:focus:ring-primary [&_input]:focus:border-primary"
                        >
                            <SearchableSelect
                                placeholder="Cari keluhan (SNOMED)..."
                                searchFn={searchComplaint}
                                bind:value={form.chief_complaint_code}
                                on:select={(e) => {
                                    form.chief_complaint_display =
                                        e.detail.label;
                                }}
                            />
                        </div>
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
                                on:select={(e) =>
                                    onDiseaseSelected(i, e.detail)}
                            />
                        </div>
                        <button
                            type="button"
                            class="w-full md:w-auto h-11 px-4 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors shrink-0 flex items-center justify-center gap-2"
                            on:click={() => removeDiseaseHistory(i)}
                        >
                            <span class="material-symbols-outlined text-[18px]"
                                >delete</span
                            >
                            <span class="md:hidden text-sm font-semibold"
                                >Hapus</span
                            >
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
                        <div
                            class="flex-1 w-full min-w-0 [&>div.form-group]:mb-0 [&_input]:w-full [&_input]:h-11 [&_input]:rounded-lg [&_input]:border-slate-200 [&_input]:bg-white [&_input]:focus:ring-primary [&_input]:focus:border-primary [&_input]:text-sm"
                        >
                            <SearchableSelect
                                placeholder="Cari alergen/substansi..."
                                searchFn={searchAllergy}
                                bind:value={item.substance_code}
                                on:select={(e) =>
                                    onAllergySelected(i, e.detail)}
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
                            <span class="material-symbols-outlined text-[18px]"
                                >delete</span
                            >
                            <span class="md:hidden text-sm font-semibold"
                                >Hapus</span
                            >
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
                        class="flex flex-col gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100"
                    >
                        {#if item.product_name}
                            <div class="flex items-center gap-2 text-sm">
                                <span
                                    class="material-symbols-outlined text-primary text-[16px]"
                                    >check_circle</span
                                >
                                <span class="font-medium text-slate-800"
                                    >{item.product_name}</span
                                >
                                {#if item.dosage_form}
                                    <span class="text-slate-400"
                                        >— {item.dosage_form}</span
                                    >
                                {/if}
                                <span class="text-xs text-slate-400 ml-auto"
                                    >KFA: {item.kfa_code}</span
                                >
                                <button
                                    type="button"
                                    class="text-xs text-slate-400 hover:text-red-500 transition-colors"
                                    on:click={() => {
                                        item.product_name = "";
                                        item.kfa_code = "";
                                        item.dosage_form = "";
                                        item.code = "";
                                        item.display = "";
                                        medications = medications;
                                    }}>✕</button
                                >
                            </div>
                        {:else}
                            <div class="flex flex-col gap-3">
                                <div
                                    class="flex p-1 bg-slate-100 rounded-lg w-fit"
                                >
                                    <button
                                        type="button"
                                        class="px-3 py-1 text-[10px] font-bold rounded-md transition-all {medicationMerkType ===
                                        'known'
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-slate-500'}"
                                        on:click={() =>
                                            (medicationMerkType = "known")}
                                        >MERK KNOWN</button
                                    >
                                    <button
                                        type="button"
                                        class="px-3 py-1 text-[10px] font-bold rounded-md transition-all {medicationMerkType ===
                                        'unknown'
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-slate-500'}"
                                        on:click={() =>
                                            (medicationMerkType = "unknown")}
                                        >MERK UNKNOWN</button
                                    >
                                </div>
                                <div class="flex flex-col sm:flex-row gap-2">
                                    <input
                                        class="flex-1 h-11 rounded-lg border-slate-200 bg-white focus:ring-primary focus:border-primary text-sm"
                                        placeholder="Ketik nama obat..."
                                        bind:value={medicationSearchTerm}
                                        on:keydown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                triggerMedicationSearch(i);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        class="h-11 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50"
                                        disabled={medicationSearchLoading}
                                        on:click={() =>
                                            triggerMedicationSearch(i)}
                                    >
                                        {#if medicationSearchLoading && medicationSearchIndex === i}
                                            <span
                                                class="material-symbols-outlined text-sm animate-spin"
                                                style="animation: spin 1s linear infinite;"
                                                >refresh</span
                                            >
                                        {:else}
                                            <span
                                                class="material-symbols-outlined text-sm"
                                                >search</span
                                            >
                                        {/if}
                                        Cari KFA
                                    </button>
                                </div>
                            </div>
                            {#if medicationSearchIndex === i && medicationSearchResults.length > 0}
                                <div
                                    class="bg-white border border-slate-200 rounded-lg max-h-48 overflow-y-auto shadow-sm"
                                >
                                    {#each medicationSearchResults as result}
                                        <button
                                            type="button"
                                            class="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
                                            on:click={() =>
                                                selectMedicationResult(
                                                    i,
                                                    result,
                                                )}
                                        >
                                            <div
                                                class="text-sm font-medium text-slate-800"
                                            >
                                                {result.product_name}
                                            </div>
                                            <div class="text-xs text-slate-400">
                                                {result.dosage_form
                                                    ? result.dosage_form + " — "
                                                    : ""}KFA: {result.kfa_code}
                                            </div>
                                        </button>
                                    {/each}
                                </div>
                            {/if}
                            {#if medicationSearchIndex === i && !medicationSearchLoading && medicationSearchResults.length === 0 && medicationSearchTerm.length >= 2}
                                <p
                                    class="text-xs text-slate-400 text-center py-2"
                                >
                                    Tidak ditemukan hasil untuk "{medicationSearchTerm}"
                                </p>
                            {/if}
                        {/if}
                        <div class="flex flex-row gap-3 items-center">
                            <div class="w-full md:w-40 shrink-0">
                                <input
                                    class="w-full h-11 rounded-lg border-slate-200 bg-white focus:ring-primary focus:border-primary text-sm"
                                    bind:value={item.dosage}
                                    placeholder="Dosis"
                                />
                            </div>
                            <div class="flex-1">
                                <input
                                    class="w-full h-11 rounded-lg border-slate-200 bg-white focus:ring-primary focus:border-primary text-sm"
                                    bind:value={item.note}
                                    placeholder="Catatan (opsional)"
                                />
                            </div>
                            <button
                                type="button"
                                class="w-auto h-11 px-4 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors shrink-0 flex items-center justify-center gap-2"
                                on:click={() => removeMedication(i)}
                            >
                                <span
                                    class="material-symbols-outlined text-[18px]"
                                    >delete</span
                                >
                            </button>
                        </div>
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
