<script>
	import { createEventDispatcher } from 'svelte';
	import SingleToothMap from './SingleToothMap.svelte';
	import SearchableSelect from '../Forms/SearchableSelect.svelte';
	import { KEADAAN, BAHAN_RESTORASI, RESTORASI, BAHAN_PROTESA, PROTESA } from '$lib/utils/constants.js';

	export let show = false;
	export let initialData = {}; // Expecting { tooth_number, keadaan, protesa, bahan_protesa, surfaces:[], diagnoses:[], procedures:[] }
	export let searchIcd10Fn = null;
	export let searchIcd9Fn = null;

	const dispatch = createEventDispatcher();

	let t = { surfaces: [], diagnoses: [], procedures: [], protesa: '', bahan_protesa: '' };
	let selectedSurfaces = []; 
	let initializedFor = null;

	// ── Clinical ↔ Positional surface name mapping ──
	function getClinicalName(positional, toothNum) {
		const quad = String(toothNum).charAt(0);
		const isUpper = ['1', '2', '5', '6'].includes(quad);
		const isRightSideOfMouth = ['1', '4', '5', '8'].includes(quad);
		const isAnterior = ['1', '2', '3'].includes(String(toothNum).charAt(1));

		if (positional === 'center') return isAnterior ? 'I' : 'O';
		if (positional === 'top') return isUpper ? 'B' : 'L';
		if (positional === 'bottom') return isUpper ? 'P' : 'B';
		if (positional === 'left') return isRightSideOfMouth ? 'M' : 'D';
		if (positional === 'right') return isRightSideOfMouth ? 'D' : 'M';
		return '';
	}

	function getPositionalName(clinical, toothNum) {
		const quad = String(toothNum).charAt(0);
		const isUpper = ['1', '2', '5', '6'].includes(quad);
		const isRightSideOfMouth = ['1', '4', '5', '8'].includes(quad);
		const isAnterior = ['1', '2', '3'].includes(String(toothNum).charAt(1));

		const c = clinical.toUpperCase();
		if (c === 'O' || c === 'I') return 'center';
		if (c === 'M') return isRightSideOfMouth ? 'left' : 'right';
		if (c === 'D') return isRightSideOfMouth ? 'right' : 'left';
		if (c === 'B' || c === 'F' || c === 'LA' || c === 'V') {
			return isUpper ? 'top' : 'bottom';
		}
		if (c === 'P' || c === 'L') {
			return isUpper ? 'bottom' : 'top';
		}
		return 'center';
	}

	function getClinicalFullName(clinical) {
		const map = {
			'O': 'Occlusal (O)', 'I': 'Incisal (I)',
			'M': 'Mesial (M)', 'D': 'Distal (D)',
			'B': 'Buccal/Labial (B)', 'L': 'Lingual (L)',
			'P': 'Palatal (P)', 'V': 'Vestibular (V)'
		};
		return map[clinical?.toUpperCase()] || clinical;
	}

	$: if (show && initialData && initialData.tooth_number !== initializedFor) {
		const newT = JSON.parse(JSON.stringify(initialData));
		if (!newT.surfaces) newT.surfaces = [];
		if (!newT.diagnoses) newT.diagnoses = [];
		if (!newT.procedures) newT.procedures = [];
		if (!newT.protesa) newT.protesa = '';
		if (!newT.bahan_protesa) newT.bahan_protesa = '';
		
		t = newT;
		selectedSurfaces = t.surfaces.map(s => getPositionalName(s.surface, t.tooth_number));
		isTerminal = ['Gigi Hilang', 'EXTRACTED', 'MISSING', 'Sisa Akar', 'Retained root'].includes(t.keadaan);
		initializedFor = t.tooth_number;
	}

	$: if (!show) {
		initializedFor = null;
	}

	let isTerminal = false;

	function handleKeadaanChange(e) {
		t.keadaan = e.target.value;
		isTerminal = ['Gigi Hilang', 'EXTRACTED', 'MISSING', 'Sisa Akar', 'Retained root'].includes(t.keadaan);
		if (isTerminal) {
			t.surfaces = [];
			selectedSurfaces = [];
		}
	}

	function handleSurfaceClick(e) {
		if (isTerminal) return;
		const positional = e.detail.surfaceArea; // 'top', 'bottom', etc.
		const clinical = getClinicalName(positional, t.tooth_number); // 'O', 'M', etc.

		if (selectedSurfaces.includes(positional)) {
			// Deselect
			selectedSurfaces = selectedSurfaces.filter(s => s !== positional);
			t.surfaces = t.surfaces.filter(s => s.surface !== clinical);
		} else {
			// Select
			selectedSurfaces = [...selectedSurfaces, positional];
			t.surfaces = [...t.surfaces, { surface: clinical, restorasi: '', bahan_restorasi: '' }];
		}
		t = t;
	}

	function selectAllSurfaces() {
		if (isTerminal) return;
		const allPositional = ['top', 'bottom', 'left', 'right', 'center'];
		selectedSurfaces = [...allPositional];
		const allClinical = allPositional.map(p => getClinicalName(p, t.tooth_number));
		t.surfaces = allClinical.map(clinical => {
			const existing = t.surfaces.find(s => s.surface === clinical);
			return existing || { surface: clinical, restorasi: '', bahan_restorasi: '' };
		});
		t = t;
	}

	function handleProtesaChange(e) {
		t.protesa = e.target.value;
		if (!t.protesa) t.bahan_protesa = '';
		t = t;
	}

	function handleBahanProtesaChange(e) {
		t.bahan_protesa = e.target.value;
		t = t;
	}

	function handleRestorasiChange(i, val) {
		t.surfaces[i].restorasi = val;
		if (!val) t.surfaces[i].bahan_restorasi = '';
		t = t;
	}

	function handleBahanRestorasiChange(i, val) {
		t.surfaces[i].bahan_restorasi = val;
		t = t;
	}

	function handleSave() {
		// Validations
		const primaries = t.diagnoses.filter(d => d.is_primary);
		if (t.diagnoses.length > 0 && primaries.length !== 1) {
			alert('Harap pilih tepat satu Primary Diagnosa (ICD-10)');
			return;
		}

		dispatch('save', t);
		show = false;
	}

	function addDiagnosis(detail) {
		if (!t.diagnoses.some(d => d.icd10_id === detail.id)) {
			// Auto set primary if it's the first one
			const isFirst = t.diagnoses.length === 0;
			t.diagnoses = [...t.diagnoses, {
				icd10_id: detail.id,
				diagnosis_code: detail.value,
				diagnosis_display: detail.label,
				is_primary: isFirst
			}];
		}
	}
	function setPrimaryDiag(idx) {
		t.diagnoses = t.diagnoses.map((d, i) => ({ ...d, is_primary: i === idx }));
	}
	function removeDiag(idx) {
		t.diagnoses = t.diagnoses.filter((_, i) => i !== idx);
		if (t.diagnoses.length > 0 && !t.diagnoses.some(d => d.is_primary)) {
			t.diagnoses[0].is_primary = true;
		}
	}

	function addProcedure(detail) {
		if (!t.procedures.some(d => d.icd9cm_id === detail.id)) {
			t.procedures = [...t.procedures, {
				icd9cm_id: detail.id,
				procedure_code: detail.value,
				procedure_display: detail.label
			}];
		}
	}
	function removeProc(idx) {
		t.procedures = t.procedures.filter((_, i) => i !== idx);
	}
</script>

{#if show}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity" on:click={() => show = false}></div>
	
	<!-- Slide-in Panel -->
	<div class="fixed top-0 right-0 z-50 w-full max-w-lg h-full bg-slate-50 shadow-2xl flex flex-col transform transition-transform border-l border-slate-200">
		<div class="bg-white px-6 py-5 flex items-center justify-between border-b border-slate-200 shadow-sm shrink-0">
			<h2 class="text-xl font-bold text-slate-800 flex items-center gap-3">
				<div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
					{t.tooth_number}
				</div>
				Detail Gigi
			</h2>
			<button class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors" on:click={() => show = false}>
				<span class="material-symbols-outlined text-[20px]">close</span>
			</button>
		</div>

		<!-- Scrollable content -->
		<div class="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
			<!-- Level 1: Global Tooth Condition -->
			<section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
				<h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Level 1: Kondisi Global</h3>
				<div class="space-y-4">
					<div>
						<label class="text-sm font-bold text-slate-700 block mb-1">Keadaan (Kondisi Utama)</label>
						<select class="w-full rounded-xl border-slate-200 text-sm focus:border-primary shadow-sm {isTerminal ? 'bg-red-50 text-red-700 border-red-200 font-bold' : ''}" value={t.keadaan} on:change={handleKeadaanChange}>
							<option value="">-- Pilih Keadaan --</option>
							{#each KEADAAN as k}
								<option value={k}>{k}</option>
							{/each}
						</select>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="text-sm font-bold text-slate-700 block mb-1">Protesa {t.protesa ? '✓' : ''}</label>
							<select class="w-full rounded-xl border-slate-200 text-sm focus:border-primary shadow-sm" value={t.protesa} on:change={handleProtesaChange}>
								<option value="">-- Tidak Ada --</option>
								{#each PROTESA as k}
									<option value={k}>{k}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="text-sm font-bold text-slate-700 block mb-1">Bahan Protesa</label>
							<select class="w-full rounded-xl border-slate-200 text-sm focus:border-primary shadow-sm disabled:bg-slate-100 disabled:text-slate-400" value={t.bahan_protesa} on:change={handleBahanProtesaChange} disabled={!t.protesa}>
								<option value="">-- Tidak Ada --</option>
								{#each BAHAN_PROTESA as k}
									<option value={k}>{k}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
			</section>

			<!-- Level 2: Surfaces -->
			{#if !isTerminal}
			<section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6 lg:flex-row lg:items-start">
				<div class="flex-shrink-0 w-full lg:w-[180px] flex flex-col items-center">
					<h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 w-full">Level 2: Permukaan</h3>
					<SingleToothMap number={t.tooth_number} {selectedSurfaces} on:surfaceClick={handleSurfaceClick} />
					<button class="mt-3 text-[10px] font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 w-full text-center" on:click={selectAllSurfaces}>PILIH SEMUA P.M.K</button>
				</div>
				<div class="flex-1 w-full space-y-3">
					{#if t.surfaces.length === 0}
						<div class="border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs font-bold p-4 text-center rounded-xl h-full flex items-center justify-center">
							Pilih permukaan gigi (O, M, D, B, L) pada gambar untuk mengisi restorasi.
						</div>
					{:else}
						{#each t.surfaces as surf, i (surf.surface)}
							<div class="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
								<div class="text-[10px] font-black uppercase text-indigo-500 mb-2">Permukaan {getClinicalFullName(surf.surface)}</div>
								<div class="space-y-2">
									<select class="w-full text-xs rounded-lg border-indigo-200 focus:border-primary shadow-sm bg-white" value={t.surfaces[i].restorasi} on:change={(e) => handleRestorasiChange(i, e.target.value)}>
										<option value="">-- Jenis Restorasi --</option>
										{#each RESTORASI as r}
											<option value={r}>{r}</option>
										{/each}
									</select>
									<select class="w-full text-xs rounded-lg border-indigo-200 focus:border-primary shadow-sm bg-white disabled:opacity-60" value={t.surfaces[i].bahan_restorasi} on:change={(e) => handleBahanRestorasiChange(i, e.target.value)} disabled={!t.surfaces[i].restorasi}>
										<option value="">-- Bahan Restorasi --</option>
										{#each BAHAN_RESTORASI as r}
											<option value={r}>{r}</option>
										{/each}
									</select>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</section>
			{/if}

			<!-- Level 3: Clinical Data -->
			<!-- Diagnoses -->
			<section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
				<h3 class="text-xs font-bold uppercase tracking-widest text-slate-400">Level 3: Diagnosa (ICD-10)</h3>
				<div class="[&_input]:w-full [&_input]:py-2 [&_input]:rounded-xl [&_input]:text-sm">
					<SearchableSelect 
						placeholder="Cari Diagnosa ICD-10..." 
						searchFn={searchIcd10Fn} 
						on:select={(e) => addDiagnosis(e.detail)} 
						value=""
						label=""
					/>
				</div>
				<div class="space-y-2">
					{#each t.diagnoses as diag, i}
						<div class="flex items-start gap-3 p-3 bg-red-50/30 rounded-xl border border-red-100 {diag.is_primary ? 'ring-1 ring-red-300' : ''}">
							<div class="pt-0.5">
								<input type="radio" name="primary_diag" class="text-red-500 focus:ring-red-500" checked={diag.is_primary} on:change={() => setPrimaryDiag(i)} title="Set as Primary">
							</div>
							<div class="flex-1">
								<p class="text-xs font-bold text-slate-800 leading-tight">{diag.diagnosis_display}</p>
								<div class="flex items-center gap-2 mt-1">
									<span class="text-[10px] font-mono text-red-600 bg-red-100 px-1.5 py-0.5 rounded uppercase">{diag.diagnosis_code}</span>
									{#if diag.is_primary}
										<span class="text-[10px] font-black text-red-500 uppercase tracking-widest">Primary</span>
									{/if}
								</div>
							</div>
							<button class="text-slate-400 hover:text-red-500" on:click={() => removeDiag(i)}><span class="material-symbols-outlined text-[18px]">close</span></button>
						</div>
					{/each}
				</div>
			</section>

			<!-- Procedures -->
			<section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
				<h3 class="text-xs font-bold uppercase tracking-widest text-slate-400">Level 3: Tindakan (ICD-9-CM)</h3>
				<div class="[&_input]:w-full [&_input]:py-2 [&_input]:rounded-xl [&_input]:text-sm">
					<SearchableSelect 
						placeholder="Cari Tindakan ICD-9-CM..." 
						searchFn={searchIcd9Fn} 
						on:select={(e) => addProcedure(e.detail)} 
						value=""
						label=""
					/>
				</div>
				<div class="space-y-2">
					{#each t.procedures as proc, i}
						<div class="flex items-center gap-3 p-3 bg-emerald-50/30 rounded-xl border border-emerald-100">
							<div class="flex-1">
								<p class="text-xs font-bold text-slate-800 leading-tight">{proc.procedure_display}</p>
								<span class="text-[10px] font-mono text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase mt-1 inline-block">{proc.procedure_code}</span>
							</div>
							<button class="text-slate-400 hover:text-red-500" on:click={() => removeProc(i)}><span class="material-symbols-outlined text-[18px]">close</span></button>
						</div>
					{/each}
				</div>
			</section>

		</div>

		<div class="p-5 border-t border-slate-200 bg-slate-50 shrink-0 flex justify-end gap-3">
			<button class="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors" on:click={() => show = false}>Batal</button>
			<button class="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary shadow-md shadow-primary/20 hover:brightness-110 flex items-center gap-2 transition-all" on:click={handleSave}>
				<span class="material-symbols-outlined text-[18px]">save</span> Simpan Gigi
			</button>
		</div>
	</div>
{/if}
