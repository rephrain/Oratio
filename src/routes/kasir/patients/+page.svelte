<script>
    import SearchableSelect from "$lib/components/Forms/SearchableSelect.svelte";
    import { addToast } from "$lib/stores/toast.js";
    import { formatDate, getWhatsAppUrl } from "$lib/utils/formatters.js";
    import { goto } from "$app/navigation";

    let loadingMedical = false;
    let generatingPdf = false;
    let selectedPatient = null;
    let patientMedicalBackground = null;

    function calculateAge(birthDate) {
        if (!birthDate) return "-";
        const today = new Date(
            new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
        );
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }

    async function searchPatient(term) {
        const res = await fetch(
            `/api/patients?search=${encodeURIComponent(term)}&limit=10`,
        );
        const data = await res.json();
        return (data.data || []).map((p) => ({
            value: p.id,
            label: p.nama_lengkap, // Changed to just string for UI aesthetics
            sublabel: `ID: ${p.id || "-"}`,
            patient: p,
        }));
    }

    async function handlePatientSelect(e) {
        selectedPatient = e.detail.patient || null;
        patientMedicalBackground = null;
        if (selectedPatient?.id) {
            loadingMedical = true;
            try {
                const res = await fetch(
                    `/api/patients/${selectedPatient.id}/medical-background`,
                );
                if (res.ok) {
                    patientMedicalBackground = await res.json();
                }
            } catch (e) {
                console.error(e);
            } finally {
                loadingMedical = false;
            }
        }
    }

    function clearSelection() {
        selectedPatient = null;
        patientMedicalBackground = null;
    }

    function navigateToEdit() {
        if (!selectedPatient?.id) return;
        addToast("Dialihkan ke halaman edit...", "success");
        // Navigation could go to existing edit route or a modal
        // goto(`/kasir/patients/edit?id=${selectedPatient.id}`);
    }

    // PDF Actions
    function viewPdf() {
        if (!selectedPatient?.id) return;
        window.open(`/api/patients/${selectedPatient.id}/pdf`, "_blank");
    }

    async function regeneratePdf() {
        if (!selectedPatient?.id) return;
        generatingPdf = true;
        try {
            const res = await fetch(`/api/patients/${selectedPatient.id}/pdf`, {
                method: "POST",
            });
            if (res.ok) {
                addToast("Profil PDF pasien berhasil diperbarui", "success");
            } else {
                const err = await res.json();
                addToast(err.error || "Gagal memperbarui PDF", "error");
            }
        } catch (err) {
            console.error("Regenerate PDF Error:", err);
            addToast("Terjadi kesalahan saat memproses regenerasi", "error");
        } finally {
            generatingPdf = false;
        }
    }
</script>

<svelte:head>
    <title>Data Pasien — Oratio Clinic</title>
</svelte:head>

<div class="h-full flex flex-col space-y-6">
    <!-- Page Header -->
    <div class="flex items-end justify-between px-2">
        <div>
            <h1 class="text-3xl font-black text-slate-900 tracking-tight mb-2">
                Data Pasien
            </h1>
            <p class="text-slate-500 font-medium">
                Lihat dan kelola direktori pasien dengan aman
            </p>
        </div>
    </div>

    <!-- Enhanced Search Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <label class="block text-sm font-semibold text-slate-700 mb-2 px-1"
            >Cari Pasien</label
        >
        <div
            class="group relative [&>div.form-group]:mb-0 [&_input]:w-full [&_input]:pl-12 [&_input]:pr-4 [&_input]:py-4 [&_input]:rounded-xl [&_input]:border-slate-200 [&_input]:focus:border-primary [&_input]:focus:ring-4 [&_input]:focus:ring-primary/10 [&_input]:transition-all [&_input]:bg-white [&_input]:text-lg [&_input]:placeholder:text-slate-400 [&_input]:shadow-sm"
        >
            <div
                class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10"
            >
                <span
                    class="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors"
                    >search</span
                >
            </div>
            <div class="relative w-full">
                <SearchableSelect
                    placeholder="Masukkan No. Rekam Medis, Patient ID, NIK, atau Nama Pasien..."
                    searchFn={searchPatient}
                    on:select={handlePatientSelect}
                    on:clear={clearSelection}
                />
            </div>
        </div>
    </div>

    {#if selectedPatient}
        <!-- Patient Overview and Action Button -->
        <div
            class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center md:items-start gap-8"
        >
            <div class="relative shrink-0">
                <div
                    class="w-24 h-24 rounded-full ring-4 ring-white shadow-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center transition-transform hover:scale-105 duration-300"
                >
                    <span
                        class="text-3xl font-black text-blue-600 drop-shadow-sm"
                        >{selectedPatient.nama_lengkap
                            .substring(0, 2)
                            .toUpperCase()}</span
                    >
                </div>
            </div>

            <div
                class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8"
            >
                <div class="col-span-full">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3
                                class="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1"
                            >
                                {selectedPatient.nama_lengkap}
                            </h3>
                            <p
                                class="text-xs font-bold text-slate-400 uppercase tracking-widest"
                            >
                                MR ID: {selectedPatient.id || "-"}
                            </p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button
                                on:click={viewPdf}
                                class="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all group border border-blue-100"
                                title="Lihat Profil PDF"
                            >
                                <span class="material-symbols-outlined text-[20px]"
                                    >picture_as_pdf</span
                                >
                                View PDF
                            </button>
                            <button
                                on:click={regeneratePdf}
                                class="flex items-center gap-2 bg-slate-50 text-slate-700 hover:bg-slate-200 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group border border-slate-200 disabled:opacity-50"
                                title="Regenerate Profil PDF"
                                disabled={generatingPdf}
                            >
                                <span
                                    class="material-symbols-outlined text-[20px] {generatingPdf
                                        ? 'animate-spin'
                                        : ''}"
                                >
                                    {generatingPdf ? "progress_activity" : "sync"}
                                </span>
                            </button>
                            <button
                                on:click={navigateToEdit}
                                class="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-primary hover:text-white hover:shadow-md px-5 py-2.5 rounded-xl text-sm font-bold transition-all group"
                            >
                                <span
                                    class="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform"
                                    >edit_document</span
                                >
                                Edit Data Pasien
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-1">
                    <span
                        class="text-[10px] uppercase font-bold text-slate-400 tracking-wider"
                        >DOB / Age</span
                    >
                    <span class="text-sm font-bold text-slate-800"
                        >{formatDate(selectedPatient.birth_date) || "-"} ({calculateAge(
                            selectedPatient.birth_date,
                        )}y)</span
                    >
                </div>

                <div class="flex flex-col gap-1">
                    <span
                        class="text-[10px] uppercase font-bold text-slate-400 tracking-wider"
                        >Gender</span
                    >
                    <div class="flex items-center gap-1.5">
                        {#if selectedPatient.gender === "Male" || selectedPatient.gender === "L" || selectedPatient.gender === "male"}
                            <span
                                class="material-symbols-outlined text-[16px] text-blue-500"
                                >male</span
                            >
                        {:else if selectedPatient.gender === "Female" || selectedPatient.gender === "P" || selectedPatient.gender === "female"}
                            <span
                                class="material-symbols-outlined text-[16px] text-pink-500"
                                >female</span
                            >
                        {/if}
                        <span class="text-sm font-bold text-slate-800"
                            >{selectedPatient.gender === "Male" ||
                            selectedPatient.gender === "L" ||
                            selectedPatient.gender === "male"
                                ? "Male"
                                : selectedPatient.gender === "Female" ||
                                    selectedPatient.gender === "P" ||
                                    selectedPatient.gender === "female"
                                  ? "Female"
                                  : selectedPatient.gender || "-"}</span
                        >
                    </div>
                </div>

                <div class="flex flex-col gap-1">
                    <span
                        class="text-[10px] uppercase font-bold text-slate-400 tracking-wider"
                        >Blood Type / BP</span
                    >
                    <span class="text-sm font-bold text-slate-800"
                        >{selectedPatient.blood_type ||
                            "-"}{selectedPatient.rhesus === "+"
                            ? "+"
                            : selectedPatient.rhesus === "-"
                              ? "-"
                              : ""} / {selectedPatient.tekanan_darah || "-"} mmHg</span
                    >
                </div>

                <div class="flex flex-col gap-1">
                    <span
                        class="text-[10px] uppercase font-bold text-slate-400 tracking-wider"
                        >Contact</span
                    >
                    {#if selectedPatient.handphone}
                        <a
                            href={getWhatsAppUrl(selectedPatient.handphone)}
                            target="_blank"
                            class="text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
                            ><span class="material-symbols-outlined text-[16px]"
                                >chat</span
                            >{selectedPatient.handphone}</a
                        >
                    {:else}
                        <span class="text-sm font-bold text-slate-800">-</span>
                    {/if}
                </div>

                <div class="flex flex-col gap-1 lg:col-span-2">
                    <span
                        class="text-[10px] uppercase font-bold text-slate-400 tracking-wider"
                        >Address</span
                    >
                    <span class="text-sm font-bold text-slate-800"
                        >{selectedPatient.address || "-"}</span
                    >
                </div>
            </div>
        </div>

        <!-- Medical Details Area -->
        <div class="space-y-6">
            <h2
                class="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2"
            >
                <span class="material-symbols-outlined"
                    >medical_information</span
                >
                Medical Background
            </h2>

            {#if loadingMedical}
                <div class="flex justify-center py-10">
                    <span
                        class="material-symbols-outlined animate-spin text-primary text-4xl"
                        >progress_activity</span
                    >
                </div>
            {:else if patientMedicalBackground}
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <!-- Disease History Table -->
                    <div class="flex flex-col">
                        <div class="flex items-center justify-between mb-3">
                            <h3
                                class="font-bold text-slate-800 text-sm flex items-center gap-2"
                            >
                                <span
                                    class="material-symbols-outlined text-orange-500 text-lg"
                                    >personal_injury</span
                                >
                                Disease History
                            </h3>
                            <span
                                class="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                >{patientMedicalBackground.diseases?.length ||
                                    0} Records</span
                            >
                        </div>
                        <div
                            class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[250px]"
                        >
                            <div
                                class="overflow-y-auto custom-scrollbar flex-1"
                            >
                                <table
                                    class="w-full text-left text-sm whitespace-nowrap"
                                >
                                    <thead
                                        class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10"
                                    >
                                        <tr>
                                            <th
                                                class="px-6 py-4 font-semibold text-slate-700"
                                                >Type</th
                                            >
                                            <th
                                                class="px-6 py-4 font-semibold text-slate-700"
                                                >Disease</th
                                            >
                                            <th
                                                class="px-6 py-4 font-semibold text-slate-700"
                                                >Description</th
                                            >
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        {#if patientMedicalBackground.diseases?.length > 0}
                                            {#each patientMedicalBackground.diseases as item}
                                                <tr
                                                    class="hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <td class="px-6 py-4">
                                                        <span
                                                            class="px-2.5 py-1 {item.type ===
                                                            'personal'
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : 'bg-purple-100 text-purple-700'} rounded-full text-[10px] font-bold uppercase tracking-wider"
                                                            >{item.type}</span
                                                        >
                                                    </td>
                                                    <td
                                                        class="px-6 py-4 font-bold text-slate-900 border-l border-slate-100"
                                                        >{item.disease ||
                                                            "-"}</td
                                                    >
                                                    <td
                                                        class="px-6 py-4 text-slate-500 text-xs max-w-[200px] truncate"
                                                        title={item.description}
                                                        >{item.description ||
                                                            "-"}</td
                                                    >
                                                </tr>
                                            {/each}
                                        {:else}
                                            <tr
                                                ><td
                                                    colspan="3"
                                                    class="px-6 py-8 text-center text-slate-400"
                                                    >Tidak ada data penyakit.</td
                                                ></tr
                                            >
                                        {/if}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Allergy Table -->
                    <div class="flex flex-col">
                        <div class="flex items-center justify-between mb-3">
                            <h3
                                class="font-bold text-slate-800 text-sm flex items-center gap-2"
                            >
                                <span
                                    class="material-symbols-outlined text-red-500 text-lg"
                                    >warning</span
                                >
                                Allergies
                            </h3>
                            <span
                                class="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                >{patientMedicalBackground.allergies?.length ||
                                    0} Records</span
                            >
                        </div>
                        <div
                            class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[250px]"
                        >
                            <div
                                class="overflow-y-auto custom-scrollbar flex-1"
                            >
                                <table
                                    class="w-full text-left text-sm whitespace-nowrap"
                                >
                                    <thead
                                        class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10"
                                    >
                                        <tr>
                                            <th
                                                class="px-6 py-4 font-semibold text-slate-700"
                                                >Substance</th
                                            >
                                            <th
                                                class="px-6 py-4 font-semibold text-slate-700"
                                                >Reaction</th
                                            >
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        {#if patientMedicalBackground.allergies?.length > 0}
                                            {#each patientMedicalBackground.allergies as item}
                                                <tr
                                                    class="hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <td
                                                        class="px-6 py-4 font-bold text-slate-900"
                                                        >{item.substance ||
                                                            "Unknown"}</td
                                                    >
                                                    <td
                                                        class="px-6 py-4 border-l border-slate-100"
                                                    >
                                                        {#if item.reaction_display}
                                                            <span
                                                                class="px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-semibold"
                                                                >{item.reaction_display}</span
                                                            >
                                                        {:else}
                                                            <span
                                                                class="text-slate-400 text-xs"
                                                                >-</span
                                                            >
                                                        {/if}
                                                    </td>
                                                </tr>
                                            {/each}
                                        {:else}
                                            <tr
                                                ><td
                                                    colspan="2"
                                                    class="px-6 py-8 text-center text-slate-400"
                                                    >Tidak ada riwayat alergi.</td
                                                ></tr
                                            >
                                        {/if}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Medication Table -->
                    <div class="flex flex-col xl:col-span-2">
                        <div class="flex items-center justify-between mb-3">
                            <h3
                                class="font-bold text-slate-800 text-sm flex items-center gap-2"
                            >
                                <span
                                    class="material-symbols-outlined text-emerald-500 text-lg"
                                    >prescriptions</span
                                >
                                Current Medication
                            </h3>
                            <span
                                class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                >{patientMedicalBackground.medications
                                    ?.length || 0} Records</span
                            >
                        </div>
                        <div
                            class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[200px]"
                        >
                            <div
                                class="overflow-y-auto custom-scrollbar flex-1"
                            >
                                <table
                                    class="w-full text-left text-sm whitespace-nowrap"
                                >
                                    <thead
                                        class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10"
                                    >
                                        <tr>
                                            <th
                                                class="px-6 py-4 font-semibold text-slate-700"
                                                >Medication Focus</th
                                            >
                                            <th
                                                class="px-6 py-4 font-semibold text-slate-700"
                                                >Form</th
                                            >
                                            <th
                                                class="px-6 py-4 font-semibold text-slate-700"
                                                >Dosage</th
                                            >
                                            <th
                                                class="px-6 py-4 font-semibold text-slate-700"
                                                >Notes</th
                                            >
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        {#if patientMedicalBackground.medications?.length > 0}
                                            {#each patientMedicalBackground.medications as item}
                                                <tr
                                                    class="hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <td
                                                        class="px-6 py-4 font-bold text-slate-900 border-r border-slate-100"
                                                        >{item.product_name ||
                                                            item.medication ||
                                                            "-"}</td
                                                    >
                                                    <td
                                                        class="px-6 py-4 text-slate-600 font-medium"
                                                        >{item.dosage_form ||
                                                            "-"}</td
                                                    >
                                                    <td
                                                        class="px-6 py-4 text-emerald-700 font-bold bg-emerald-50/30"
                                                        >{item.dosage ||
                                                            "-"}</td
                                                    >
                                                    <td
                                                        class="px-6 py-4 text-slate-500 text-xs max-w-[250px] truncate border-l border-slate-100"
                                                        title={item.note}
                                                        >{item.note || "-"}</td
                                                    >
                                                </tr>
                                            {/each}
                                        {:else}
                                            <tr
                                                ><td
                                                    colspan="4"
                                                    class="px-6 py-8 text-center text-slate-400"
                                                    >Tidak ada obat yang sedang
                                                    dikonsumsi.</td
                                                ></tr
                                            >
                                        {/if}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {:else}
        <!-- Initial Illustration or Message -->
        <div
            class="flex-1 flex flex-col items-center justify-center text-center py-20 px-4 bg-white/50 rounded-2xl border border-slate-200 border-dashed"
        >
            <div
                class="size-24 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-6"
            >
                <span class="material-symbols-outlined text-4xl"
                    >search_hands_free</span
                >
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">
                Cari Data Pasien
            </h3>
            <p class="text-sm text-slate-500 max-w-sm">
                Silahkan cari pasien menggunakan kolom pencarian di atas untuk
                melihat detail lengkap dan riwayat medis pasien.
            </p>
        </div>
    {/if}
</div>

<style>
    /* Add any local styles if necessary */
</style>
