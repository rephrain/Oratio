<script>
	import { page } from "$app/stores";
	import { onMount, onDestroy } from "svelte";
	import { goto } from "$app/navigation";
	import {
		headerTitle,
		isPatientProfileOpen,
		isSidebarHidden,
	} from "$lib/stores/layout.js";
	import SearchableSelect from "$lib/components/Forms/SearchableSelect.svelte";
	import Modal from "$lib/components/UI/Modal.svelte";
	import FileUpload from "$lib/components/UI/FileUpload.svelte";
	import OdontogramChart from "$lib/components/Odontogram/OdontogramChart.svelte";
	import ToothDetailPanel from "$lib/components/Odontogram/ToothDetailPanel.svelte";
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
		KEADAAN,
		BAHAN_RESTORASI,
		RESTORASI,
		BAHAN_PROTESA,
		PROTESA,
	} from "$lib/utils/constants.js";
	import {
		formatDate,
		getWhatsAppUrl,
		generateSOAPWHOText,
	} from "$lib/utils/formatters.js";
	import { addToast } from "$lib/stores/toast.js";

	// Helper: look up a label from a key in {key, label}[] constants
	function lookupLabel(list, key) {
		if (!key) return "";
		const found = list.find((item) => item.key === key);
		return found ? found.label : key; // fallback to raw key if not found
	}

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
	let clinicalPhotos = [];
	let uploadingPhoto = false;

	// Reason (SOAP_WHO)
	let reasonCode = "";
	let reasonDisplay = "";
	let reasonCategory = "finding";
	let newReasonCode = "";
	let newReasonDisplay = "";

	// Prescriptions
	let prescriptions = [];
	// Referrals
	let referrals = [];
	// Odontogram
	let odontogram = {
		dentition_type: "Adult",
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
	let patientMedicalBackground = null;
	let loadingMedical = false;
	let showSidebar = true;
	let doctorsList = [];

	$: if (encounter?.patient_name && encounter?.encounter?.patient_id) {
		const title = `${encounter.patient_name} (${encounter.encounter.patient_id})`;
		headerTitle.set(title);
	}

	$: personalDiseases =
		patientMedicalBackground?.diseases?.filter(
			(d) => d.type === "personal",
		) || [];
	$: familyDiseases =
		patientMedicalBackground?.diseases?.filter(
			(d) => d.type === "family",
		) || [];

	const REASON_THEMES = {
		finding: {
			bg: "bg-blue-50/50",
			border: "border-blue-100",
			text: "text-blue-700",
			icon: "search",
			label: "Finding / Symptom",
		},
		procedure: {
			bg: "bg-emerald-50/50",
			border: "border-emerald-100",
			text: "text-emerald-700",
			icon: "medical_services",
			label: "Procedure / Treatment",
		},
		situation: {
			bg: "bg-amber-50/50",
			border: "border-amber-100",
			text: "text-amber-700",
			icon: "check_circle",
			label: "General Situation",
		},
		event: {
			bg: "bg-rose-50/50",
			border: "border-rose-100",
			text: "text-rose-700",
			icon: "notification_important",
			label: "Accident / Event",
		},
	};

	const STATUS_THEMES = {
		Planned: {
			bg: "bg-blue-50/50",
			border: "border-blue-100/50",
			text: "text-blue-700",
			badge: "bg-blue-100/50 text-blue-700",
			dot: "bg-blue-500",
			icon: "calendar_today",
		},
		"In Progress": {
			bg: "bg-indigo-50/50",
			border: "border-indigo-100/50",
			text: "text-indigo-700",
			badge: "bg-indigo-100/50 text-indigo-700",
			dot: "bg-indigo-500",
			icon: "pending",
		},
		"On Hold": {
			bg: "bg-amber-50/50",
			border: "border-amber-100/50",
			text: "text-amber-700",
			badge: "bg-amber-100/50 text-amber-700",
			dot: "bg-amber-500",
			icon: "pause_circle",
		},
		Discharged: {
			bg: "bg-emerald-50/50",
			border: "border-emerald-100/50",
			text: "text-emerald-700",
			badge: "bg-emerald-100/50 text-emerald-700",
			dot: "bg-emerald-500",
			icon: "check_circle",
		},
		Completed: {
			bg: "bg-green-50/50",
			border: "border-green-100/50",
			text: "text-green-700",
			badge: "bg-green-100/50 text-green-700",
			dot: "bg-green-500",
			icon: "task_alt",
		},
		Cancelled: {
			bg: "bg-rose-50/50",
			border: "border-rose-100/50",
			text: "text-rose-700",
			badge: "bg-rose-100/50 text-rose-700",
			dot: "bg-rose-500",
			icon: "cancel",
		},
		Discontinued: {
			bg: "bg-slate-50/50",
			border: "border-slate-100/50",
			text: "text-slate-700",
			badge: "bg-slate-100/50 text-slate-700",
			dot: "bg-slate-500",
			icon: "stop_circle",
		},
		default: {
			bg: "bg-slate-50/50",
			border: "border-slate-100/50",
			text: "text-slate-600",
			badge: "bg-slate-100/50 text-slate-600",
			dot: "bg-slate-400",
			icon: "help",
		},
	};

	$: selectedStatusConfig = (() => {
		const status = encounter?.encounter?.status;
		const map = {
			"In Progress": {
				badge: "bg-blue-500",
				bg: "from-blue-100 to-blue-50",
				text: "text-blue-600",
			},
			Arrived: {
				badge: "bg-emerald-500",
				bg: "from-emerald-100 to-emerald-50",
				text: "text-emerald-600",
			},
			Planned: {
				badge: "bg-amber-400",
				bg: "from-amber-100 to-amber-50",
				text: "text-amber-600",
			},
			"On Hold": {
				badge: "bg-rose-400",
				bg: "from-rose-100 to-rose-50",
				text: "text-rose-600",
			},
			Discharged: {
				badge: "bg-emerald-500",
				bg: "from-emerald-100 to-emerald-50",
				text: "text-emerald-600",
			},
			Completed: {
				badge: "bg-emerald-500",
				bg: "from-emerald-100 to-emerald-50",
				text: "text-emerald-600",
			},
		};
		return map[status] || map["In Progress"];
	})();

	// Tooth detail modal
	let showToothModal = false;
	let selectedTooth = null;
	let toothDetail = {
		tooth_number: "",
		keadaan: "",
		protesa: "",
		bahan_protesa: "",
		restorations: [],
		diagnoses: [],
		procedures: [],
	};

	let selectedSurfaceArea = "";
	let selectedTeeth = new Set();

	function getClinicalSurfaceName(surfaceKey, toothNum) {
		const quad = String(toothNum)[0];
		const isUpper = ["1", "2", "5", "6"].includes(quad);
		const isRightSideOfMouth = ["1", "4", "5", "8"].includes(quad);
		const isAnterior = ["1", "2", "3"].includes(String(toothNum)[1]);

		if (surfaceKey === "center") return isAnterior ? "I" : "O";
		if (surfaceKey === "top") return isUpper ? "B" : "L";
		if (surfaceKey === "bottom") return isUpper ? "P" : "B";
		if (surfaceKey === "left") return isRightSideOfMouth ? "D" : "M";
		if (surfaceKey === "right") return isRightSideOfMouth ? "M" : "D";
		return "";
	}

	function parseSurfaces(surfaceStr, toothNum) {
		let s = (surfaceStr || "").toUpperCase().trim();
		if (s === "") return ["center"];
		if (["TOP", "BOTTOM", "LEFT", "RIGHT", "CENTER"].includes(s))
			return [s.toLowerCase()];

		const quad = String(toothNum)[0];
		const isUpper = ["1", "2", "5", "6"].includes(quad);
		const isRightSideOfMouth = ["1", "4", "5", "8"].includes(quad);

		let result = [];
		if (s.includes("O") || s.includes("I")) result.push("center");
		if (s.includes("M")) result.push(isRightSideOfMouth ? "right" : "left");
		if (s.includes("D")) result.push(isRightSideOfMouth ? "left" : "right");
		if (
			s.includes("V") ||
			s.includes("B") ||
			s.includes("F") ||
			s.includes("LA")
		)
			result.push(isUpper ? "top" : "bottom");
		if (s.includes("P") || (s.includes("L") && !s.includes("LA")))
			result.push(isUpper ? "bottom" : "top");

		if (result.length === 0) return ["center"];
		return result;
	}

	$: mappedOdontogramData = (odontogram.details || []).reduce((acc, d) => {
		const tn = String(d.tooth_number);
		if (!acc[tn]) acc[tn] = {};

		let color = "#10B981"; // Default green
		if (d.keadaan === "car" || d.keadaan === "cav") color = "#ffffff";
		else if (d.keadaan === "mis") color = "#9CA3AF";
		else if (d.keadaan === "sou") color = "#ffffff";

		if (d.keadaan === "mis") acc[tn].global = "Missing";
		else if (
			d.protesa === "prd" ||
			d.protesa === "fld" ||
			d.protesa === "fud"
		)
			acc[tn].global = "Missing";
		else if (d.keadaan === "nvt") acc[tn].global = "Non-Vital";
		else if (d.keadaan === "non") acc[tn].global = "NON";
		else if (d.keadaan === "une") acc[tn].global = "UNE";
		else if (d.keadaan === "pre") acc[tn].global = "PRE";
		else if (d.keadaan === "ano") acc[tn].global = "ANO";
		else if (d.keadaan === "cfr" || d.keadaan === "frx")
			acc[tn].global = "Fracture";
		else if (d.keadaan === "rrx") acc[tn].global = "Sisa Akar";

		if (d.restorations && d.restorations.length > 0) {
			d.restorations.forEach((r) => {
				const mappedData = {
					condition: d.keadaan,
					color,
					restoration: r.restorasi,
					bahan_restorasi: r.bahan_restorasi,
					protesa: d.protesa,
				};
				if (r.surfaces && r.surfaces.length > 0) {
					r.surfaces.forEach((s) => {
						const keys = parseSurfaces(s, tn);
						keys.forEach((k) => {
							if (!acc[tn][k]) acc[tn][k] = mappedData;
						});
					});
				} else {
					if (!acc[tn]["center"]) acc[tn]["center"] = mappedData;
				}

				if (r.restorasi === "rct") {
					acc[tn].global = "RCT";
				} else if (r.restorasi === "pon") {
					acc[tn].global = "Missing";
				}
			});
		} else {
			const mappedData = {
				condition: d.keadaan,
				color,
				restoration: null,
				bahan_restorasi: null,
				protesa: d.protesa,
			};
			if (!acc[tn]["center"]) acc[tn]["center"] = mappedData;
		}

		return acc;
	}, {});

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
			tekananDarah = data.patient_tekanan_darah || "";
			prescriptions = data.prescriptions || [];

			if (data.odontograms?.length > 0) {
				const grouped = {};
				for (const d of data.odontogramDetails || []) {
					if (!grouped[d.tooth_number]) {
						grouped[d.tooth_number] = {
							tooth_number: d.tooth_number,
							keadaan: d.keadaan,
							protesa: d.protesa,
							bahan_protesa: d.bahan_protesa,
							restorations: [],
							diagnoses: (d.all_diagnoses || []).map((diag) => ({
								icd10_id: diag.icd10_id,
								diagnosis_code: diag.icd10_code,
								diagnosis_display: diag.icd10_display,
								is_primary: diag.is_primary,
							})),
							procedures: (d.all_procedures || []).map(
								(proc) => ({
									icd9cm_id: proc.icd9cm_id,
									procedure_code: proc.icd9cm_code,
									procedure_display: proc.icd9cm_display,
								}),
							),
						};
					}
					if (d.restorasi) {
						let rest = grouped[d.tooth_number].restorations.find(
							(r) =>
								r.restorasi === d.restorasi &&
								r.bahan_restorasi === d.bahan_restorasi,
						);
						if (!rest) {
							rest = {
								restorasi: d.restorasi,
								bahan_restorasi: d.bahan_restorasi,
								surfaces: [],
							};
							grouped[d.tooth_number].restorations.push(rest);
						}
						if (d.surface && !rest.surfaces.includes(d.surface)) {
							rest.surfaces.push(d.surface);
						}
					}
				}

				odontogram = {
					...data.odontograms[0],
					details: Object.values(grouped),
				};
			}

			encounterItems = data.items || [];
			referrals = data.referrals || [];
			resep = data.encounter?.resep || "";
			keterangan = data.encounter?.keterangan || "";
			reasonCode = data.encounter_reason_code || "";
			reasonDisplay = data.encounter_reason_display || "";
			reasonCategory = data.encounter?.reason_type || "finding";
			newReasonCode = "";
			newReasonDisplay = "";
			clinicalPhotos = data.clinical_photos || [];

			console.log("encounter:", encounter);

			// Load available items for this doctor
			try {
				const itemsRes = await fetch(
					`/api/admin/items?doctor_id=${data.encounter.doctor_id}`,
				);
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
			// Load past encounters
			const encRes = await fetch(
				`/api/encounters?patient_id=${patientId}&limit=20`,
			);
			if (encRes.ok) {
				const encData = await encRes.json();
				patientHistory = encData.data || [];
			}

			// Load medical background
			loadingMedical = true;
			try {
				const bgRes = await fetch(
					`/api/patients/${patientId}/medical-background`,
				);
				if (bgRes.ok) patientMedicalBackground = await bgRes.json();
			} catch (e) {
				console.error(e);
			} finally {
				loadingMedical = false;
			}
		} catch {}
	}

	async function updateStatus(status) {
		await fetch(`/api/encounters/${encounterId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status }),
		});
	}

	// Prescription management
	let newRx = {
		kfa_code: "",
		product_name: "",
		dosage_form: "",
		dosage: "",
		quantity: 1,
		instruction: "",
		merk_type: "known",
	};

	async function searchMedication(term, merkType = "known") {
		const res = await fetch(
			`/api/kfa?query=${encodeURIComponent(term)}&merkType=${merkType}`,
		);
		const data = await res.json();
		return (data.results || []).map((r) => ({
			value: r.code,
			label: r.display,
			dosage_form: r.dosage_form,
		}));
	}

	function addPrescription() {
		if (!newRx.kfa_code || !newRx.product_name) {
			addToast("Silakan pilih produk obat", "warning");
			return;
		}
		if (!newRx.dosage_form) {
			addToast("Silakan pilih sediaan obat (dosage form)", "warning");
			return;
		}
		prescriptions = [...prescriptions, { ...newRx }];
		// reset draft
		newRx = {
			kfa_code: "",
			product_name: "",
			dosage_form: "",
			dosage: "",
			quantity: 1,
			instruction: "",
			merk_type: "known",
		};
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
	// Referral state
	let showRujukanForm = false;
	let newRef = {
		doctor_code: "",
		doctor_name: "",
		referral_date: "",
		note: "",
	};

	function addReferral() {
		if (!newRef.doctor_code) {
			addToast("Silakan pilih dokter rujukan", "warning");
			return;
		}
		const doc = doctorsList.find(
			(d) => d.doctor_code === newRef.doctor_code,
		);
		newRef.doctor_name = doc ? doc.name : "";
		referrals = [...referrals, { ...newRef }];
		newRef = {
			doctor_code: "",
			doctor_name: "",
			referral_date: "",
			note: "",
		};
		showRujukanForm = false;
	}
	function removeReferral(i) {
		referrals = referrals.filter((_, idx) => idx !== i);
	}

	// Encounter Item state
	let newItem = {
		item_id: "",
		item_name: "",
		quantity: 1,
		price_at_time: 0,
		subtotal: 0,
	};

	function addEncounterItem() {
		if (!newItem.item_id) {
			addToast("Silakan pilih item", "warning");
			return;
		}
		encounterItems = [...encounterItems, { ...newItem }];
		newItem = {
			item_id: "",
			item_name: "",
			quantity: 1,
			price_at_time: 0,
			subtotal: 0,
		};
	}
	function removeEncounterItem(i) {
		encounterItems = encounterItems.filter((_, idx) => idx !== i);
	}
	function onNewItemSelect(itemId) {
		const item = availableItems.find((it) => it.id === itemId);
		if (item) {
			newItem.item_name = item.name;
			newItem.price_at_time = parseFloat(item.price || 0);
			newItem.subtotal = (newItem.quantity || 1) * newItem.price_at_time;
		} else {
			newItem.item_name = "";
			newItem.price_at_time = 0;
			newItem.subtotal = 0;
		}
	}
	function updateNewItemSubtotal() {
		newItem.subtotal =
			(newItem.quantity || 1) * (newItem.price_at_time || 0);
	}

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
		try {
			const res = await fetch("/api/doctors?active=true");
			const data = await res.json();
			doctorsList = data.doctors || [];
		} catch (err) {
			console.error("Error loading doctors:", err);
		}
	}

	// Reason search (SOAP_WHO)
	async function searchReason(term) {
		const res = await fetch(
			`/api/snowstorm?term=${encodeURIComponent(term)}&type=reason_${reasonCategory}`,
		);
		const data = await res.json();
		return (data.results || []).map((r) => ({
			value: r.code,
			label: r.display,
		}));
	}

	async function searchClinicalFinding(term) {
		const res = await fetch(
			`/api/snowstorm?filter=${encodeURIComponent(term)}&type=reason_finding`,
		);
		const data = await res.json();
		return (data.results || []).map((r) => ({
			value: r.code,
			label: r.display,
		}));
	}

	async function searchTerminology(term, system) {
		const res = await fetch(
			`/api/terminologies?term=${encodeURIComponent(term)}&system=${encodeURIComponent(system)}`,
		);
		const data = await res.json();
		return data.results || [];
	}

	// Odontogram Reset
	function resetOdontogram() {
		if (
			confirm("Apakah anda yakin ingin mereset seluruh data odontogram?")
		) {
			odontogram = {
				dentition_type: "Adult",
				occlusi: "",
				torus_palatinus: "Tidak Ada",
				torus_mandibularis: "Tidak Ada",
				palatum: "",
				diastema: "Tidak Ada",
				gigi_anomali: "Tidak Ada",
				details: [],
			};
		}
	}

	// Tooth click
	function handleToothClick(toothNum, selectedObjOrSurface, maybeEvent) {
		const tn = String(toothNum); // Normalize to string — DB stores strings, chart uses integers
		let surfaceArea =
			typeof selectedObjOrSurface === "string"
				? selectedObjOrSurface
				: "";
		let event = maybeEvent || selectedObjOrSurface;

		if (event && event.shiftKey) {
			if (selectedTeeth.has(tn)) {
				selectedTeeth.delete(tn);
			} else {
				selectedTeeth.add(tn);
			}
			selectedTeeth = new Set(selectedTeeth);
		} else {
			selectedTooth = tn;
			selectedSurfaceArea = surfaceArea;

			const clinicalSurface = getClinicalSurfaceName(surfaceArea, tn);
			let existing = odontogram.details.find(
				(d) => String(d.tooth_number) === tn,
			);

			if (existing) {
				toothDetail = JSON.parse(JSON.stringify(existing));
			} else {
				toothDetail = {
					tooth_number: tn,
					keadaan: "",
					protesa: "",
					bahan_protesa: "",
					restorations: clinicalSurface
						? [
								{
									restorasi: "",
									bahan_restorasi: "",
									surfaces: [clinicalSurface],
								},
							]
						: [],
					diagnoses: [],
					procedures: [],
				};
			}
			showToothModal = true;
		}
	}

	function saveToothDetail(event) {
		const updatedTooth = event.detail; // from dispatch('save', t)
		updatedTooth.tooth_number = String(updatedTooth.tooth_number); // Always string
		const idx = odontogram.details.findIndex(
			(d) => String(d.tooth_number) === updatedTooth.tooth_number,
		);
		if (idx >= 0) {
			odontogram.details[idx] = updatedTooth;
		} else {
			odontogram.details = [...odontogram.details, updatedTooth];
		}
		odontogram = { ...odontogram };
	}

	function hasCondition(toothNum) {
		return odontogram.details.some(
			(d) => String(d.tooth_number) === String(toothNum),
		);
	}

	// Render 5-surface tooth SVG (cross/diamond pattern per PDGI standard)
	function renderToothSVG(hasConditionFlag) {
		const fillColor = hasConditionFlag ? "var(--primary)" : "white";
		const strokeColor = hasConditionFlag
			? "var(--primary-hover)"
			: "var(--gray-400)";
		return `<svg class="tooth-svg" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
			<polygon points="12,12 24,12 18,2" fill="${hasConditionFlag ? "var(--accent-light)" : "white"}" stroke="${strokeColor}" stroke-width="1"/>
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
			// Auto-generate structured SOAP text for SOAP_WHO mode
			let soapSubjective = subjective;
			let soapObjective = objective;
			let soapAssessment = assessment;
			let soapPlan = plan;

			if (formMode === "SOAP_WHO") {
				const currentReasonDisplay = newReasonCode
					? newReasonDisplay
					: reasonDisplay;
				const soapText = generateSOAPWHOText({
					reasonDisplay: currentReasonDisplay,
					details: odontogram.details || [],
					constants: {
						KEADAAN,
						RESTORASI,
						BAHAN_RESTORASI,
						PROTESA,
						BAHAN_PROTESA,
						TOOTH_SURFACES,
					},
				});
				soapSubjective = soapText.subjective;
				soapObjective = soapText.objective;
				soapAssessment = soapText.assessment;
				soapPlan = soapText.plan;
			}

			const body = {
				form_mode: formMode,
				subjective: soapSubjective,
				objective: soapObjective,
				assessment: soapAssessment,
				plan: soapPlan,
				resep,
				keterangan,
				reason_code:
					formMode === "SOAP_WHO" && newReasonCode
						? newReasonCode
						: reasonCode,
				reason_display:
					formMode === "SOAP_WHO" && newReasonCode
						? newReasonDisplay
						: reasonDisplay,
				reason_type:
					formMode === "SOAP_WHO" && newReasonCode
						? "finding"
						: reasonCategory,
				tekanan_darah: tekananDarah,
				prescriptions,
				referrals,
				encounter_items: encounterItems,
			};

			if (formMode === "SOAP_WHO") {
				body.odontogram = odontogram;
			}

			if (discharge) {
				body.status = "Discharged";
			} else {
				body.status = "On Hold";
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
						: "Encounter ditahan (On Hold)",
					discharge ? "success" : "warning",
				);
				goto("/dokter");
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

	async function handlePhotoUpload(event) {
		const file = event.target.files[0];
		if (!file) return;

		uploadingPhoto = true;
		const formData = new FormData();
		formData.append("file", file);
		formData.append("patient_id", encounter?.encounter?.patient_id);
		formData.append("encounter_id", encounterId);
		formData.append("document_type", "clinical_photo");

		try {
			const res = await fetch("/api/documents", {
				method: "POST",
				body: formData,
			});

			if (res.ok) {
				const data = await res.json();
				// Add to local state
				clinicalPhotos = [
					...clinicalPhotos,
					{
						id: data.id,
						file_name: data.fileName,
						created_at: new Date().toISOString(),
					},
				];
				addToast("Foto berhasil diunggah", "success");
			} else {
				// Attempt to read the error message from the server
				let errorMessage = "Gagal mengunggah foto";
				try {
					const errorData = await res.json();
					console.error("Server Error Details:", errorData);
					errorMessage =
						errorData.message ||
						`Error ${res.status}: ${errorMessage}`;
				} catch (parseErr) {
					console.error(
						"Could not parse error response. Status:",
						res.status,
					);
				}

				throw new Error(errorMessage);
			}
		} catch (err) {
			console.error(err);
			addToast("Gagal mengunggah foto", "error");
		} finally {
			uploadingPhoto = false;
		}
	}

	async function deletePhoto(photoId) {
		if (!confirm("Apakah Anda yakin ingin menghapus foto ini?")) return;

		try {
			const res = await fetch(`/api/documents/${photoId}`, {
				method: "DELETE",
			});

			if (res.ok) {
				clinicalPhotos = clinicalPhotos.filter((p) => p.id !== photoId);
				addToast("Foto dihapus", "success");
			} else {
				addToast("Gagal menghapus foto", "error");
			}
		} catch (err) {
			console.error(err);
			addToast("Terjadi kesalahan saat menghapus foto", "error");
		}
	}

	// Close without submit → On Hold
	async function putOnHold() {
		await updateStatus("On Hold");
		addToast("Encounter ditahan (On Hold)", "warning");
		goto("/dokter");
	}

	onMount(() => {
		isSidebarHidden.set(true);
		loadEncounter();
		loadDoctors();
	});

	onDestroy(() => {
		headerTitle.set(null);
		isSidebarHidden.set(false);
	});
</script>

<div>
	{#if loading}
		<div style="text-align: center; padding: var(--space-16);">
			<div class="spinner spinner-lg" style="margin: 0 auto;"></div>
			<p class="text-muted mt-4">Memuat encounter...</p>
		</div>
	{:else if encounter}
		<div style="display: flex; gap: var(--space-6);">
			<!-- Left Patient Profile Drawer (Toggled from Header) -->
			{#if $isPatientProfileOpen}
				<aside
					class="w-80 shrink-0 bg-white border border-slate-200 z-[40] flex flex-col shadow-sm rounded-2xl overflow-hidden h-[calc(100vh-140px)] sticky top-[80px]"
				>
					<div
						class="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-50/30"
					>
						<button
							type="button"
							class="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
							on:click={() => ($isPatientProfileOpen = false)}
						>
							<span class="material-symbols-outlined text-[18px]"
								>close</span
							>
						</button>

						<div class="p-6 border-b border-slate-100 bg-white">
							<div class="flex flex-col items-center text-center">
								<div class="relative mb-4">
									<div
										class="w-20 h-20 rounded-full ring-4 ring-white shadow-lg bg-gradient-to-br {selectedStatusConfig.bg} flex items-center justify-center transition-transform hover:scale-105 duration-300"
									>
										<span
											class="text-3xl font-black {selectedStatusConfig.text} drop-shadow-sm"
											>{encounter.patient_name
												.substring(0, 2)
												.toUpperCase()}</span
										>
									</div>
									<div
										class="absolute -bottom-1 -right-1 w-7 h-7 {selectedStatusConfig.badge} rounded-full border-2 border-white shadow flex items-center justify-center z-10"
									>
										<span
											class="text-white text-[11px] font-black"
											>{encounter.encounter
												?.queue_number || "-"}</span
										>
									</div>
								</div>
								<h3
									class="text-lg font-bold text-slate-800 leading-tight"
								>
									{encounter.patient_name}
								</h3>
								<p
									class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest"
								>
									ID Tindakan: {encounter.encounter?.id ||
										"-"}
								</p>
							</div>
						</div>

						<div class="p-6 flex flex-col gap-8 pb-8">
							{#if encounter.encounter?.reason_category || encounter.encounter_reason_display}
								<section>
									<h4
										class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"
									>
										<span
											class="material-symbols-outlined text-sm"
											>assignment</span
										> Encounter Reason
									</h4>
									<div
										class="p-4 rounded-2xl border {REASON_THEMES[
											encounter.encounter
												?.reason_category || 'finding'
										]?.bg || 'bg-slate-50'} {REASON_THEMES[
											encounter.encounter
												?.reason_category || 'finding'
										]?.border || 'border-slate-200'}"
									>
										<div class="flex items-center gap-3">
											<div
												class="w-8 h-8 rounded-lg flex items-center justify-center {REASON_THEMES[
													encounter.encounter
														?.reason_category ||
														'finding'
												]?.bg ||
													'bg-white'} border {REASON_THEMES[
													encounter.encounter
														?.reason_category ||
														'finding'
												]?.border ||
													'border-slate-200'} {REASON_THEMES[
													encounter.encounter
														?.reason_category ||
														'finding'
												]?.text || 'text-slate-600'}"
											>
												<span
													class="material-symbols-outlined text-[18px]"
													>{REASON_THEMES[
														encounter.encounter
															?.reason_category ||
															"finding"
													]?.icon || "info"}</span
												>
											</div>
											<div>
												<p
													class="text-[9px] font-black uppercase tracking-widest {REASON_THEMES[
														encounter.encounter
															?.reason_category ||
															'finding'
													]?.text ||
														'text-slate-500'}"
												>
													{REASON_THEMES[
														encounter.encounter
															?.reason_category ||
															"finding"
													]?.label || "Visit Reason"}
												</p>
												<p
													class="text-xs font-bold text-slate-800 leading-tight"
												>
													{encounter.encounter_reason_display ||
														"No detailed reason provided"}
												</p>
											</div>
										</div>
									</div>
								</section>
							{/if}

							<section>
								<h4
									class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"
								>
									<span
										class="material-symbols-outlined text-sm"
										>id_card</span
									> Identification
								</h4>
								<div class="space-y-3">
									<div
										class="flex justify-between items-center group"
									>
										<span class="text-[11px] text-slate-500"
											>Patient ID</span
										><span
											class="text-[11px] font-bold text-slate-800"
											>{encounter.encounter?.patient_id ||
												"-"}</span
										>
									</div>
									<div
										class="flex justify-between items-center"
									>
										<span class="text-[11px] text-slate-500"
											>DOB / Age</span
										><span
											class="text-[11px] font-bold text-slate-800"
											>{formatDate(
												encounter.patient_birth_date,
											) || "-"} ({calculateAge(
												encounter.patient_birth_date,
											)}y)</span
										>
									</div>
									<div
										class="flex justify-between items-center"
									>
										<span class="text-[11px] text-slate-500"
											>Gender</span
										>
										<div class="flex items-center gap-1">
											{#if encounter.patient_gender === "Male" || encounter.patient_gender === "L" || encounter.patient_gender === "male"}<span
													class="material-symbols-outlined text-[14px] text-blue-500"
													>male</span
												>{:else if encounter.patient_gender === "Female" || encounter.patient_gender === "P" || encounter.patient_gender === "female"}<span
													class="material-symbols-outlined text-[14px] text-pink-500"
													>female</span
												>{/if}<span
												class="text-[11px] font-bold text-slate-800"
												>{encounter.patient_gender ===
													"Male" ||
												encounter.patient_gender ===
													"L" ||
												encounter.patient_gender ===
													"male"
													? "Male"
													: encounter.patient_gender ===
																"Female" ||
														  encounter.patient_gender ===
																"P" ||
														  encounter.patient_gender ===
																"female"
														? "Female"
														: encounter.patient_gender ||
															"-"}</span
											>
										</div>
									</div>
									<div
										class="flex justify-between items-start"
									>
										<span class="text-[11px] text-slate-500"
											>Address</span
										><span
											class="text-[11px] font-bold text-slate-800 text-right w-30 leading-relaxed"
											>{encounter.patient_address ||
												"-"}</span
										>
									</div>
									<div
										class="flex justify-between items-center"
									>
										<span class="text-[11px] text-slate-500"
											>Contact</span
										>
										<div class="text-right">
											{#if encounter.patient_email}<a
													href="mailto:{encounter.patient_email}"
													class="text-[11px] font-bold text-primary hover:underline flex items-center justify-end gap-1"
													><span
														class="material-symbols-outlined text-[14px]"
														>mail</span
													>{encounter.patient_email}</a
												>{/if}{#if encounter.patient_handphone}<a
													href={getWhatsAppUrl(
														encounter.patient_handphone,
													)}
													target="_blank"
													class="text-[11px] font-bold text-primary hover:underline flex items-center justify-end gap-1"
													><span
														class="material-symbols-outlined text-[14px]"
														>chat</span
													>{encounter.patient_handphone}</a
												>{:else}<span
													class="text-[11px] font-bold text-slate-800"
													>-</span
												>{/if}
										</div>
									</div>
								</div>
							</section>

							<section id="aside-medical-background">
								<header
									class="flex items-center justify-between mb-4"
								>
									<h4
										class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"
									>
										<span
											class="material-symbols-outlined text-sm"
											>medical_services</span
										> Medical Background
									</h4>
								</header>
								<div class="grid grid-cols-2 gap-3 mb-4">
									<div
										class="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between"
									>
										<div class="flex flex-col">
											<span
												class="text-[10px] text-blue-600 uppercase font-bold"
												>Blood Type</span
											>
											<div
												class="flex items-baseline gap-1"
											>
												<span
													class="text-lg font-black text-blue-900"
													>{encounter.patient_blood_type ||
														"-"}</span
												><span
													class="text-sm font-bold text-blue-700"
													>{encounter.patient_rhesus ===
													"+"
														? "+"
														: encounter.patient_rhesus ===
															  "-"
															? "-"
															: ""}</span
												>
											</div>
										</div>
										<span
											class="material-symbols-outlined text-blue-400 shrink-0"
											>bloodtype</span
										>
									</div>
									<div
										class="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between"
									>
										<div class="flex flex-col flex-1">
											<span
												class="text-[10px] text-blue-600 uppercase font-bold"
												>BP</span
											>
											<div
												class="flex items-baseline gap-1"
											>
												<span
													class="text-lg font-black text-blue-900"
													>{encounter.patient_tekanan_darah ||
														"-"}</span
												><span
													class="text-[10px] font-bold text-blue-700"
													>mmHg</span
												>
											</div>
										</div>
										<span
											class="material-symbols-outlined text-blue-400 shrink-0"
											>vital_signs</span
										>
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
									<div class="mb-8">
										<p
											class="text-[10px] text-slate-400 font-bold uppercase mb-3 flex items-center gap-2"
										>
											Allergies
										</p>
										{#if patientMedicalBackground.allergies?.length > 0}
											<div class="space-y-3">
												{#each patientMedicalBackground.allergies as allergy}<div
														class="bg-red-50 border border-red-100 p-3 rounded-xl flex items-start gap-3"
													>
														<span
															class="material-symbols-outlined text-red-500 text-lg"
															style="font-variation-settings: 'FILL' 1;"
															>warning</span
														>
														<div>
															<p
																class="text-xs font-bold text-red-900 leading-tight"
															>
																{allergy.substance ||
																	"Unknown Substance"}
															</p>
															{#if allergy.reaction_display}<p
																	class="text-[10px] font-medium text-red-700 leading-tight mt-0.5"
																>
																	{allergy.reaction_display}
																</p>{/if}
														</div>
													</div>{/each}
											</div>
										{:else}
											<p
												class="text-[11px] font-medium text-slate-400 italic bg-white p-2.5 rounded-xl border border-dashed border-slate-200 text-center"
											>
												No allergies reported
											</p>
										{/if}
									</div>
									<div class="space-y-8">
										<div class="space-y-3">
											<p
												class="text-[10px] text-slate-400 font-bold uppercase mb-3 flex items-center gap-2"
											>
												Illness / History
											</p>
											<p
												class="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2"
											>
												<span
													class="w-1 h-1 rounded-full bg-orange-400"
												></span>Illness (Personal)
											</p>
											{#if personalDiseases.length > 0}
												{#each personalDiseases as disease}<div
														class="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100"
													>
														<div
															class="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"
														>
															<span
																class="material-symbols-outlined text-[14px]"
																>person</span
															>
														</div>
														<div>
															<p
																class="text-xs font-bold text-slate-800 leading-tight"
															>
																{disease.disease ||
																	"Condition"}
															</p>
															{#if disease.description}<p
																	class="text-[10px] text-slate-500 mt-0.5"
																>
																	{disease.description}
																</p>{/if}
														</div>
													</div>{/each}
											{:else}
												<p
													class="text-[11px] font-medium text-slate-400 italic bg-white p-2.5 rounded-xl border border-dashed border-slate-200 text-center"
												>
													None reported
												</p>
											{/if}
										</div>
										<div class="space-y-3">
											<p
												class="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2"
											>
												<span
													class="w-1 h-1 rounded-full bg-purple-400"
												></span>Illness (Family)
											</p>
											{#if familyDiseases.length > 0}
												{#each familyDiseases as disease}<div
														class="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 border border-purple-100"
													>
														<div
															class="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"
														>
															<span
																class="material-symbols-outlined text-[14px]"
																>family_history</span
															>
														</div>
														<div>
															<p
																class="text-xs font-bold text-slate-800 leading-tight"
															>
																{disease.disease ||
																	"Condition"}
															</p>
															{#if disease.description}<p
																	class="text-[10px] text-slate-500 mt-0.5"
																>
																	{disease.description}
																</p>{/if}
														</div>
													</div>{/each}
											{:else}
												<p
													class="text-[11px] font-medium text-slate-400 italic bg-white p-2.5 rounded-xl border border-dashed border-slate-200 text-center"
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
												{#each patientMedicalBackground.medications as med}<div
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
																{med.dosage_form ||
																	""}
																{med.dosage ||
																	""}
															</p>
														</div>
													</div>{/each}
											{:else}
												<p
													class="text-[11px] font-medium text-slate-400 italic bg-white p-3 rounded-xl border border-dashed border-slate-200 text-center"
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
				</aside>
			{/if}

			<!-- Main Form -->
			<div style="flex: 1; min-width: 0;">
				<!-- Toggle Mode & Actions -->
				<div class="flex justify-between items-center mb-6">
					<div class="flex bg-slate-200/50 p-1 rounded-xl">
						<button
							class="px-6 py-1.5 rounded-lg text-sm font-semibold transition-all {formMode ===
							'SOAP'
								? 'bg-white shadow-sm text-primary'
								: 'text-slate-500 hover:text-slate-700'}"
							on:click={() => (formMode = "SOAP")}>SOAP</button
						>
						<button
							class="px-6 py-1.5 rounded-lg text-sm font-semibold transition-all {formMode ===
							'SOAP_WHO'
								? 'bg-white shadow-sm text-primary'
								: 'text-slate-500 hover:text-slate-700'}"
							on:click={() => (formMode = "SOAP_WHO")}
							>SOAP-WHO</button
						>
					</div>
					<div class="flex gap-3">
						<button
							class="px-5 py-2 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
							disabled={saving}
							on:click={() => saveForm(false)}
						>
							{#if saving}<span class="spinner spinner-sm mr-2"
								></span>{/if}Save Draft
						</button>
					</div>
				</div>

				<!-- SOAP Fields -->
				{#if formMode === "SOAP"}
					<div class="grid grid-cols-2 gap-6 mb-6">
						<div class="space-y-2">
							<label
								class="text-sm font-bold flex items-center gap-2"
								><span
									class="material-symbols-outlined text-slate-400"
									>psychiatry</span
								> Subjective</label
							>
							<textarea
								class="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary h-32 text-sm"
								bind:value={subjective}
								placeholder="Chief complaints, pain levels, history of current illness..."
							></textarea>
						</div>
						<div class="space-y-2">
							<label
								class="text-sm font-bold flex items-center gap-2"
								><span
									class="material-symbols-outlined text-slate-400"
									>visibility</span
								> Objective</label
							>
							<textarea
								class="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary h-32 text-sm"
								bind:value={objective}
								placeholder="Clinical findings, extraoral & intraoral exam results..."
							></textarea>
						</div>
						<div class="space-y-2">
							<label
								class="text-sm font-bold flex items-center gap-2"
								><span
									class="material-symbols-outlined text-slate-400"
									>diagnosis</span
								> Assessment</label
							>
							<textarea
								class="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary h-32 text-sm"
								bind:value={assessment}
								placeholder="Diagnosis..."
							></textarea>
						</div>
						<div class="space-y-2">
							<label
								class="text-sm font-bold flex items-center gap-2"
								><span
									class="material-symbols-outlined text-slate-400"
									>list_alt</span
								> Plan</label
							>
							<textarea
								class="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary h-32 text-sm"
								bind:value={plan}
								placeholder="Treatment plan, counseling, follow-up..."
							></textarea>
						</div>
					</div>
				{/if}

				<!-- Odontogram (only for SOAP_WHO) -->
				{#if formMode === "SOAP_WHO"}
					<!-- Encounter Reason Form -->
					<div
						class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6"
					>
						<h3
							class="text-base font-bold flex items-center gap-2 text-slate-800 m-0 mb-4 pb-4 border-b border-slate-50"
						>
							<span class="material-symbols-outlined text-primary"
								>search</span
							>
							Keluhan Utama
						</h3>
						<div class="max-w-xl">
							<label
								class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1"
								>Cari Keluhan Utama</label
							>
							<div
								class="[&>div.form-group]:mb-0 [&_input]:w-full [&_input]:py-3 [&_input]:rounded-xl [&_input]:border-slate-200 [&_input]:bg-slate-50 [&_input]:focus:ring-primary/10 [&_input]:focus:border-primary"
							>
								<SearchableSelect
									placeholder="Cari keluhan (SNOMED)..."
									searchFn={searchClinicalFinding}
									bind:value={newReasonCode}
									on:select={(e) => {
										newReasonDisplay = e.detail.label;
									}}
								/>
							</div>
							{#if !newReasonCode && reasonDisplay}
								<p
									class="mt-3 text-[11px] text-slate-400 font-medium px-1 flex items-center gap-1.5"
								>
									<span
										class="material-symbols-outlined text-xs"
										>info</span
									>
									Current:
									<span class="text-slate-600 font-bold"
										>{reasonDisplay}</span
									>
								</p>
							{/if}
						</div>
					</div>

					<div
						class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-6"
					>
						<div
							class="flex items-center justify-between border-b border-slate-100 pb-4 mb-6"
						>
							<h3
								class="text-base font-bold flex items-center gap-2 text-slate-800 m-0"
							>
								<span
									class="material-symbols-outlined text-primary"
									>dentistry</span
								>
								Odontogram (PDGI Standard)
							</h3>
							<button
								type="button"
								class="text-[11px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors flex items-center gap-1"
								on:click={resetOdontogram}
							>
								<span
									class="material-symbols-outlined text-[14px]"
									>refresh</span
								> Reset
							</button>
						</div>

						<div class="w-full overflow-x-auto pb-4 mb-4">
							<OdontogramChart
								odontogramData={mappedOdontogramData}
								{selectedTooth}
								{selectedSurfaceArea}
								on:toothClick={(e) =>
									handleToothClick(
										e.detail.tooth,
										e.detail.surface,
										{
											shiftKey: e.detail.shiftKey,
										},
									)}
							/>
						</div>

						<!-- Odontogram Metadata -->
						<div
							class="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-6"
						>
							<h4
								class="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"
							>
								<span
									class="material-symbols-outlined text-slate-400 text-[18px]"
									>info</span
								>
								Kondisi Ekstraoral & Intraoral
							</h4>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div class="space-y-2">
									<label
										class="text-xs font-bold text-slate-500 block"
										for="occlusi-sel">Occlusi</label
									>
									<select
										id="occlusi-sel"
										class="w-full rounded-xl border-slate-200 text-sm focus:border-primary focus:ring-primary bg-white shadow-sm"
										bind:value={odontogram.occlusi}
									>
										<option value=""
											>-- Pilih Occlusi --</option
										>
										{#each OCCLUSI_OPTIONS as opt}
											<option value={opt}>{opt}</option>
										{/each}
									</select>
								</div>
								<div class="space-y-2">
									<label
										class="text-xs font-bold text-slate-500 block"
										for="tp-sel">Torus Palatinus</label
									>
									<select
										id="tp-sel"
										class="w-full rounded-xl border-slate-200 text-sm focus:border-primary focus:ring-primary bg-white shadow-sm"
										bind:value={odontogram.torus_palatinus}
									>
										{#each TORUS_PALATINUS_OPTIONS as opt}
											<option value={opt}>{opt}</option>
										{/each}
									</select>
								</div>
								<div class="space-y-2">
									<label
										class="text-xs font-bold text-slate-500 block"
										for="tm-sel">Torus Mandibularis</label
									>
									<select
										id="tm-sel"
										class="w-full rounded-xl border-slate-200 text-sm focus:border-primary focus:ring-primary bg-white shadow-sm"
										bind:value={
											odontogram.torus_mandibularis
										}
									>
										{#each TORUS_MANDIBULARIS_OPTIONS as opt}
											<option value={opt}>{opt}</option>
										{/each}
									</select>
								</div>
								<div class="space-y-2">
									<label
										class="text-xs font-bold text-slate-500 block"
										for="palatum-sel">Palatum</label
									>
									<select
										id="palatum-sel"
										class="w-full rounded-xl border-slate-200 text-sm focus:border-primary focus:ring-primary bg-white shadow-sm"
										bind:value={odontogram.palatum}
									>
										<option value=""
											>-- Pilih Palatum --</option
										>
										{#each PALATUM_OPTIONS as opt}
											<option value={opt}>{opt}</option>
										{/each}
									</select>
								</div>
								<div class="space-y-2">
									<label
										class="text-xs font-bold text-slate-500 block"
										for="diastema-inp">Diastema</label
									>
									<input
										id="diastema-inp"
										class="w-full rounded-xl border-slate-200 text-sm focus:border-primary focus:ring-primary bg-white shadow-sm placeholder:text-slate-300"
										bind:value={odontogram.diastema}
										placeholder="Tidak Ada / lokasi dan lebar"
									/>
								</div>
								<div class="space-y-2">
									<label
										class="text-xs font-bold text-slate-500 block"
										for="anomali-inp">Gigi Anomali</label
									>
									<input
										id="anomali-inp"
										class="w-full rounded-xl border-slate-200 text-sm focus:border-primary focus:ring-primary bg-white shadow-sm placeholder:text-slate-300"
										bind:value={odontogram.gigi_anomali}
										placeholder="Tidak Ada / lokasi dan bentuk"
									/>
								</div>
							</div>
						</div>

						<!-- Conditions Table -->
						{#if odontogram.details.length > 0}
							<h4
								class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"
							>
								<span
									class="material-symbols-outlined text-slate-400 text-[18px]"
									>format_list_bulleted</span
								>
								Detail Kondisi Gigi
							</h4>
							<div
								class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
							>
								<div class="overflow-x-auto">
									<table
										class="w-full text-left text-sm whitespace-nowrap"
									>
										<thead
											class="bg-slate-50 border-b border-slate-200 text-slate-500"
										>
											<tr>
												<th
													class="px-4 py-3.5 font-semibold"
													>Gigi</th
												>
												<th
													class="px-4 py-3.5 font-semibold"
													>Permukaan</th
												>
												<th
													class="px-4 py-3.5 font-semibold"
													>Keadaan</th
												>
												<th
													class="px-4 py-3.5 font-semibold"
													>Restorasi</th
												>
												<th
													class="px-4 py-3.5 font-semibold"
													>Diagnosa</th
												>
												<th
													class="px-4 py-3.5 font-semibold"
													>Tindakan</th
												>
											</tr>
										</thead>
										<tbody
											class="divide-y divide-slate-100"
										>
											{#each odontogram.details as d}
												<tr
													class="hover:bg-slate-50 cursor-pointer transition-colors"
													on:click={() => {
														toothDetail = { ...d };
														selectedTooth =
															d.tooth_number;
														showToothModal = true;
													}}
												>
													<td class="px-4 py-3">
														<div
															class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20"
														>
															{d.tooth_number}
														</div>
													</td>
													<td class="px-4 py-3">
														{#if d.restorations && d.restorations.length > 0}
															<div
																class="flex flex-wrap gap-1"
															>
																{#each [...new Set(d.restorations.flatMap((r) => r.surfaces))] as s}
																	<span
																		class="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold border border-indigo-100"
																		>{s}</span
																	>
																{/each}
															</div>
														{:else if d.surface}
															<span
																class="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold"
																>{d.surface}</span
															>
														{:else}
															<span
																class="text-slate-300"
																>-</span
															>
														{/if}
													</td>
													<td class="px-4 py-3">
														{#if d.keadaan}
															{@const isBad =
																d.keadaan ===
																	"car" ||
																d.keadaan ===
																	"mis"}
															{@const isGood =
																d.keadaan ===
																"sou"}
															<span
																class="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider
															{isBad
																	? 'bg-red-50 text-red-600 border border-red-100'
																	: isGood
																		? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
																		: 'bg-slate-100 text-slate-600 border border-slate-200'}"
															>
																{lookupLabel(
																	KEADAAN,
																	d.keadaan,
																)}
															</span>
														{:else}
															<span
																class="text-slate-300"
																>-</span
															>
														{/if}
													</td>
													<td
														class="px-4 py-3 font-medium text-slate-600"
													>
														{#if d.restorations && d.restorations.length > 0}
															<ul
																class="list-none p-0 m-0 space-y-1"
															>
																{#each d.restorations as r}
																	<li
																		class="text-[11px] leading-tight flex flex-col"
																	>
																		<span
																			class="font-bold text-indigo-600"
																			>{lookupLabel(
																				RESTORASI,
																				r.restorasi,
																			) ||
																				"Restorasi"}</span
																		>
																		{#if r.bahan_restorasi}
																			<span
																				class="text-[9px] text-slate-400"
																				>{lookupLabel(
																					BAHAN_RESTORASI,
																					r.bahan_restorasi,
																				)}</span
																			>
																		{/if}
																	</li>
																{/each}
															</ul>
														{:else}
															{d.restorasi
																? lookupLabel(
																		RESTORASI,
																		d.restorasi,
																	)
																: "-"}
														{/if}
													</td>
													<td
														class="px-4 py-3 text-slate-600"
													>
														{#if d.diagnoses && d.diagnoses.length > 0}
															<ul
																class="list-none p-0 m-0 space-y-1"
															>
																{#each d.diagnoses as diag}
																	<li
																		class="text-[11px] leading-tight"
																	>
																		<span
																			class="font-bold text-red-600"
																			>{diag.diagnosis_code ||
																				"ICD-10"}</span
																		>
																		- {diag.diagnosis_display}
																	</li>
																{/each}
															</ul>
														{:else}
															{d.diagnosis_display ||
																"-"}
														{/if}
													</td>
													<td
														class="px-4 py-3 text-slate-600"
													>
														{#if d.procedures && d.procedures.length > 0}
															<ul
																class="list-none p-0 m-0 space-y-1"
															>
																{#each d.procedures as proc}
																	<li
																		class="text-[11px] leading-tight"
																	>
																		<span
																			class="font-bold text-emerald-600"
																			>{proc.procedure_code ||
																				"ICD-9"}</span
																		>
																		- {proc.procedure_display}
																	</li>
																{/each}
															</ul>
														{:else}
															{d.procedure_display ||
																"-"}
														{/if}
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							</div>
						{/if}
					</div>
				{/if}
				<!-- Prescriptions Section -->
				<section
					class="rounded-3xl p-8 border border-primary/10 mb-8 overflow-hidden relative"
					style="background: linear-gradient(135deg, rgba(60, 60, 246, 0.03) 0%, rgba(60, 60, 246, 0.08) 100%);"
				>
					<div class="flex items-center justify-between mb-6">
						<h3
							class="text-lg font-bold flex items-center gap-3 text-slate-800"
						>
							<div
								class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
							>
								<span
									class="material-symbols-outlined text-[24px]"
									>pill</span
								>
							</div>
							Prescriptions (KFA)
						</h3>
						{#if prescriptions.length > 0}
							<span
								class="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest"
							>
								{prescriptions.length} Item(s)
							</span>
						{/if}
					</div>

					<div class="space-y-6">
						<!-- Input Grid Row 1 -->
						<div class="grid grid-cols-12 gap-4 items-end">
							<div class="col-span-12 lg:col-span-6">
								<div
									class="flex justify-between items-center mb-2 px-1"
								>
									<label
										class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
										>Product Name</label
									>
									<div
										class="flex p-0.5 bg-slate-200/50 rounded-lg w-fit"
									>
										<button
											type="button"
											class="px-3 py-1 text-[9px] font-black rounded-md transition-all {newRx.merk_type ===
											'known'
												? 'bg-white text-primary shadow-sm'
												: 'text-slate-500 hover:text-slate-700'}"
											on:click={() => {
												newRx.merk_type = "known";
											}}>MERK KNOWN</button
										>
										<button
											type="button"
											class="px-3 py-1 text-[9px] font-black rounded-md transition-all {newRx.merk_type ===
											'unknown'
												? 'bg-white text-primary shadow-sm'
												: 'text-slate-500 hover:text-slate-700'}"
											on:click={() => {
												newRx.merk_type = "unknown";
											}}>MERK UNKNOWN</button
										>
									</div>
								</div>
								<SearchableSelect
									searchFn={(term) =>
										searchMedication(term, newRx.merk_type)}
									placeholder="Cari produk obat (KFA)..."
									wrapperClass="w-full"
									inputClass="w-full py-3 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm text-sm focus:ring-primary focus:border-primary shadow-sm transition-all"
									value={newRx.kfa_code}
									on:select={(e) => {
										newRx.kfa_code = e.detail.value;
										newRx.product_name = e.detail.label;
										newRx.dosage_form =
											e.detail.dosage_form || "";
									}}
								/>
							</div>
							<div
								class="col-span-12 md:col-span-8 lg:col-span-4"
							>
								<label
									class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
									>Dosage</label
								>
								<div class="relative flex items-center">
									<input
										class="w-full py-3 pl-4 pr-20 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm text-sm focus:ring-primary focus:border-primary shadow-sm"
										placeholder="e.g. 3 x 1, pc"
										type="text"
										bind:value={newRx.dosage}
									/>
									{#if newRx.dosage_form}
										<div
											class="absolute right-3 px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-200"
										>
											{newRx.dosage_form}
										</div>
									{/if}
								</div>
							</div>
							<div
								class="col-span-12 md:col-span-4 lg:col-span-2"
							>
								<label
									class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
									>Quantity</label
								>
								<input
									class="w-full py-3 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm text-sm font-bold text-center focus:ring-primary focus:border-primary shadow-sm"
									type="number"
									bind:value={newRx.quantity}
								/>
							</div>
						</div>

						<!-- Input Grid Row 2 (Instruction) -->
						<div class="grid grid-cols-12 gap-4 items-end">
							<div class="col-span-12 md:col-span-11">
								<label
									class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
									>Special Instruction</label
								>
								<div class="relative flex items-center">
									<span
										class="material-symbols-outlined absolute left-4 text-slate-300 text-[18px]"
										>info</span
									>
									<input
										class="w-full py-3 pl-10 pr-4 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm text-sm focus:ring-primary focus:border-primary shadow-sm placeholder:text-slate-300"
										placeholder="e.g. Sesudah makan / Habiskan obat / Jika demam saja"
										type="text"
										bind:value={newRx.instruction}
									/>
								</div>
							</div>
							<div class="col-span-12 md:col-span-1">
								<button
									type="button"
									class="w-full aspect-square md:aspect-auto md:h-[46px] flex items-center justify-center rounded-2xl bg-primary text-white hover:brightness-110 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 group"
									on:click={addPrescription}
									title="Tambah Resep"
								>
									<span
										class="material-symbols-outlined text-[24px] group-hover:rotate-90 transition-transform"
										>add</span
									>
								</button>
							</div>
						</div>

						<!-- Separator -->
						{#if prescriptions.length > 0}
							<div class="h-px bg-slate-100 my-2"></div>
						{/if}

						<!-- Added Item Chips -->
						<div class="grid grid-cols-1 gap-4">
							{#each prescriptions as rx, i}
								<div
									class="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:border-primary/20 hover:shadow-md transition-all group flex items-start gap-4"
								>
									<div
										class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-primary/5 group-hover:text-primary transition-colors"
									>
										<span
											class="material-symbols-outlined text-[24px]"
											style="font-variation-settings: 'FILL' 1;"
											>medication</span
										>
									</div>
									<div class="flex-1 min-w-0 pt-1">
										<h4
											class="text-sm font-bold text-slate-800 mb-1 truncate"
											title={rx.product_name}
										>
											{rx.product_name}
										</h4>
										<div
											class="flex flex-wrap items-center gap-x-4 gap-y-1.5"
										>
											<div
												class="flex items-center gap-1.5"
											>
												<span
													class="text-[10px] font-black text-slate-300 uppercase tracking-widest"
													>Dosage</span
												>
												<span
													class="text-xs font-bold text-slate-600"
													>{rx.dosage || "-"}</span
												>
											</div>
											<div
												class="flex items-center gap-1.5"
											>
												<span
													class="text-[10px] font-black text-slate-300 uppercase tracking-widest"
													>Qty</span
												>
												<span
													class="text-xs font-bold text-slate-600"
													>{rx.quantity}
													<span
														class="text-slate-400 font-medium"
														>{rx.dosage_form}</span
													></span
												>
											</div>
											<div
												class="flex items-center gap-1.5"
											>
												<span
													class="text-[10px] font-black text-slate-300 uppercase tracking-widest"
													>KFA</span
												>
												<span
													class="text-xs font-medium text-slate-400 font-mono"
													>{rx.kfa_code}</span
												>
											</div>
										</div>
										{#if rx.instruction}
											<div
												class="mt-3 p-2 px-3 bg-primary/5 rounded-xl border border-primary/10 inline-flex items-center gap-2"
											>
												<span
													class="material-symbols-outlined text-primary text-[16px]"
													>info</span
												>
												<p
													class="text-[11px] font-bold text-primary italic leading-none"
												>
													{rx.instruction}
												</p>
											</div>
										{/if}
									</div>
									<button
										type="button"
										class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all shrink-0 mt-1"
										on:click={() => removePrescription(i)}
										title="Hapus"
									>
										<span
											class="material-symbols-outlined text-[20px]"
											>delete</span
										>
									</button>
								</div>
							{/each}

							{#if prescriptions.length === 0}
								<div
									class="py-8 flex flex-col items-center justify-center bg-white/40 rounded-3xl border-2 border-dashed border-slate-100"
								>
									<div
										class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-3"
									>
										<span
											class="material-symbols-outlined text-3xl"
											>medication</span
										>
									</div>
									<p
										class="text-xs font-bold text-slate-400 uppercase tracking-widest"
									>
										Belum ada resep ditambahkan
									</p>
								</div>
							{/if}
						</div>
					</div>
				</section>

				<!-- Keterangan -->
				<section
					class="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-6"
				>
					<h3
						class="text-base font-bold mb-4 flex items-center gap-2"
					>
						<span class="material-symbols-outlined text-primary"
							>note_alt</span
						>
						Keterangan
					</h3>
					<div>
						<label
							class="text-xs font-bold text-slate-500 mb-1 block"
							>Keterangan Tambahan</label
						>
						<textarea
							class="w-full rounded-xl border-slate-200 text-sm focus:ring-primary focus:border-primary"
							bind:value={keterangan}
							rows="3"
							placeholder="Catatan tambahan..."
						></textarea>
					</div>
				</section>

				<!-- Referrals -->
				<section
					class="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-6"
				>
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-base font-bold flex items-center gap-2">
							<span class="material-symbols-outlined text-primary"
								>forward</span
							>
							Rujukan
						</h3>
						{#if !showRujukanForm}
							<button
								type="button"
								class="px-4 py-1.5 bg-white border border-slate-200 hover:bg-primary/5 text-primary text-sm font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
								on:click={() => (showRujukanForm = true)}
							>
								<span
									class="material-symbols-outlined text-[18px]"
									>add</span
								> Tambah
							</button>
						{/if}
					</div>
					{#if showRujukanForm}
						<div
							class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
						>
							<div>
								<label
									class="text-xs font-bold text-slate-500 mb-1 block"
									>Dokter</label
								>
								<select
									class="w-full rounded-xl border-slate-200 text-sm focus:ring-primary focus:border-primary bg-slate-50/50"
									bind:value={newRef.doctor_code}
								>
									<option value="">-- Pekerja Medis --</option
									>
									{#each doctorsList as doc}
										<option value={doc.doctor_code}
											>{doc.doctor_code} - {doc.name}</option
										>
									{/each}
								</select>
							</div>
							<div>
								<label
									class="text-xs font-bold text-slate-500 mb-1 block"
									>Tanggal Berakhir</label
								>
								<input
									type="date"
									class="w-full rounded-xl border-slate-200 text-sm focus:ring-primary focus:border-primary bg-slate-50/50"
									bind:value={newRef.referral_date}
								/>
							</div>
							<div class="md:col-span-2 flex gap-3">
								<div class="flex-1">
									<label
										class="text-xs font-bold text-slate-500 mb-1 block"
										>Catatan Rujukan</label
									>
									<input
										class="w-full rounded-xl border-slate-200 text-sm focus:ring-primary focus:border-primary bg-slate-50/50"
										bind:value={newRef.note}
										placeholder="Catatan rujukan..."
									/>
								</div>
								<div class="flex gap-2">
									<label
										class="text-[0px] block mb-1 opacity-0"
										>-</label
									>
									<button
										type="button"
										class="aspect-square w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
										on:click={() => {
											showRujukanForm = false;
											newRef = {
												doctor_code: "",
												doctor_name: "",
												referral_date: "",
												note: "",
											};
										}}
									>
										<span
											class="material-symbols-outlined text-[20px]"
											>close</span
										>
									</button>
									<button
										type="button"
										class="aspect-square w-10 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
										on:click={addReferral}
									>
										<span
											class="material-symbols-outlined text-[20px]"
											>add</span
										>
									</button>
								</div>
							</div>
						</div>
					{/if}

					<!-- Added Referrals Chips -->
					<div class="space-y-3">
						{#each referrals as ref, i}
							<div
								class="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm"
							>
								<span
									class="material-symbols-outlined text-slate-400"
									>forward</span
								>
								<div class="flex-1">
									<p class="text-sm font-bold">
										{ref.doctor_name || ref.doctor_code}
									</p>
									<p class="text-xs text-slate-500">
										{#if ref.referral_date}Batas: {new Date(
												ref.referral_date,
											).toLocaleDateString("id-ID")} |
										{/if}
										{ref.note || "Tanpa catatan"}
									</p>
								</div>
								<button
									type="button"
									class="text-slate-400 hover:text-red-500 transition-colors"
									on:click={() => removeReferral(i)}
								>
									<span class="material-symbols-outlined"
										>delete</span
									>
								</button>
							</div>
						{/each}
						{#if referrals.length === 0}
							<p
								class="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-200 rounded-xl bg-white/50"
							>
								Belum ada rujukan
							</p>
						{/if}
					</div>
				</section>

				<!-- Encounter Items -->
				<section
					class="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-6"
				>
					<div class="flex items-center justify-between mb-4">
						<h3 class="text-base font-bold flex items-center gap-2">
							<span class="material-symbols-outlined text-primary"
								>shopping_cart</span
							>
							Item Tindakan
						</h3>
					</div>
					<div
						class="flex flex-col md:flex-row gap-3 items-end p-4 mb-4 bg-white rounded-xl border border-slate-200 shadow-sm"
					>
						<div class="w-full md:flex-1">
							<label
								class="text-xs font-bold text-slate-500 mb-1 block"
								>Pilih Item</label
							>
							<select
								class="w-full rounded-xl border-slate-200 text-sm focus:ring-primary focus:border-primary bg-slate-50/50"
								bind:value={newItem.item_id}
								on:change={() =>
									onNewItemSelect(newItem.item_id)}
							>
								<option value="">-- Pilih Item --</option>
								{#each availableItems as ai}
									<option value={ai.id}
										>{ai.name} ({ai.item_group ||
											"-"})</option
									>
								{/each}
							</select>
						</div>
						<div class="w-full md:w-12">
							<label
								class="text-xs font-bold text-slate-500 mb-1 block"
								>Qty</label
							>
							<input
								type="number"
								class="w-full rounded-xl border-slate-200 text-sm focus:ring-primary focus:border-primary bg-slate-50/50"
								bind:value={newItem.quantity}
								min="1"
								on:input={updateNewItemSubtotal}
							/>
						</div>
						<div class="w-full md:w-28">
							<label
								class="text-xs font-bold text-slate-500 mb-1 block"
								>Harga</label
							>
							<input
								class="w-full rounded-xl border-slate-200 bg-slate-100/50 text-sm text-slate-500"
								value={newItem.price_at_time}
								disabled
							/>
						</div>
						<div class="w-full md:w-40 flex gap-3 items-end">
							<div class="flex-1">
								<label
									class="text-xs font-bold text-slate-500 mb-1 block"
									>Subtotal</label
								>
								<input
									class="w-full rounded-xl border-slate-200 bg-slate-100/50 text-sm font-bold text-slate-700"
									value={newItem.subtotal}
									disabled
								/>
							</div>
							<div>
								<button
									type="button"
									class="aspect-square w-10 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
									on:click={addEncounterItem}
								>
									<span
										class="material-symbols-outlined text-[20px]"
										>add</span
									>
								</button>
							</div>
						</div>
					</div>

					<!-- Added Items Chips -->
					<div class="space-y-3">
						{#each encounterItems as item, i}
							<div
								class="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm"
							>
								<span
									class="material-symbols-outlined text-slate-400"
									>shopping_cart</span
								>
								<div class="flex-1">
									<p class="text-sm font-bold">
										{item.item_name || "Item Tindakan"}
									</p>
									<p class="text-xs text-slate-500">
										Harga: Rp {item.price_at_time?.toLocaleString(
											"id-ID",
										) || 0} | Qty: {item.quantity} |
										<strong class="text-primary"
											>Subtotal: Rp {item.subtotal?.toLocaleString(
												"id-ID",
											) || 0}</strong
										>
									</p>
								</div>
								<button
									type="button"
									class="text-slate-400 hover:text-red-500 transition-colors"
									on:click={() => removeEncounterItem(i)}
								>
									<span class="material-symbols-outlined"
										>delete</span
									>
								</button>
							</div>
						{/each}
						{#if encounterItems.length === 0}
							<p
								class="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-200 rounded-xl bg-white/50"
							>
								Belum ada item tindakan
							</p>
						{/if}
					</div>
				</section>

				<!-- Clinical Photo Section -->
				<div
					class="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-10 overflow-hidden relative"
				>
					<div
						class="flex items-center justify-between mb-8 pb-6 border-b border-slate-100"
					>
						<h3
							class="text-lg font-bold flex items-center gap-3 text-slate-800 m-0"
						>
							<div
								class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
							>
								<span
									class="material-symbols-outlined text-[24px]"
									>add_a_photo</span
								>
							</div>
							Clinical Documentation Photos
						</h3>
						{#if clinicalPhotos.length > 0}
							<span
								class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest"
								>{clinicalPhotos.length} Photo(s)</span
							>
						{/if}
					</div>

					<div class="space-y-8">
						<!-- Gallery Grid -->
						<div
							class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
						>
							{#each clinicalPhotos as photo (photo.id)}
								<div
									class="aspect-square rounded-2xl border border-slate-200 bg-slate-50 relative group overflow-hidden transition-all hover:ring-4 hover:ring-primary/10 shadow-sm"
								>
									<img
										src="/api/documents/{photo.id}"
										alt={photo.file_name}
										class="w-full h-full object-cover"
									/>
									<div
										class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"
									>
										<button
											type="button"
											class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors flex items-center justify-center"
											on:click={() =>
												deletePhoto(photo.id)}
											title="Hapus Foto"
										>
											<span
												class="material-symbols-outlined text-[18px]"
												>delete</span
											>
										</button>
										<p
											class="text-[9px] font-bold text-white uppercase tracking-widest"
										>
											Delete
										</p>
									</div>
								</div>
							{/each}

							<!-- Upload Box -->
							{#if uploadingPhoto}
								<div
									class="aspect-square rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-3"
								>
									<span
										class="spinner spinner-md text-primary"
									></span>
									<span
										class="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse"
										>Uploading</span
									>
								</div>
							{:else}
								<label
									class="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer group hover:border-primary/40 hover:bg-slate-100/50 transition-all shadow-inner"
								>
									<div
										class="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-primary transition-all duration-300"
									>
										<span
											class="material-symbols-outlined text-3xl"
											>add</span
										>
									</div>
									<span
										class="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest group-hover:text-primary transition-colors"
										>Add Photo</span
									>
									<input
										type="file"
										class="hidden"
										accept="image/*"
										on:change={handlePhotoUpload}
									/>
								</label>
							{/if}
						</div>

						<div
							class="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-50"
						>
							<div
								class="flex-1 bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 relative overflow-hidden"
							>
								<div
									class="absolute top-0 right-0 p-2 opacity-10"
								>
									<span
										class="material-symbols-outlined text-4xl text-blue-700"
										>info</span
									>
								</div>
								<p
									class="text-xs text-blue-700 font-medium leading-relaxed"
								>
									<span
										class="font-bold text-blue-800 block mb-1"
										>DOKUMENTASI KLINIS:</span
									>
									Dokumentasi visual sangat membantu dalam diagnosa
									dan pemantauan perkembangan kasus pasien. Foto
									yang diunggah akan secara otomatis terlampir
									pada resume medis PDF dan terenkripsi aman.
								</p>
							</div>

							<div
								class="grid grid-cols-2 gap-4 w-full md:w-auto md:min-w-[300px]"
							>
								<div
									class="p-4 rounded-2xl border border-slate-100 bg-slate-50/30"
								>
									<p
										class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1"
									>
										Status
									</p>
									<p
										class="text-xs font-bold {clinicalPhotos.length >
										0
											? 'text-emerald-600'
											: 'text-slate-500'}"
									>
										{clinicalPhotos.length > 0
											? "Dokumen Terlampir"
											: "Belum Ada Foto"}
									</p>
								</div>
								<div
									class="p-4 rounded-2xl border border-slate-100 bg-slate-50/30"
								>
									<p
										class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1"
									>
										Tipe Dokumen
									</p>
									<p class="text-xs font-bold text-slate-700">
										Foto Klinis
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- End of Sections -->
				<div
					class="mt-8 pt-6 border-t border-slate-100 flex justify-end"
				>
					<button
						class="px-8 py-3 bg-primary text-white rounded-xl text-base font-bold shadow-lg shadow-primary/25 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
						disabled={saving}
						on:click={() => saveForm(true)}
					>
						{#if saving}<span class="spinner spinner-sm mr-2"
							></span>{/if}
						<span class="material-symbols-outlined text-[20px]"
							>check_circle</span
						>
						Submit & Selesaikan Encounter
					</button>
				</div>
				<!-- (Actions moved to bottom) -->
			</div>

			<!-- Patient Context Sidebar -->
			{#if showSidebar}
				<aside
					class="w-[480px] shrink-0 border-l border-slate-200 bg-white ml-2 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] sticky top-[80px]"
				>
					<!-- Header -->
					<div
						class="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center z-10 shrink-0"
					>
						<h3
							class="text-lg font-bold flex items-center gap-2 text-slate-800"
						>
							<span class="material-symbols-outlined text-primary"
								>timeline</span
							>
							Encounter Timeline
						</h3>
						<button
							class="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-full transition-colors shadow-sm"
							on:click={() => (showSidebar = false)}
							title="Refresh or Close"
						>
							<span class="material-symbols-outlined text-[18px]"
								>close</span
							>
						</button>
					</div>

					<!-- Content -->
					<div
						class="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50"
					>
						{#if encounter}
							{#if patientHistory?.length > 0}
								<div
									class="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200"
								>
									{#each patientHistory as hist}
										<div
											class="relative pl-12 pb-10 last:pb-0 group"
										>
											<!-- Activity Indicator Dot -->
											<div
												class="absolute left-0 top-1 size-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10
												{(STATUS_THEMES[hist.encounter?.status] || STATUS_THEMES.default).bg} 
												{(STATUS_THEMES[hist.encounter?.status] || STATUS_THEMES.default).text}"
											>
												<span
													class="material-symbols-outlined text-lg"
												>
													{(
														STATUS_THEMES[
															hist.encounter
																?.status
														] ||
														STATUS_THEMES.default
													).icon}
												</span>
											</div>

											<!-- Card Content -->
											<div
												class="bg-white rounded-2xl border border-slate-200 p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
											>
												<div
													class="flex flex-col gap-4"
												>
													<!-- Header: Date & Status -->
													<div
														class="flex flex-col gap-2"
													>
														<div
															class="flex items-center justify-between"
														>
															<span
																class="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full"
															>
																{new Date(
																	hist.encounter?.created_at,
																).toLocaleDateString(
																	"id-ID",
																	{
																		month: "short",
																		day: "numeric",
																		year: "numeric",
																	},
																)}
															</span>

															<div
																class="px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1.5 {(
																	STATUS_THEMES[
																		hist
																			.encounter
																			?.status
																	] ||
																	STATUS_THEMES.default
																).badge}"
															>
																<span
																	class="size-1 rounded-full {(
																		STATUS_THEMES[
																			hist
																				.encounter
																				?.status
																		] ||
																		STATUS_THEMES.default
																	).dot}"
																></span>
																{hist.encounter
																	?.status ||
																	"Unknown"}
															</div>
														</div>
														<h4
															class="text-base font-bold text-slate-800 line-clamp-2 leading-snug"
														>
															{hist.encounter_reason_display ||
																hist.encounter
																	?.subjective ||
																"Kunjungan Pasien"}
														</h4>
													</div>

													<!-- Provider Info -->
													<div
														class="flex items-center gap-2.5 bg-slate-50 border border-slate-100 p-2.5 rounded-xl"
													>
														<div
															class="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm"
														>
															<span
																class="material-symbols-outlined text-[18px]"
																>stethoscope</span
															>
														</div>
														<div>
															<p
																class="text-[9px] text-slate-400 uppercase font-black leading-none mb-0.5"
															>
																Primary Provider
															</p>
															<p
																class="text-[11px] font-bold text-slate-700 leading-tight"
															>
																{hist.doctor_name ||
																	"Dokter Oratio"}
															</p>
														</div>
													</div>

													<!-- SOAP Summary Box -->
													<div
														class="relative bg-slate-50/50 p-4 rounded-xl border border-slate-100 border-l-4 border-primary/20"
													>
														<div
															class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5"
														>
															<span
																class="material-symbols-outlined text-xs"
																>description</span
															>
															SOAP Summary
														</div>

														<div
															class="text-xs text-slate-600 leading-relaxed space-y-2"
														>
															{#if hist.encounter?.subjective}
																<div
																	class="flex gap-2"
																>
																	<span
																		class="font-black text-slate-800 min-w-4 text-center bg-slate-200/50 rounded h-fit px-1"
																		>S</span
																	>
																	<span
																		class="whitespace-pre-wrap"
																		>{hist
																			.encounter
																			.subjective}</span
																	>
																</div>
															{/if}
															{#if hist.encounter?.objective}
																<div
																	class="flex gap-2"
																>
																	<span
																		class="font-black text-slate-800 min-w-4 text-center bg-slate-200/50 rounded h-fit px-1"
																		>O</span
																	>
																	<span
																		class="whitespace-pre-wrap"
																		>{hist
																			.encounter
																			.objective}</span
																	>
																</div>
															{/if}
															{#if hist.encounter?.assessment}
																<div
																	class="flex gap-2"
																>
																	<span
																		class="font-black text-slate-800 min-w-4 text-center bg-slate-200/50 rounded h-fit px-1"
																		>A</span
																	>
																	<span
																		class="whitespace-pre-wrap"
																		>{hist
																			.encounter
																			.assessment}</span
																	>
																</div>
															{/if}
															{#if hist.encounter?.plan}
																<div
																	class="flex gap-2"
																>
																	<span
																		class="font-black text-slate-800 min-w-4 text-center bg-slate-200/50 rounded h-fit px-1"
																		>P</span
																	>
																	<span
																		class="whitespace-pre-wrap"
																		>{hist
																			.encounter
																			.plan}</span
																	>
																</div>
															{/if}
															{#if hist.encounter?.resep}
																<div
																	class="flex gap-2"
																>
																	<span
																		class="font-black text-slate-800 min-w-4 text-center bg-slate-200/50 rounded h-fit px-1"
																		>R</span
																	>
																	<span
																		class="italic text-slate-500 font-medium whitespace-pre-wrap"
																		>{hist
																			.encounter
																			.resep}</span
																	>
																</div>
															{/if}

															{#if !hist.encounter?.subjective && !hist.encounter?.objective && !hist.encounter?.assessment && !hist.encounter?.plan && !hist.encounter?.resep && !hist.encounter?.keterangan}
																<span
																	class="italic text-slate-400 text-[11px]"
																	>Belum ada
																	catatan
																	klinis
																	(SOAP)
																	tersimpan.</span
																>
															{/if}
														</div>

														{#if hist.encounter?.keterangan}
															<div
																class="mt-4 p-3 bg-amber-50/50 rounded-lg border border-amber-100/50 text-amber-800 text-[11px] italic leading-relaxed"
															>
																<span
																	class="font-black not-italic block mb-1 text-[9px] uppercase tracking-widest text-amber-600/60"
																	>Catatan
																	Khusus</span
																>
																{hist.encounter
																	.keterangan}
															</div>
														{/if}

														<button
															class="mt-5 w-full py-2.5 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm group/btn"
															on:click={() =>
																window.open(
																	`/dokter/${hist.encounter?.id}`,
																	"_blank",
																)}
														>
															LIHAT DETAIL PENUH
															<span
																class="material-symbols-outlined text-[14px] group-hover/btn:translate-x-1 transition-transform"
																>arrow_right_alt</span
															>
														</button>
													</div>
												</div>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div
									class="flex flex-col items-center justify-center py-20 text-center opacity-50"
								>
									<span
										class="material-symbols-outlined text-6xl text-slate-300 mb-4"
										>history_toggle_off</span
									>
									<p class="text-slate-500 font-medium">
										Belum ada riwayat kunjungan
									</p>
								</div>
							{/if}
						{/if}
					</div>
				</aside>
			{/if}
		</div>
	{/if}
</div>

<!-- Button to Reopen Sidebar when collapsed -->
{#if encounter && !showSidebar}
	<button
		class="fixed right-0 top-1/2 -translate-y-1/2 bg-white hover:bg-slate-50 border-y border-l border-slate-200 px-2 py-4 rounded-l-xl shadow-[-8px_0_15px_-4px_rgba(0,0,0,0.1)] z-30 flex flex-col items-center gap-2 group transition-all"
		on:click={() => (showSidebar = true)}
	>
		<span
			class="material-symbols-outlined text-primary group-hover:scale-110 transition-transform"
			>menu_open</span
		>
		<span
			class="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2"
			style="writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg);"
		>
			Timeline Pasien
		</span>
	</button>
{/if}

<!-- Tooth Detail Panel -->
<ToothDetailPanel
	bind:show={showToothModal}
	initialData={toothDetail}
	on:save={saveToothDetail}
	searchIcd10Fn={(term) => searchTerminology(term, "ICD-10")}
	searchIcd9Fn={(term) => searchTerminology(term, "ICD-9-CM")}
/>
