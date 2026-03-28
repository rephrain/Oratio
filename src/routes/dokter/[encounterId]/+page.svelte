<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import SearchableSelect from "$lib/components/Forms/SearchableSelect.svelte";
	import Modal from "$lib/components/UI/Modal.svelte";
	import FileUpload from "$lib/components/UI/FileUpload.svelte";
	import OdontogramChart from "$lib/components/Odontogram/OdontogramChart.svelte";
	import {
		PERMANENT_TEETH,
		DECIDUOUS_TEETH,
		TOOTH_SURFACES,
		ALLERGY_REACTIONS,
		OCCLUSI_OPTIONS,
		TORUS_PALATINUS_OPTIONS,
		TORUS_MANDIBULARIS_OPTIONS,
		PALATUM_OPTIONS,
		REASON_CATEGORIES,
		DOCTOR_CODES,
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
	let resep = "";
	let keterangan = "";
	let tekananDarah = "";

	// Reason (SOAP-WHO)
	let reasonCode = "";
	let reasonDisplay = "";
	let reasonCategory = "finding";

	// Prescriptions
	let prescriptions = [];
	// Diagnoses
	let diagnoses = [];
	// Procedures
	let procedures = [];
	// Referrals
	let referrals = [];
	// Odontogram
	let odontogram = {
		dentition: "permanent",
		occlusi: "",
		torus_palatinus: "Tidak Ada",
		torus_mandibularis: "Tidak Ada",
		palatum: "",
		diastema: "Tidak Ada",
		gigi_anomali: "Tidak Ada",
		details: [],
	};
	// Encounter items
	let encounterItems = [];
	// Available master items for doctor
	let availableItems = [];

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
		bahan_restorasi: "",
		restorasi: "",
		protesa: "",
		bahan_protesa: "",
		diagnosis_code: "",
		diagnosis_display: "",
		procedure_code: "",
		procedure_display: "",
	};

	// Reactive map: Convert array of details to visual OdontogramChart format
	$: mappedOdontogramData = (odontogram.details || []).reduce((acc, d) => {
		if (!acc[d.tooth_number]) acc[d.tooth_number] = {};
		// For simplicity in this integration, map the first recorded surface as "center"
		// A full implementation would parse d.surface ("O","M","D") into top/bottom/left/right/center
		let color = '#10B981'; // Default green
		if (d.keadaan && d.keadaan.toUpperCase().includes('CARIES')) color = '#EF4444'; 
		else if (d.keadaan === 'MISSING') color = '#9CA3AF';
		
		acc[d.tooth_number].center = { condition: d.keadaan, color, restoration: d.restorasi };
		if (d.keadaan === 'EXTRACTED') acc[d.tooth_number].global = 'Extracted';
		else if (d.keadaan === 'MISSING') acc[d.tooth_number].global = 'Missing';
		return acc;
	}, {});

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
			referrals = data.referrals || [];
			resep = data.encounter?.resep || "";
			keterangan = data.encounter?.keterangan || "";
			reasonCode = data.encounter?.reason_code || "";
			reasonDisplay = data.encounter?.reason_display || "";
			reasonCategory = data.encounter?.reason_category || "finding";

			// Load available items for this doctor
			try {
				const itemsRes = await fetch(`/api/admin/items?doctor_id=${data.encounter.doctor_id}`);
				if (itemsRes.ok) {
					const itemsData = await itemsRes.json();
					availableItems = itemsData.data || [];
				}
			} catch {}

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

	// Referral management
	function addReferral() {
		referrals = [...referrals, { doctor_code: "", referral_date: "", note: "" }];
	}
	function removeReferral(i) {
		referrals = referrals.filter((_, idx) => idx !== i);
	}

	// Encounter item management
	function addEncounterItem() {
		encounterItems = [...encounterItems, { item_id: "", item_name: "", quantity: 1, price_at_time: 0, subtotal: 0 }];
	}
	function removeEncounterItem(i) {
		encounterItems = encounterItems.filter((_, idx) => idx !== i);
	}
	function onItemSelect(idx, itemId) {
		const item = availableItems.find(it => it.id === itemId);
		if (item) {
			encounterItems[idx].item_name = item.name;
			encounterItems[idx].price_at_time = parseFloat(item.price);
			encounterItems[idx].subtotal = encounterItems[idx].quantity * parseFloat(item.price);
			encounterItems = [...encounterItems];
		}
	}
	function updateItemSubtotal(idx) {
		encounterItems[idx].subtotal = encounterItems[idx].quantity * encounterItems[idx].price_at_time;
		encounterItems = [...encounterItems];
	}

	// Reason search (SOAP-WHO)
	async function searchReason(term) {
		const res = await fetch(`/api/snowstorm?term=${encodeURIComponent(term)}&type=reason_${reasonCategory}`);
		const data = await res.json();
		return (data.results || []).map(r => ({ value: r.code, label: r.display }));
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
						bahan_restorasi: "",
						restorasi: "",
						protesa: "",
						bahan_protesa: "",
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
				resep,
				keterangan,
				reason_code: reasonCode,
				reason_display: reasonDisplay,
				reason_category: reasonCategory,
				tekanan_darah: tekananDarah,
				prescriptions,
				diagnoses,
				procedures,
				referrals,
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
						<label class="form-label" for="soap-subjective">Subjective</label>
						<textarea
							id="soap-subjective"
							class="form-textarea"
							bind:value={subjective}
							rows="3"
							placeholder="Keluhan pasien..."
						></textarea>
					</div>
					<div class="form-group mb-4">
						<label class="form-label" for="soap-objective">Objective</label>
						<textarea
							id="soap-objective"
							class="form-textarea"
							bind:value={objective}
							rows="3"
							placeholder="Temuan pemeriksaan..."
						></textarea>
					</div>
					<div class="form-group mb-4">
						<label class="form-label" for="soap-bp">Tekanan Darah</label>
						<input
							id="soap-bp"
							class="form-input"
							style="max-width: 200px;"
							bind:value={tekananDarah}
							placeholder="120/80"
						/>
					</div>
					<div class="form-group mb-4">
						<label class="form-label" for="soap-assessment">Assessment</label>
						<textarea
							id="soap-assessment"
							class="form-textarea"
							bind:value={assessment}
							rows="3"
							placeholder="Penilaian/diagnosis..."
						></textarea>
					</div>
					<div class="form-group mb-4">
						<label class="form-label" for="soap-plan">Plan</label>
						<textarea
							id="soap-plan"
							class="form-textarea"
							bind:value={plan}
							rows="3"
							placeholder="Rencana tindakan/pengobatan..."
						></textarea>
					</div>
					<div class="form-group mb-4">
						<label class="form-label" for="soap-resep">Resep</label>
						<textarea
							id="soap-resep"
							class="form-textarea"
							bind:value={resep}
							rows="2"
							placeholder="Resep obat / catatan resep..."
						></textarea>
					</div>

					{#if formMode === 'SOAP-WHO'}
						<!-- SOAP-WHO Auto-generation -->
						<div class="flex gap-3 mb-4">
							<button type="button" class="btn btn-secondary btn-sm" on:click={() => {
								// Auto-generate SOAP from odontogram
								const details = odontogram.details || [];
								const diagList = details.filter(d => d.diagnosis_display).map(d => `Gigi ${d.tooth_number}: ${d.diagnosis_display}`).join('\n');
								const procList = details.filter(d => d.procedure_display).map(d => `Gigi ${d.tooth_number}: ${d.procedure_display}`).join('\n');
								const metaParts = [];
								if (odontogram.occlusi) metaParts.push(`Occlusi: ${odontogram.occlusi}`);
								if (odontogram.torus_palatinus && odontogram.torus_palatinus !== 'Tidak Ada') metaParts.push(`Torus Palatinus: ${odontogram.torus_palatinus}`);
								if (odontogram.torus_mandibularis && odontogram.torus_mandibularis !== 'Tidak Ada') metaParts.push(`Torus Mandibularis: ${odontogram.torus_mandibularis}`);
								if (odontogram.diastema && odontogram.diastema !== 'Tidak Ada') metaParts.push(`Diastema: ${odontogram.diastema}`);
								if (encounter?.chief_complaint_display) subjective = encounter.chief_complaint_display;
								objective = metaParts.join(', ');
								if (diagList) assessment = diagList;
								if (procList) plan = procList;
							}}>🔄 Auto-generate SOAP dari Odontogram</button>
						</div>

						<!-- Reason field -->
						<div class="form-group mb-4">
							<label class="form-label">Reason (SNOMED)</label>
							<div class="flex gap-2 mb-2">
								{#each REASON_CATEGORIES as cat}
									<button
										type="button"
										class="btn btn-sm {reasonCategory === cat.key ? 'btn-primary' : 'btn-ghost'}"
										on:click={() => { reasonCategory = cat.key; }}
									>{cat.label}</button>
								{/each}
							</div>
							<SearchableSelect
								searchFn={searchReason}
								placeholder="Cari reason ({reasonCategory})..."
								on:select={(e) => { reasonCode = e.detail.value; reasonDisplay = e.detail.label; }}
							/>
							{#if reasonDisplay}
								<div class="text-sm mt-1 text-muted">✓ {reasonCode} — {reasonDisplay}</div>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Odontogram (only for SOAP-WHO) -->
				{#if formMode === "SOAP-WHO"}
					<div class="card mb-6">
						<h3 class="card-title mb-4">
							🦷 Odontogram (PDGI Standard)
						</h3>

						<OdontogramChart 
							odontogramData={mappedOdontogramData} 
							on:toothClick={(e) => handleToothClick(e.detail.tooth, { shiftKey: e.detail.shiftKey })} 
						/>

						<!-- Odontogram Metadata -->
					<div class="form-row mt-4">
						<div class="form-group">
							<label class="form-label" for="occlusi-sel">Occlusi</label>
							<select id="occlusi-sel" class="form-select" bind:value={odontogram.occlusi}>
								<option value="">-- Pilih --</option>
								{#each OCCLUSI_OPTIONS as opt}
									<option value={opt}>{opt}</option>
								{/each}
							</select>
						</div>
						<div class="form-group">
							<label class="form-label" for="tp-sel">Torus Palatinus</label>
							<select id="tp-sel" class="form-select" bind:value={odontogram.torus_palatinus}>
								{#each TORUS_PALATINUS_OPTIONS as opt}
									<option value={opt}>{opt}</option>
								{/each}
							</select>
						</div>
						<div class="form-group">
							<label class="form-label" for="tm-sel">Torus Mandibularis</label>
							<select id="tm-sel" class="form-select" bind:value={odontogram.torus_mandibularis}>
								{#each TORUS_MANDIBULARIS_OPTIONS as opt}
									<option value={opt}>{opt}</option>
								{/each}
							</select>
						</div>
					</div>
					<div class="form-row mt-4">
						<div class="form-group">
							<label class="form-label" for="palatum-sel">Palatum</label>
							<select id="palatum-sel" class="form-select" bind:value={odontogram.palatum}>
								<option value="">-- Pilih --</option>
								{#each PALATUM_OPTIONS as opt}
									<option value={opt}>{opt}</option>
								{/each}
							</select>
						</div>
						<div class="form-group">
							<label class="form-label" for="diastema-inp">Diastema</label>
							<input id="diastema-inp" class="form-input" bind:value={odontogram.diastema} placeholder="Tidak Ada / lokasi dan lebar" />
						</div>
						<div class="form-group">
							<label class="form-label" for="anomali-inp">Gigi Anomali</label>
							<input id="anomali-inp" class="form-input" bind:value={odontogram.gigi_anomali} placeholder="Tidak Ada / lokasi dan bentuk" />
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
									aria-label="Kode ICD-10"
									class="form-input"
									bind:value={d.code}
									placeholder="Kode ICD-10"
								/>
							</div>
							<div class="form-group" style="flex: 1;">
								<input
									aria-label="Deskripsi diagnosis"
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
									aria-label="Kode Tindakan"
									class="form-input"
									bind:value={p.code}
									placeholder="Kode"
								/>
							</div>
							<div class="form-group" style="flex: 1;">
								<input
									aria-label="Deskripsi tindakan"
									class="form-input"
									bind:value={p.display}
									placeholder="Deskripsi tindakan"
								/>
							</div>
							<div class="form-group" style="flex: 0 0 80px;">
								<input
									aria-label="Nomor Gigi"
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
									aria-label="Nama obat"
									class="form-input"
									bind:value={rx.product_name}
									placeholder="Nama obat"
								/>
							</div>
							<div class="form-group" style="flex: 0 0 120px;">
								<input
									aria-label="Dosis"
									class="form-input"
									bind:value={rx.dosage}
									placeholder="Dosis"
								/>
							</div>
							<div class="form-group" style="flex: 0 0 80px;">
								<input
									aria-label="Kuantitas"
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

				<!-- Keterangan -->
				<div class="card mb-6">
					<h3 class="card-title mb-4">📋 Keterangan</h3>
					<div class="form-group">
						<label class="form-label" for="keterangan-ta">Keterangan Tambahan</label>
						<textarea id="keterangan-ta" class="form-textarea" bind:value={keterangan} rows="2" placeholder="Catatan tambahan..."></textarea>
					</div>
				</div>

				<!-- Referrals -->
				<div class="card mb-6">
					<div class="card-header">
						<h3 class="card-title">🔄 Rujukan</h3>
						<button type="button" class="btn btn-secondary btn-sm" on:click={addReferral}>+ Tambah</button>
					</div>
					{#each referrals as ref, i}
						<div class="flex gap-3 items-end mt-2">
							<div class="form-group" style="flex: 0 0 140px;">
								<select class="form-select" bind:value={ref.doctor_code}>
									<option value="">-- Dokter --</option>
									{#each DOCTOR_CODES as doc}
										<option value={doc.code}>{doc.code} - {doc.name}</option>
									{/each}
								</select>
							</div>
							<div class="form-group" style="flex: 0 0 140px;">
								<input type="date" class="form-input" bind:value={ref.referral_date} />
							</div>
							<div class="form-group" style="flex: 1;">
								<input class="form-input" bind:value={ref.note} placeholder="Catatan rujukan" />
							</div>
							<button type="button" class="btn btn-danger btn-sm btn-icon" on:click={() => removeReferral(i)}>✕</button>
						</div>
					{/each}
					{#if referrals.length === 0}
						<p class="text-sm text-muted mt-2">Belum ada rujukan</p>
					{/if}
				</div>

				<!-- Encounter Items -->
				<div class="card mb-6">
					<div class="card-header">
						<h3 class="card-title">🛒 Item Tindakan</h3>
						<button type="button" class="btn btn-secondary btn-sm" on:click={addEncounterItem}>+ Tambah</button>
					</div>
					{#each encounterItems as item, i}
						<div class="flex gap-3 items-end mt-2">
							<div class="form-group" style="flex: 1;">
								<select class="form-select" bind:value={item.item_id} on:change={() => onItemSelect(i, item.item_id)}>
									<option value="">-- Pilih Item --</option>
									{#each availableItems as ai}
										<option value={ai.id}>{ai.name} ({ai.item_group || '-'})</option>
									{/each}
								</select>
							</div>
							<div class="form-group" style="flex: 0 0 80px;">
								<input type="number" class="form-input" bind:value={item.quantity} min="1"
									on:input={() => updateItemSubtotal(i)} placeholder="Qty" />
							</div>
							<div class="form-group" style="flex: 0 0 120px;">
								<input class="form-input" value={item.price_at_time} disabled placeholder="Harga" />
							</div>
							<div class="form-group" style="flex: 0 0 120px;">
								<input class="form-input font-semibold" value={item.subtotal} disabled placeholder="Subtotal" />
							</div>
							<button type="button" class="btn btn-danger btn-sm btn-icon" on:click={() => removeEncounterItem(i)}>✕</button>
						</div>
					{/each}
					{#if encounterItems.length === 0}
						<p class="text-sm text-muted mt-2">Belum ada item tindakan</p>
					{/if}
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
					<div class="card" style="position: sticky; top: 80px; max-height: calc(100vh - 100px); overflow-y: auto; display: flex; flex-direction: column;">
						<div class="card-header border-b border-color pb-4 mb-4 flex justify-between items-center">
							<h3 class="font-semibold">Konteks Pasien</h3>
							<button class="btn btn-ghost btn-sm" on:click={() => (showSidebar = false)}>✕</button>
						</div>

						{#if encounter}
							<div class="patient-profile mb-6">
								<div class="font-bold text-lg mb-1">{encounter.patient_name}</div>
								<div class="grid grid-2 gap-2 text-sm text-muted mb-4">
									<div><strong>Tgl Lahir:</strong> {encounter.patient_birth_date || '-'}</div>
									<div><strong>Gender:</strong> {encounter.patient_gender === 'male' ? 'L' : 'P'}</div>
									<div><strong>Gol Darah:</strong> {encounter.patient_blood_type || '-'}{encounter.patient_rhesus || ''}</div>
									{#if encounter.patient_pregnancy_status}
										<div class="text-danger font-bold">⚠️ Hamil</div>
									{/if}
								</div>
							</div>

							<div class="font-semibold text-sm mb-3">Riwayat Kunjungan</div>
							<div class="history-list flex-1 overflow-y-auto" style="padding-right: 8px;">
								{#each patientHistory.slice(0, 5) as hist}
									<div class="p-3 border border-color rounded-md mb-3 text-sm" style="background: var(--gray-50);">
										<div class="flex justify-between mb-1">
											<span class="font-semibold">{formatDate(hist.encounter?.created_at)}</span>
											<span class="badge badge-gray text-xs">{hist.encounter?.status}</span>
										</div>
										<p class="text-muted mb-1 line-clamp-2">{hist.encounter?.assessment || "Belum ada assessment"}</p>
									</div>
								{:else}
									<p class="text-xs text-muted">Belum ada riwayat</p>
								{/each}
							</div>
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
			<label class="form-label" for="td-keadaan">Keadaan</label>
			<input
				id="td-keadaan"
				class="form-input"
				bind:value={toothDetail.keadaan}
				placeholder="Kondisi gigi"
			/>
		</div>
		<div class="form-group">
			<label class="form-label" for="td-bahan-restorasi">Bahan Restorasi</label>
			<input
				id="td-bahan-restorasi"
				class="form-input"
				bind:value={toothDetail.bahan_restorasi}
				placeholder="Bahan restorasi"
			/>
		</div>
		<div class="form-group">
			<label class="form-label" for="td-restorasi">Restorasi</label>
			<input
				id="td-restorasi"
				class="form-input"
				bind:value={toothDetail.restorasi}
				placeholder="Jenis restorasi"
			/>
		</div>
	</div>
	<div class="form-row mt-4">
		<div class="form-group">
			<label class="form-label" for="td-protesa">Protesa</label>
			<input
				id="td-protesa"
				class="form-input"
				bind:value={toothDetail.protesa}
				placeholder="Jenis protesa"
			/>
		</div>
		<div class="form-group">
			<label class="form-label" for="td-bahan-protesa">Bahan Protesa</label>
			<input
				id="td-bahan-protesa"
				class="form-input"
				bind:value={toothDetail.bahan_protesa}
				placeholder="Bahan protesa"
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
