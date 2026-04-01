<script>
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import SearchableSelect from "$lib/components/Forms/SearchableSelect.svelte";
	import { addToast } from "$lib/stores/toast.js";

	let loading = false;
	let doctors = [];
	let selectedPatient = null;
	
	// Form state
	let doctorId = "";
	let reasonType = "finding";
	let chiefComplaintCode = "";
	let chiefComplaintDisplay = "";

	async function loadDoctors() {
		const today = new Date().getDay();
		const res = await fetch(`/api/doctors?day=${today}`);
		const data = await res.json();
		doctors = data.doctors || [];
	}

	async function searchPatient(term) {
		const res = await fetch(
			`/api/patients?search=${encodeURIComponent(term)}&limit=10`,
		);
		const data = await res.json();
		return (data.data || []).map((p) => ({
			value: p.id,
			label: p.nama_lengkap, // Changed to just string for UI aesthetics
			sublabel: `NIK: ${p.nik || "-"} • ID: ${p.id}`,
			patient: p,
		}));
	}

	function handlePatientSelect(e) {
		selectedPatient = e.detail.patient || null;
	}

	function clearSelection() {
		selectedPatient = null;
		doctorId = "";
		reasonType = "finding";
		chiefComplaintCode = "";
		chiefComplaintDisplay = "";
	}

	async function handleSubmit() {
		if (!selectedPatient || !doctorId) {
			addToast("Pilih pasien dan dokter", "error");
			return;
		}

		loading = true;
		try {
			const res = await fetch("/api/encounters", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					patient_id: selectedPatient.id,
					doctor_id: doctorId,
					reason_type: reasonType || "finding",
					chief_complaint_code: chiefComplaintCode,
					chief_complaint_display: chiefComplaintDisplay,
				}),
			});

			if (!res.ok) {
				const err = await res.json();
				addToast(err.error || "Gagal membuat antrian", "error");
				return;
			}

			const data = await res.json();
			addToast(
				`${selectedPatient.nama_lengkap} ditambahkan ke antrian #${data.queue_number}`,
				"success",
			);
			goto("/kasir");
		} catch {
			addToast("Terjadi kesalahan", "error");
		} finally {
			loading = false;
		}
	}

	async function searchComplaint(term) {
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

	onMount(loadDoctors);
</script>

<svelte:head>
	<title>Pasien Lama — Oratio Clinic</title>
</svelte:head>

<div class="p-8 max-w-5xl mx-auto space-y-8">
    <div class="mb-8 flex justify-between items-end">
        <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">Existing Patient Appointment</h2>
            <p class="text-slate-500 mt-1">Cari pasien lama dan daftarkan ke antrean poli.</p>
        </div>
        <a href="/kasir" class="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">← Kembali</a>
    </div>

	<!-- Search Section -->
	<section class="relative">
		<div class="flex flex-col gap-2 mb-4">
			<span class="block text-sm font-semibold text-slate-700 px-1">Cari Pasien</span>
			<div class="group relative [&>div.form-group]:mb-0 [&_input]:w-full [&_input]:pl-12 [&_input]:pr-4 [&_input]:py-4 [&_input]:rounded-xl [&_input]:border-slate-200 [&_input]:focus:border-primary [&_input]:focus:ring-4 [&_input]:focus:ring-primary/10 [&_input]:transition-all [&_input]:bg-white [&_input]:text-lg [&_input]:placeholder:text-slate-400 [&_input]:shadow-sm">
				<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
					<span class="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
				</div>
                <div class="relative w-full">
				    <SearchableSelect
					    placeholder="Masukkan No. Rekam Medis, NIK, atau Nama Pasien..."
					    searchFn={searchPatient}
					    on:select={handlePatientSelect}
					    on:clear={clearSelection}
				    />
                </div>
			</div>
		</div>
	</section>

	{#if selectedPatient}
		<form on:submit|preventDefault={handleSubmit} class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-100">
			<!-- Patient Summary Card -->
			<div class="lg:col-span-1 space-y-6">
				<h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
					<span class="material-symbols-outlined text-sm">badge</span> 
					Patient Information
				</h3>
				<div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6">
					<div class="flex items-center gap-4 border-b border-slate-50 pb-4">
						<div class="size-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
							<span class="material-symbols-outlined text-primary text-3xl">{selectedPatient.gender === 'female' ? 'woman' : 'man'}</span>
						</div>
						<div class="overflow-hidden">
							<p class="text-lg font-bold truncate">{selectedPatient.nama_lengkap}</p>
							<span class="px-2 py-0.5 mt-1 inline-block rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">{selectedPatient.id}</span>
						</div>
					</div>

					<div class="space-y-4">
						<div>
							<p class="text-[10px] font-bold text-slate-400 uppercase">NIK / KTP</p>
							<p class="text-sm font-medium text-slate-700">{selectedPatient.nik || "Tidak ada NIK"}</p>
						</div>
						<div>
							<p class="text-[10px] font-bold text-slate-400 uppercase">Tanggal Lahir & Gender</p>
							<p class="text-sm font-medium text-slate-700">{selectedPatient.birth_date || "-"} ({selectedPatient.gender === 'female' ? 'Perempuan' : 'Laki-laki'})</p>
						</div>
						<div>
							<p class="text-[10px] font-bold text-slate-400 uppercase">Golongan Darah</p>
							<div class="flex gap-2 mt-1">
								<span class="px-2 py-1 bg-red-50 text-red-600 text-[10px] rounded-lg font-bold border border-red-100">{selectedPatient.blood_type || "?"}{selectedPatient.rhesus || ""}</span>
							</div>
						</div>
					</div>

					<button type="button" class="w-full py-3 mt-2 text-xs font-bold text-primary border border-primary/20 bg-primary/5 rounded-xl hover:bg-primary hover:text-white transition-all">
						Lihat Detail Rekam Medis
					</button>
				</div>
			</div>

			<!-- Appointment Details Form -->
			<div class="lg:col-span-2 space-y-6">
				<h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
					<span class="material-symbols-outlined text-sm">event_note</span> 
					Appointment Details
				</h3>
				
				<div class="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<!-- Doctor Selection -->
						<div>
							<label for="doctor" class="block text-sm font-semibold text-slate-700 mb-2">Pilih Dokter <span class="text-red-500">*</span></label>
							<div class="relative">
								<select 
									id="doctor"
									class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
									bind:value={doctorId}
									required
								>
									<option value="" disabled selected>-- Pilih Dokter --</option>
									{#each doctors as doc}
										<option value={doc.id}>drg. {doc.name} (Available)</option>
									{/each}
								</select>
								<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">stethoscope</span>
								<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
							</div>
							<div class="mt-2 flex items-center gap-1.5">
								<div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
								<p class="text-[11px] font-bold text-emerald-600 uppercase tracking-tight">
									{doctors.length} Doctors available for walk-in
								</p>
							</div>
						</div>

						<!-- Alasan Kunjungan -->
						<div>
							<label class="block text-sm font-semibold text-slate-700 mb-2">Alasan Kunjungan</label>
							<div class="flex flex-col gap-3">
								<div class="relative">
									<select 
										class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all text-sm appearance-none cursor-pointer"
										bind:value={reasonType}
										on:change={() => {
											chiefComplaintCode = "";
											chiefComplaintDisplay = "";
										}}
									>
										<option value="finding">Finding (Clinical Finding)</option>
										<option value="procedure">Procedure</option>
										<option value="situation">Situation</option>
										<option value="event">Event</option>
									</select>
									<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
								</div>
								
								<div class="[&>div.form-group]:mb-0 [&_input]:w-full [&_input]:py-3 [&_input]:rounded-xl [&_input]:border-slate-200 [&_input]:bg-slate-50 [&_input]:focus:ring-primary/10 [&_input]:focus:border-primary">
									<SearchableSelect
										placeholder="Cari keluhan (SNOMED)..."
										searchFn={searchComplaint}
										bind:value={chiefComplaintCode}
										on:select={(e) => {
											chiefComplaintDisplay = e.detail.label;
										}}
									/>
								</div>
							</div>
						</div>
					</div>

					<div class="flex items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-xl">
						<div class="size-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
							<span class="material-symbols-outlined text-xl">info</span>
						</div>
						<div class="text-sm text-primary-dark">
							<p class="font-bold">Informasi Antrean</p>
							<p class="opacity-80">Pasien akan didaftarkan ke poli otomatis. Queue number assigned by system.</p>
						</div>
					</div>

					<div class="flex items-center justify-end pt-4 gap-4">
						<button 
							type="button"
							class="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
							on:click={clearSelection}
							disabled={loading}
						>
							Batalkan
						</button>
						<button 
							type="submit"
							class="px-10 py-4 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={loading}
						>
							{#if loading}
								<span class="material-symbols-outlined animate-spin" style="animation: spin 1s linear infinite;">refresh</span>
								<span>Memproses...</span>
							{:else}
								<span class="material-symbols-outlined">queue</span>
								<span>Daftarkan ke Antrian</span>
							{/if}
						</button>
					</div>
				</div>
			</div>
		</form>
	{/if}
</div>
