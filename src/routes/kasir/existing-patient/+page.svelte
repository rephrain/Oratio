<script>
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import SearchableSelect from "$lib/components/Forms/SearchableSelect.svelte";
	import { addToast } from "$lib/stores/toast.js";
	import { formatDate, getWhatsAppUrl } from "$lib/utils/formatters.js";

	let loading = false;
	let doctors = [];
	let selectedPatient = null;

	// Form state
	let doctorId = "";
	let reasonType = "finding";
	let chiefComplaintCode = "";
	let chiefComplaintDisplay = "";
	let patientMedicalBackground = null;
	let loadingMedical = false;

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

	async function loadDoctors() {
		const res = await fetch(`/api/doctors`);
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
			<h2 class="text-3xl font-black text-slate-900 tracking-tight">
				Existing Patient Appointment
			</h2>
			<p class="text-slate-500 mt-1">
				Cari pasien lama dan daftarkan ke antrean poli.
			</p>
		</div>
		<a
			href="/kasir"
			class="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
			>← Kembali</a
		>
	</div>

	<!-- Search Section -->
	<section class="relative">
		<div class="flex flex-col gap-2 mb-4">
			<span class="block text-sm font-semibold text-slate-700 px-1"
				>Cari Pasien</span
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
		<form
			on:submit|preventDefault={handleSubmit}
			class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-100"
		>
			<!-- Patient Summary Card -->
			<div class="lg:col-span-1 space-y-6">
				<h3
					class="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1"
				>
					<span class="material-symbols-outlined text-sm">badge</span>
					Patient Information
				</h3>
				<div
					class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-8"
				>
					<!-- Patient Header -->
					<div
						class="flex flex-col items-center text-center pb-6 border-b border-slate-100"
					>
						<div class="relative mb-4">
							<div
								class="w-20 h-20 rounded-full ring-4 ring-white shadow-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center transition-transform hover:scale-105 duration-300"
							>
								<span
									class="text-3xl font-black text-blue-600 drop-shadow-sm"
									>{selectedPatient.nama_lengkap
										.substring(0, 2)
										.toUpperCase()}</span
								>
							</div>
						</div>
						<h3
							class="text-lg font-bold text-slate-800 leading-tight"
						>
							{selectedPatient.nama_lengkap}
						</h3>
						<p
							class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest"
						>
							MR ID: {selectedPatient.id || "-"}
						</p>
					</div>

					<!-- Identification Section -->
					<section>
						<h4
							class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"
						>
							<span class="material-symbols-outlined text-sm"
								>id_card</span
							>
							Identification
						</h4>
						<div class="space-y-3">
							<div
								class="flex justify-between items-center group"
							>
								<span class="text-[11px] text-slate-500"
									>NIK</span
								>
								<span
									class="text-[11px] font-bold text-slate-800"
									>{selectedPatient.nik || "-"}</span
								>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-[11px] text-slate-500"
									>DOB / Age</span
								>
								<span
									class="text-[11px] font-bold text-slate-800"
									>{formatDate(selectedPatient.birth_date) ||
										"-"} ({calculateAge(
										selectedPatient.birth_date,
									)}y)</span
								>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-[11px] text-slate-500"
									>Gender</span
								>
								<div class="flex items-center gap-1">
									{#if selectedPatient.gender === "Male" || selectedPatient.gender === "L" || selectedPatient.gender === "male"}
										<span
											class="material-symbols-outlined text-[14px] text-blue-500"
											>male</span
										>
									{:else if selectedPatient.gender === "Female" || selectedPatient.gender === "P" || selectedPatient.gender === "female"}
										<span
											class="material-symbols-outlined text-[14px] text-pink-500"
											>female</span
										>
									{/if}
									<span
										class="text-[11px] font-bold text-slate-800"
										>{selectedPatient.gender === "Male" ||
										selectedPatient.gender === "L" ||
										selectedPatient.gender === "male"
											? "Male"
											: selectedPatient.gender ===
														"Female" ||
												  selectedPatient.gender ===
														"P" ||
												  selectedPatient.gender ===
														"female"
												? "Female"
												: selectedPatient.gender ||
													"-"}</span
									>
								</div>
							</div>
							<div class="flex justify-between items-start">
								<span class="text-[11px] text-slate-500"
									>Address</span
								>
								<span
									class="text-[11px] font-bold text-slate-800 text-right w-40 leading-relaxed"
									>{selectedPatient.address || "-"}</span
								>
							</div>
							<div class="flex justify-between items-center">
								<span class="text-[11px] text-slate-500"
									>Contact</span
								>
								<div class="text-right">
									{#if selectedPatient.email}
										<a
											href="mailto:{selectedPatient.email}"
											class="text-[11px] font-bold text-primary hover:underline flex items-center justify-end gap-1"
										>
											<span class="material-symbols-outlined text-[14px]">mail</span>
											{selectedPatient.email}
										</a>
									{/if}
									{#if selectedPatient.handphone}
										<a
											href={getWhatsAppUrl(selectedPatient.handphone)}
											target="_blank"
											class="text-[11px] font-bold text-primary hover:underline flex items-center justify-end gap-1"
										>
											<span class="material-symbols-outlined text-[14px]">chat</span>
											{selectedPatient.handphone}
										</a>
									{:else}
										<span class="text-[11px] font-bold text-slate-800">-</span>
									{/if}
								</div>
							</div>
						</div>
					</section>

					<!-- Medical Background -->
					<section>
						<h4
							class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"
						>
							<span class="material-symbols-outlined text-sm"
								>medical_services</span
							>
							Medical Background
						</h4>
						<div class="grid grid-cols-2 gap-3 mb-4">
							<!-- Blood Type -->
							<div
								class="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between"
							>
								<div class="flex flex-col">
									<span
										class="text-[10px] text-blue-600 uppercase font-bold"
									>
										Blood Type
									</span>
									<div class="flex items-baseline gap-1">
										<span
											class="text-lg font-black text-blue-900"
										>
											{selectedPatient.blood_type || "-"}
										</span>
										<span
											class="text-sm font-bold text-blue-700"
										>
											{selectedPatient.rhesus === "+"
												? "+"
												: selectedPatient.rhesus === "-"
													? "-"
													: ""}
										</span>
									</div>
								</div>
								<span
									class="material-symbols-outlined text-blue-400 shrink-0"
								>
									bloodtype
								</span>
							</div>

							<!-- BP Placeholder or Latest -->
							<div
								class="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between"
							>
								<div class="flex flex-col flex-1">
									<span
										class="text-[10px] text-blue-600 uppercase font-bold"
									>
										BP
									</span>
									<div class="flex items-baseline gap-1">
										<span
											class="text-md font-black text-blue-900"
										>
											{selectedPatient.tekanan_darah ||
												"-"}
										</span>
										<span
											class="text-[9px] font-bold text-blue-700"
										>
											mmHg
										</span>
									</div>
								</div>
								<span
									class="material-symbols-outlined text-blue-400 shrink-0"
								>
									vital_signs
								</span>
							</div>
						</div>

						{#if loadingMedical}
							<div class="py-6 flex justify-center">
								<span
									class="material-symbols-outlined animate-spin text-primary"
									>progress_activity</span
								>
							</div>
						{:else if patientMedicalBackground}
							<!-- Allergy Alerts -->
							{#if patientMedicalBackground.allergies?.length > 0}
								{#each patientMedicalBackground.allergies as allergy}
									<div
										class="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-3 mb-4"
									>
										<span
											class="material-symbols-outlined text-red-500 text-xl"
											style="font-variation-settings: 'FILL' 1;"
											>warning</span
										>
										<div>
											<p
												class="text-[10px] font-black text-red-700 uppercase"
											>
												Allergy Alert
											</p>
											<p
												class="text-xs font-bold text-red-900 leading-tight"
											>
												{allergy.substance ||
													allergy.reaction_display ||
													"Unknown"}
												{#if allergy.reaction_display}- {allergy.reaction_display}{/if}
											</p>
										</div>
									</div>
								{/each}
							{/if}

							<div class="space-y-6">
								<div class="space-y-2">
									<p
										class="text-[10px] text-slate-400 font-bold uppercase mb-2"
									>
										Illness / History
									</p>
									{#if patientMedicalBackground.diseases?.length > 0}
										{#each patientMedicalBackground.diseases as disease}
											<div
												class="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100"
											>
												<div
													class="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"
												>
													<span
														class="material-symbols-outlined text-[16px]"
														>medical_information</span
													>
												</div>
												<div>
													<p
														class="text-xs font-bold text-slate-800 leading-tight mb-0.5"
													>
														{disease.disease ||
															"Condition"}
													</p>
													<p
														class="text-[9px] font-black text-orange-500 uppercase tracking-widest leading-none"
													>
														{disease.type}
													</p>
												</div>
											</div>
										{/each}
									{:else}
										<p
											class="text-[11px] font-medium text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-center"
										>
											None reported
										</p>
									{/if}
								</div>

								<div class="space-y-2">
									<p
										class="text-[10px] text-slate-400 font-bold uppercase mb-2"
									>
										Current Medication
									</p>
									{#if patientMedicalBackground.medications?.length > 0}
										{#each patientMedicalBackground.medications as med}
											<div
												class="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100"
											>
												<div
													class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"
												>
													<span
														class="material-symbols-outlined text-[16px]"
														>prescriptions</span
													>
												</div>
												<div>
													<p
														class="text-xs font-bold text-slate-800 leading-tight mb-0.5"
													>
														{med.product_name ||
															med.medication ||
															"Unknown"}
													</p>
													<p
														class="text-[10px] font-medium text-slate-600 leading-tight"
													>
														{med.dosage_form || ""}
														{med.dosage || ""}
													</p>
												</div>
											</div>
										{/each}
									{:else}
										<p
											class="text-[11px] font-medium text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 text-center"
										>
											None reported
										</p>
									{/if}
								</div>
							</div>
						{/if}
					</section>
				</div>
			</div>

			<!-- Appointment Details Form -->
			<div class="lg:col-span-2 space-y-6">
				<h3
					class="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1"
				>
					<span class="material-symbols-outlined text-sm"
						>event_note</span
					>
					Appointment Details
				</h3>

				<div
					class="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
				>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<!-- Doctor Selection -->
						<div>
							<label
								for="doctor"
								class="block text-sm font-semibold text-slate-700 mb-2"
								>Pilih Dokter <span class="text-red-500">*</span
								></label
							>
							<div class="relative">
								<select
									id="doctor"
									class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer"
									bind:value={doctorId}
									required
								>
									<option value="" disabled selected
										>-- Pilih Dokter --</option
									>
									{#each doctors as doc}
										<option value={doc.id}
											>drg. {doc.name} (Available)</option
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

						<!-- Alasan Kunjungan -->
						<div>
							<label
								class="block text-sm font-semibold text-slate-700 mb-2"
								>Alasan Kunjungan</label
							>
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
										<option value="finding"
											>Finding (Clinical Finding)</option
										>
										<option value="procedure"
											>Procedure</option
										>
										<option value="situation"
											>Situation</option
										>
										<option value="event">Event</option>
									</select>
									<span
										class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
										>expand_more</span
									>
								</div>

								<div
									class="[&>div.form-group]:mb-0 [&_input]:w-full [&_input]:py-3 [&_input]:rounded-xl [&_input]:border-slate-200 [&_input]:bg-slate-50 [&_input]:focus:ring-primary/10 [&_input]:focus:border-primary"
								>
									<SearchableSelect
										placeholder="Cari keluhan (SNOMED)..."
										searchFn={searchComplaint}
										bind:value={chiefComplaintCode}
										on:select={(e) => {
											chiefComplaintDisplay =
												e.detail.label;
										}}
									/>
								</div>
							</div>
						</div>
					</div>

					<div
						class="flex items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-xl"
					>
						<div
							class="size-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0"
						>
							<span class="material-symbols-outlined text-xl"
								>info</span
							>
						</div>
						<div class="text-sm text-primary-dark">
							<p class="font-bold">Informasi Antrean</p>
							<p class="opacity-80">
								Pasien akan didaftarkan ke poli otomatis. Queue
								number assigned by system.
							</p>
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
								<span
									class="material-symbols-outlined animate-spin"
									style="animation: spin 1s linear infinite;"
									>refresh</span
								>
								<span>Memproses...</span>
							{:else}
								<span class="material-symbols-outlined"
									>queue</span
								>
								<span>Daftarkan ke Antrian</span>
							{/if}
						</button>
					</div>
				</div>
			</div>
		</form>
	{/if}
</div>
