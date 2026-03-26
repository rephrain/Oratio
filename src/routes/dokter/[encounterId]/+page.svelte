<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import SearchableSelect from "$lib/components/Forms/SearchableSelect.svelte";
	import Modal from "$lib/components/UI/Modal.svelte";
	import {
		PERMANENT_TEETH,
		DECIDUOUS_TEETH,
		TOOTH_SURFACES,
		ALLERGY_REACTIONS,
	} from "$lib/utils/constants.js";
	import { formatDate } from "$lib/utils/formatters.js";
	import { addToast } from "$lib/stores/toast.js";

	export let data;

	const encounterId = $page.params.encounterId;
	let encounter = null;
	let loading = true;
	let saving = false;

	// SOAP form
	let formMode = "SOAP";
	let subjective = "";
	let objective = "";
	let assessment = "";
	let plan = "";
	let tekananDarah = "";

	// Prescriptions
	let prescriptions = [];
	// Diagnoses
	let diagnoses = [];
	// Procedures
	let procedures = [];
	// Odontogram
	let odontogram = {
		dentition: "permanent",
		occlusi: "",
		torus: "",
		palatum: "",
		diastema: false,
		anomali: "",
		details: [],
	};
	// Encounter items
	let encounterItems = [];

	// Patient context
	let patientInfo = null;
	let patientHistory = [];
	let showSidebar = true;

	// Tooth detail modal
	let showToothModal = false;
	let selectedTooth = null;
	let toothDetail = {
		tooth_number: "",
		surface: "",
		keadaan: "",
		restorasi: "",
		diagnosis_code: "",
		diagnosis_display: "",
		procedure_code: "",
		procedure_display: "",
	};

	// Shift-click multi-select
	let selectedTeeth = new Set();

	async function loadEncounter() {
		try {
			const res = await fetch(`/api/encounters/${encounterId}`);
			const data = await res.json();
			encounter = data;

			formMode = data.encounter?.form_mode || "SOAP";
			subjective = data.encounter?.subjective || "";
			objective = data.encounter?.objective || "";
			assessment = data.encounter?.assessment || "";
			plan = data.encounter?.plan || "";
			tekananDarah = data.encounter?.tekanan_darah || "";
			prescriptions = data.prescriptions || [];
			diagnoses = data.diagnoses || [];
			procedures = data.procedures || [];

			if (data.odontograms?.length > 0) {
				odontogram = {
					...data.odontograms[0],
					details: data.odontogramDetails || [],
				};
			}

			encounterItems = data.items || [];

			// Load patient context
			if (data.encounter?.patient_id) {
				loadPatientContext(data.encounter.patient_id);
			}

			// Auto-transition: Planned/Arrived → In Progress
			if (["Planned", "Arrived"].includes(data.encounter?.status)) {
				await updateStatus("In Progress");
			}
		} catch (err) {
			console.error(err);
			addToast("Gagal memuat encounter", "error");
		} finally {
			loading = false;
		}
	}

	async function loadPatientContext(patientId) {
		try {
			const res = await fetch(
				`/api/encounters?patient_id=${patientId}&limit=20`,
			);
			const data = await res.json();
			patientHistory = (data.data || []).filter(
				(e) => e.encounter?.id !== encounterId,
			);
		} catch {}
	}

	async function updateStatus(status) {
		await fetch(`/api/encounters/${encounterId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status }),
		});
	}

	async function searchMedication(term) {
		const res = await fetch(`/api/kfa?query=${encodeURIComponent(term)}`);
		const data = await res.json();
		return (data.results || []).map((r) => ({
			value: r.code,
			label: r.display,
		}));
	}

	// Prescription management
	function addPrescription() {
		prescriptions = [
			...prescriptions,
			{
				kfa_code: "",
				product_name: "",
				dosage: "",
				quantity: 1,
				notes: "",
			},
		];
	}
	function removePrescription(i) {
		prescriptions = prescriptions.filter((_, idx) => idx !== i);
	}

	// Diagnosis management
	function addDiagnosis() {
		diagnoses = [
			...diagnoses,
			{ code: "", display: "", is_primary: false },
		];
	}
	function removeDiagnosis(i) {
		diagnoses = diagnoses.filter((_, idx) => idx !== i);
	}

	// Procedure management
	function addProcedure() {
		procedures = [
			...procedures,
			{ code: "", display: "", tooth_number: "", surface: "" },
		];
	}
	function removeProcedure(i) {
		procedures = procedures.filter((_, idx) => idx !== i);
	}

	// Tooth click
	function handleToothClick(toothNum, event) {
		if (event.shiftKey) {
			if (selectedTeeth.has(toothNum)) {
				selectedTeeth.delete(toothNum);
			} else {
				selectedTeeth.add(toothNum);
			}
			selectedTeeth = new Set(selectedTeeth);
		} else {
			selectedTooth = toothNum;
			const existing = odontogram.details.find(
				(d) => d.tooth_number === toothNum,
			);
			toothDetail = existing
				? { ...existing }
				: {
						tooth_number: toothNum,
						surface: "",
						keadaan: "",
						restorasi: "",
						diagnosis_code: "",
						diagnosis_display: "",
						procedure_code: "",
						procedure_display: "",
					};
			showToothModal = true;
		}
	}

	function saveToothDetail() {
		const idx = odontogram.details.findIndex(
			(d) => d.tooth_number === toothDetail.tooth_number,
		);
		if (idx >= 0) {
			odontogram.details[idx] = { ...toothDetail };
		} else {
			odontogram.details = [...odontogram.details, { ...toothDetail }];
		}
		odontogram = { ...odontogram };
		showToothModal = false;
	}

	function hasCondition(toothNum) {
		return odontogram.details.some((d) => d.tooth_number === toothNum);
	}

	// Render 5-surface tooth SVG (cross/diamond pattern per PDGI standard)
	function renderToothSVG(hasConditionFlag) {
		const fillColor = hasConditionFlag ? 'var(--primary)' : 'white';
		const strokeColor = hasConditionFlag ? 'var(--primary-hover)' : 'var(--gray-400)';
		return `<svg class="tooth-svg" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
			<polygon points="12,12 24,12 18,2" fill="${hasConditionFlag ? 'var(--accent-light)' : 'white'}" stroke="${strokeColor}" stroke-width="1"/>
			<polygon points="12,24 24,24 18,34" fill="white" stroke="${strokeColor}" stroke-width="1"/>
			<polygon points="2,18 12,12 12,24" fill="white" stroke="${strokeColor}" stroke-width="1"/>
			<polygon points="34,18 24,12 24,24" fill="white" stroke="${strokeColor}" stroke-width="1"/>
			<polygon points="12,12 24,12 24,24 12,24" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>
		</svg>`;
	}

	// Save form
	async function saveForm(discharge = false) {
		saving = true;
		try {
			const body = {
				form_mode: formMode,
				subjective,
				objective,
				assessment,
				plan,
				tekanan_darah: tekananDarah,
				prescriptions,
				diagnoses,
				procedures,
				encounter_items: encounterItems,
			};

			if (formMode === "SOAP-WHO") {
				body.odontogram = odontogram;
			}

			if (discharge) {
				body.status = "Discharged";
			}

			const res = await fetch(`/api/encounters/${encounterId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (res.ok) {
				addToast(
					discharge
						? "Encounter selesai & discharged"
						: "Data disimpan",
					"success",
				);
				if (discharge) goto("/dokter");
			} else {
				const err = await res.json();
				addToast(err.error || "Gagal menyimpan", "error");
			}
		} catch {
			addToast("Terjadi kesalahan", "error");
		} finally {
			saving = false;
		}
	}

	// Close without submit → On Hold
	async function putOnHold() {
		await updateStatus("On Hold");
		addToast("Encounter ditahan (On Hold)", "warning");
		goto("/dokter");
	}

	onMount(loadEncounter);
</script>

<svelte:head>
	<title>Encounter {encounterId} — Oratio Dental</title>
</svelte:head>

<div>
	{#if loading}
		<div style="text-align: center; padding: var(--space-16);">
			<div class="spinner spinner-lg" style="margin: 0 auto;"></div>
			<p class="text-muted mt-4">Memuat encounter...</p>
		</div>
	{:else if encounter}
		<div style="display: flex; gap: var(--space-6);">
			<!-- Main Form -->
			<div style="flex: 1; min-width: 0;">
				<div class="flex items-center justify-between mb-6">
					<div>
						<h1 class="page-title" style="margin: 0;">
							Encounter {encounterId}
						</h1>
						<p class="text-sm text-muted">
							Pasien: {encounter.patient_name} · Status: {encounter
								.encounter?.status}
						</p>
					</div>
					<div class="flex gap-2">
						<button
							class="btn btn-secondary btn-sm"
							on:click={() => (showSidebar = !showSidebar)}
						>
							{showSidebar ? "◀ Tutup" : "▶ Konteks"} Panel
						</button>
					</div>
				</div>

				<!-- Form Mode Toggle -->
				<div
					class="flex gap-1 mb-6"
					style="background: var(--gray-100); border-radius: var(--radius-md); padding: 2px; width: fit-content;"
				>
					<button
						class="tab"
						class:active={formMode === "SOAP"}
						on:click={() => (formMode = "SOAP")}>SOAP</button
					>
					<button
						class="tab"
						class:active={formMode === "SOAP-WHO"}
						on:click={() => (formMode = "SOAP-WHO")}
						>SOAP-WHO (Odontogram)</button
					>
				</div>

				<!-- SOAP Fields -->
				<div class="card mb-6">
					<h3 class="card-title mb-4">📝 SOAP Notes</h3>
					<div class="form-group mb-4">
						<label class="form-label">Subjective</label>
						<textarea
							class="form-textarea"
							bind:value={subjective}
							rows="3"
							placeholder="Keluhan pasien..."
						></textarea>
					</div>
					<div class="form-group mb-4">
						<label class="form-label">Objective</label>
						<textarea
							class="form-textarea"
							bind:value={objective}
							rows="3"
							placeholder="Temuan pemeriksaan..."
						></textarea>
					</div>
					<div class="form-group mb-4">
						<label class="form-label">Tekanan Darah</label>
						<input
							class="form-input"
							style="max-width: 200px;"
							bind:value={tekananDarah}
							placeholder="120/80"
						/>
					</div>
					<div class="form-group mb-4">
						<label class="form-label">Assessment</label>
						<textarea
							class="form-textarea"
							bind:value={assessment}
							rows="3"
							placeholder="Penilaian/diagnosis..."
						></textarea>
					</div>
					<div class="form-group">
						<label class="form-label">Plan</label>
						<textarea
							class="form-textarea"
							bind:value={plan}
							rows="3"
							placeholder="Rencana tindakan/pengobatan..."
						></textarea>
					</div>
				</div>

				<!-- Odontogram (only for SOAP-WHO) -->
				{#if formMode === "SOAP-WHO"}
					<div class="card mb-6">
						<h3 class="card-title mb-4">
							🦷 Odontogram (PDGI Standard)
						</h3>

						<!-- Upper Arch -->
						<div class="odontogram-container">
							<p class="text-sm font-semibold text-muted">
								RAHANG ATAS (Maxilla)
							</p>

							<div class="odontogram-arch">
								{#each PERMANENT_TEETH.upper_right as tooth}
									<button
										type="button"
										class="tooth-wrapper"
										class:selected={selectedTeeth.has(
											tooth,
										)}
										on:click={(e) =>
											handleToothClick(tooth, e)}
									>
										<span class="tooth-number">{tooth}</span
										>
										{#key tooth}
											{@html renderToothSVG(
												hasCondition(tooth),
											)}
										{/key}
									</button>
								{/each}

								<div class="divider"></div>

								{#each PERMANENT_TEETH.upper_left as tooth}
									<button
										type="button"
										class="tooth-wrapper"
										class:selected={selectedTeeth.has(
											tooth,
										)}
										on:click={(e) =>
											handleToothClick(tooth, e)}
									>
										<span class="tooth-number">{tooth}</span
										>
										{#key tooth}
											{@html renderToothSVG(
												hasCondition(tooth),
											)}
										{/key}
									</button>
								{/each}
							</div>

							<div class="horizontal-divider"></div>

							<!-- Lower Arch -->
							<div class="odontogram-arch lower">
								{#each PERMANENT_TEETH.lower_right as tooth}
									<button
										type="button"
										class="tooth-wrapper"
										class:selected={selectedTeeth.has(
											tooth,
										)}
										on:click={(e) =>
											handleToothClick(tooth, e)}
									>
										{@html renderToothSVG(
											hasCondition(tooth),
										)}
										<span class="tooth-number">{tooth}</span
										>
									</button>
								{/each}

								<div class="divider"></div>

								{#each PERMANENT_TEETH.lower_left as tooth}
									<button
										type="button"
										class="tooth-wrapper"
										class:selected={selectedTeeth.has(
											tooth,
										)}
										on:click={(e) =>
											handleToothClick(tooth, e)}
									>
										{@html renderToothSVG(
											hasCondition(tooth),
										)}
										<span class="tooth-number">{tooth}</span
										>
									</button>
								{/each}
							</div>

							<p class="text-sm font-semibold text-muted">
								RAHANG BAWAH (Mandible)
							</p>
						</div>

						<!-- Odontogram Metadata -->
						<div class="form-row mt-4">
							<div class="form-group">
								<label class="form-label">Occlusi</label>
								<input
									class="form-input"
									bind:value={odontogram.occlusi}
								/>
							</div>
							<div class="form-group">
								<label class="form-label">Torus</label>
								<input
									class="form-input"
									bind:value={odontogram.torus}
								/>
							</div>
							<div class="form-group">
								<label class="form-label">Palatum</label>
								<input
									class="form-input"
									bind:value={odontogram.palatum}
								/>
							</div>
						</div>
						<div class="form-row mt-4">
							<div class="form-group">
								<label class="form-label">
									<input
										type="checkbox"
										bind:checked={odontogram.diastema}
									/> Diastema
								</label>
							</div>
							<div class="form-group">
								<label class="form-label">Anomali</label>
								<input
									class="form-input"
									bind:value={odontogram.anomali}
								/>
							</div>
						</div>

						<!-- Conditions Table -->
						{#if odontogram.details.length > 0}
							<h4 class="font-semibold mt-6 mb-2">
								Detail Kondisi Gigi
							</h4>
							<div class="table-container">
								<table>
									<thead>
										<tr>
											<th>Gigi</th>
											<th>Permukaan</th>
											<th>Keadaan</th>
											<th>Restorasi</th>
											<th>Diagnosa</th>
											<th>Tindakan</th>
										</tr>
									</thead>
									<tbody>
										{#each odontogram.details as d}
											<tr
												on:click={() => {
													toothDetail = { ...d };
													selectedTooth =
														d.tooth_number;
													showToothModal = true;
												}}
												style="cursor: pointer;"
											>
												<td class="font-semibold"
													>{d.tooth_number}</td
												>
												<td>{d.surface || "-"}</td>
												<td>{d.keadaan || "-"}</td>
												<td>{d.restorasi || "-"}</td>
												<td
													>{d.diagnosis_display ||
														"-"}</td
												>
												<td
													>{d.procedure_display ||
														"-"}</td
												>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Diagnoses -->
				<div class="card mb-6">
					<div class="card-header">
						<h3 class="card-title">🏥 Diagnosis (ICD-10)</h3>
						<button
							type="button"
							class="btn btn-secondary btn-sm"
							on:click={addDiagnosis}>+ Tambah</button
						>
					</div>
					{#each diagnoses as d, i}
						<div class="flex gap-3 items-end mt-2">
							<div class="form-group" style="flex: 0 0 120px;">
								<input
									class="form-input"
									bind:value={d.code}
									placeholder="Kode ICD-10"
								/>
							</div>
							<div class="form-group" style="flex: 1;">
								<input
									class="form-input"
									bind:value={d.display}
									placeholder="Deskripsi diagnosis"
								/>
							</div>
							<label class="flex items-center gap-1 text-sm">
								<input
									type="checkbox"
									bind:checked={d.is_primary}
								/> Primer
							</label>
							<button
								type="button"
								class="btn btn-danger btn-sm btn-icon"
								on:click={() => removeDiagnosis(i)}>✕</button
							>
						</div>
					{/each}
				</div>

				<!-- Procedures -->
				<div class="card mb-6">
					<div class="card-header">
						<h3 class="card-title">⚕️ Tindakan (ICD-9-CM)</h3>
						<button
							type="button"
							class="btn btn-secondary btn-sm"
							on:click={addProcedure}>+ Tambah</button
						>
					</div>
					{#each procedures as p, i}
						<div class="flex gap-3 items-end mt-2">
							<div class="form-group" style="flex: 0 0 120px;">
								<input
									class="form-input"
									bind:value={p.code}
									placeholder="Kode"
								/>
							</div>
							<div class="form-group" style="flex: 1;">
								<input
									class="form-input"
									bind:value={p.display}
									placeholder="Deskripsi tindakan"
								/>
							</div>
							<div class="form-group" style="flex: 0 0 80px;">
								<input
									class="form-input"
									bind:value={p.tooth_number}
									placeholder="Gigi"
								/>
							</div>
							<button
								type="button"
								class="btn btn-danger btn-sm btn-icon"
								on:click={() => removeProcedure(i)}>✕</button
							>
						</div>
					{/each}
				</div>

				<!-- Prescriptions -->
				<div class="card mb-6">
					<div class="card-header">
						<h3 class="card-title">💊 Resep Obat</h3>
						<button
							type="button"
							class="btn btn-secondary btn-sm"
							on:click={addPrescription}>+ Tambah</button
						>
					</div>
					{#each prescriptions as rx, i}
						<div class="flex gap-3 items-end mt-2">
							<div class="form-group" style="flex: 1;">
								<input
									class="form-input"
									bind:value={rx.product_name}
									placeholder="Nama obat"
								/>
							</div>
							<div class="form-group" style="flex: 0 0 120px;">
								<input
									class="form-input"
									bind:value={rx.dosage}
									placeholder="Dosis"
								/>
							</div>
							<div class="form-group" style="flex: 0 0 80px;">
								<input
									type="number"
									class="form-input"
									bind:value={rx.quantity}
									placeholder="Qty"
									min="1"
								/>
							</div>
							<button
								type="button"
								class="btn btn-danger btn-sm btn-icon"
								on:click={() => removePrescription(i)}>✕</button
							>
						</div>
					{/each}
				</div>

				<!-- Actions -->
				<div class="flex justify-between">
					<div class="flex gap-3">
						<button
							class="btn btn-secondary"
							on:click={putOnHold}
							disabled={saving}>⏸ Tahan (On Hold)</button
						>
					</div>
					<div class="flex gap-3">
						<button
							class="btn btn-secondary"
							on:click={() => saveForm(false)}
							disabled={saving}
						>
							{#if saving}<span class="spinner"></span>{/if}
							💾 Simpan Draft
						</button>
						<button
							class="btn btn-primary btn-lg"
							on:click={() => saveForm(true)}
							disabled={saving}
						>
							{#if saving}<span class="spinner"></span>{/if}
							✅ Selesai & Discharge
						</button>
					</div>
				</div>
			</div>

			<!-- Patient Context Sidebar -->
			{#if showSidebar}
				<div style="width: 320px; flex-shrink: 0;">
					<div
						class="card"
						style="position: sticky; top: 80px; max-height: calc(100vh - 100px); overflow-y: auto;"
					>
						<h3 class="card-title mb-4">📋 Konteks Pasien</h3>

						{#if encounter}
							<div class="mb-4">
								<div class="text-xs text-muted">Nama</div>
								<div class="font-semibold">
									{encounter.patient_name}
								</div>
							</div>
							<div class="grid grid-2 gap-2 mb-4">
								<div>
									<div class="text-xs text-muted">
										Tgl Lahir
									</div>
									<div class="text-sm">
										{encounter.patient_birth_date || "-"}
									</div>
								</div>
								<div>
									<div class="text-xs text-muted">Gender</div>
									<div class="text-sm">
										{encounter.patient_gender === "male"
											? "L"
											: "P"}
									</div>
								</div>
								<div>
									<div class="text-xs text-muted">
										Gol. Darah
									</div>
									<div class="text-sm">
										{encounter.patient_blood_type ||
											"-"}{encounter.patient_rhesus || ""}
									</div>
								</div>
								<div>
									<div class="text-xs text-muted">Hamil</div>
									<div class="text-sm">
										{encounter.patient_pregnancy_status
											? "⚠️ Ya"
											: "Tidak"}
									</div>
								</div>
							</div>

							<hr
								style="border: none; border-top: 1px solid var(--border-color); margin: var(--space-4) 0;"
							/>

							<h4 class="text-sm font-semibold mb-2">
								Riwayat Kunjungan
							</h4>
							{#each patientHistory.slice(0, 5) as hist}
								<div
									style="padding: var(--space-2) 0; border-bottom: 1px solid var(--border-color);"
								>
									<div class="text-xs text-muted">
										{formatDate(hist.encounter?.created_at)}
									</div>
									<div class="text-sm">
										{hist.encounter?.assessment || "N/A"}
									</div>
									<span class="badge badge-gray text-xs"
										>{hist.encounter?.status}</span
									>
								</div>
							{:else}
								<p class="text-xs text-muted">
									Belum ada riwayat
								</p>
							{/each}
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Tooth Detail Modal -->
<Modal
	bind:show={showToothModal}
	title="Detail Gigi #{toothDetail.tooth_number}"
	size="lg"
>
	<div class="form-row">
		<div class="form-group">
			<label class="form-label">Permukaan</label>
			<div class="flex gap-2">
				{#each TOOTH_SURFACES as s}
					<label class="flex items-center gap-1 text-sm">
						<input
							type="checkbox"
							checked={toothDetail.surface?.includes(s.key)}
							on:change={(e) => {
								if (e.target.checked) {
									toothDetail.surface =
										(toothDetail.surface || "") + s.key;
								} else {
									toothDetail.surface =
										toothDetail.surface?.replace(
											s.key,
											"",
										) || "";
								}
							}}
						/>
						{s.key} ({s.label})
					</label>
				{/each}
			</div>
		</div>
	</div>
	<div class="form-row mt-4">
		<div class="form-group">
			<label class="form-label">Keadaan</label>
			<input
				class="form-input"
				bind:value={toothDetail.keadaan}
				placeholder="Kondisi gigi"
			/>
		</div>
		<div class="form-group">
			<label class="form-label">Restorasi</label>
			<input
				class="form-input"
				bind:value={toothDetail.restorasi}
				placeholder="Jenis restorasi"
			/>
		</div>
	</div>
	<div class="form-row mt-4">
		<div class="form-group">
			<label class="form-label">Diagnosa (ICD-10)</label>
			<input
				class="form-input"
				bind:value={toothDetail.diagnosis_code}
				placeholder="Kode"
			/>
			<input
				class="form-input mt-2"
				bind:value={toothDetail.diagnosis_display}
				placeholder="Deskripsi"
			/>
		</div>
		<div class="form-group">
			<label class="form-label">Tindakan (ICD-9-CM)</label>
			<input
				class="form-input"
				bind:value={toothDetail.procedure_code}
				placeholder="Kode"
			/>
			<input
				class="form-input mt-2"
				bind:value={toothDetail.procedure_display}
				placeholder="Deskripsi"
			/>
		</div>
	</div>

	<div slot="footer">
		<button
			class="btn btn-secondary"
			on:click={() => (showToothModal = false)}>Batal</button
		>
		<button class="btn btn-primary" on:click={saveToothDetail}
			>💾 Simpan</button
		>
	</div>
</Modal>
