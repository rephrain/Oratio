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

	let t = { restorations: [], diagnoses: [], procedures: [], protesa: '', bahan_protesa: '' };
	let initializedFor = null;
	let mapComponents = [];

	// ── Clinical ↔ Positional surface name mapping ──
	function getClinicalName(positional, toothNum) {
		const quad = String(toothNum).charAt(0);
		const isUpper = ['1', '2', '5', '6'].includes(quad);
		const isRightSideOfMouth = ['1', '4', '5', '8'].includes(quad);
		const isAnterior = ['1', '2', '3'].includes(String(toothNum).charAt(1));

		if (positional === 'center') return isAnterior ? 'I' : 'O';
		if (positional === 'top') return isUpper ? 'B' : 'L';
		if (positional === 'bottom') return isUpper ? 'P' : 'B';
		if (positional === 'left') return isRightSideOfMouth ? 'D' : 'M';
		if (positional === 'right') return isRightSideOfMouth ? 'M' : 'D';
		return '';
	}

	function getPositionalName(clinical, toothNum) {
		const quad = String(toothNum).charAt(0);
		const isUpper = ['1', '2', '5', '6'].includes(quad);
		const isRightSideOfMouth = ['1', '4', '5', '8'].includes(quad);
		const isAnterior = ['1', '2', '3'].includes(String(toothNum).charAt(1));

		const c = clinical.toUpperCase();
		if (c === 'O' || c === 'I') return 'center';
		if (c === 'M') return isRightSideOfMouth ? 'right' : 'left';
		if (c === 'D') return isRightSideOfMouth ? 'left' : 'right';
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
		if (!newT.restorations) newT.restorations = [];
		if (!newT.diagnoses) newT.diagnoses = [];
		if (!newT.procedures) newT.procedures = [];
		if (!newT.protesa) newT.protesa = '';
		if (!newT.bahan_protesa) newT.bahan_protesa = '';
		
		t = newT;
		isTerminal = ['mis', 'rrx'].includes(t.keadaan);
		initializedFor = t.tooth_number;
	}

	$: if (!show) {
		initializedFor = null;
	}

	let isTerminal = false;

	function handleKeadaanChange(e) {
		t.keadaan = e.target.value;
		isTerminal = ['mis', 'rrx'].includes(t.keadaan);
		if (isTerminal) {
			t.restorations = [];
		}
	}

	function handleRestorationSurfaceClick(restorationIndex, e) {
		if (isTerminal) return;
		const positional = e.detail.surfaceArea;
		const clinical = getClinicalName(positional, t.tooth_number);

		let r = t.restorations[restorationIndex];
		if (!r.surfaces) r.surfaces = [];

		if (r.surfaces.includes(clinical)) {
			// Deselect
			r.surfaces = r.surfaces.filter(s => s !== clinical);
		} else {
			// Select
			r.surfaces = [...r.surfaces, clinical];
		}
		t = t;
	}

	function selectAllSurfaces(restorationIndex) {
		if (isTerminal) return;
		
		if (mapComponents[restorationIndex]) {
			mapComponents[restorationIndex].flashAll();
		}

		const allPositional = ['top', 'bottom', 'left', 'right', 'center'];
		const allClinical = allPositional.map(p => getClinicalName(p, t.tooth_number));
		t.restorations[restorationIndex].surfaces = allClinical;
		t = t;
	}

	function createRestoration() {
		t.restorations = [...t.restorations, { restorasi: '', bahan_restorasi: '', surfaces: [] }];
		t = t;
	}

	function removeRestoration(i) {
		t.restorations = t.restorations.filter((_, idx) => idx !== i);
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
		t.restorations[i].restorasi = val;
		if (!val) t.restorations[i].bahan_restorasi = '';
		t = t;
	}

	function handleBahanRestorasiChange(i, val) {
		t.restorations[i].bahan_restorasi = val;
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
								<option value={k.key}>{k.label}</option>
							{/each}
						</select>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="text-sm font-bold text-slate-700 block mb-1">Protesa {t.protesa ? '✓' : ''}</label>
							<select class="w-full rounded-xl border-slate-200 text-sm focus:border-primary shadow-sm" value={t.protesa} on:change={handleProtesaChange}>
								<option value="">-- Tidak Ada --</option>
								{#each PROTESA as k}
									<option value={k.key}>{k.label}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="text-sm font-bold text-slate-700 block mb-1">Bahan Protesa</label>
							<select class="w-full rounded-xl border-slate-200 text-sm focus:border-primary shadow-sm disabled:bg-slate-100 disabled:text-slate-400" value={t.bahan_protesa} on:change={handleBahanProtesaChange} disabled={!t.protesa}>
								<option value="">-- Tidak Ada --</option>
								{#each BAHAN_PROTESA as k}
									<option value={k.key}>{k.label}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
			</section>

			{#if !isTerminal}
			<section class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-xs font-bold uppercase tracking-widest text-slate-400">Level 2: Restorasi & Permukaan</h3>
					<button class="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors border border-primary/20 flex items-center gap-1" on:click={createRestoration}>
						<span class="material-symbols-outlined text-[14px]">add</span> Tambah
					</button>
				</div>
				
				<div class="space-y-4">
					{#if t.restorations.length === 0}
						<div class="border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs font-bold p-4 text-center rounded-xl h-full flex items-center justify-center">
							Belum ada restorasi untuk gigi ini. Klik "Tambah" untuk mencatat.
						</div>
					{:else}
						{#each t.restorations as rest, i}
							<div class="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex flex-col gap-4">
								<div class="flex justify-between items-center border-b border-indigo-100 pb-2">
									<div class="text-[11px] font-black uppercase text-indigo-500">Restorasi {i + 1}</div>
									<button class="text-slate-400 hover:text-red-500" on:click={() => removeRestoration(i)}><span class="material-symbols-outlined text-[18px]">close</span></button>
								</div>
								
								<div class="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-6">
									<div class="space-y-3">
										<div>
											<label class="text-[10px] font-bold text-slate-500 uppercase block mb-1">Jenis Restorasi</label>
											<select class="w-full text-sm rounded-lg border-indigo-200 focus:border-primary shadow-sm bg-white" value={rest.restorasi} on:change={(e) => handleRestorasiChange(i, e.target.value)}>
												<option value="">-- Pilih Jenis --</option>
												{#each RESTORASI as r}
													<option value={r.key}>{r.label}</option>
												{/each}
											</select>
										</div>
										<div>
											<label class="text-[10px] font-bold text-slate-500 uppercase block mb-1">Bahan Restorasi</label>
											<select class="w-full text-sm rounded-lg border-indigo-200 focus:border-primary shadow-sm bg-white disabled:opacity-60" value={rest.bahan_restorasi} on:change={(e) => handleBahanRestorasiChange(i, e.target.value)} disabled={!rest.restorasi}>
												<option value="">-- Pilih Bahan --</option>
												{#each BAHAN_RESTORASI as r}
													<option value={r.key}>{r.label}</option>
												{/each}
											</select>
										</div>
									</div>

									<div class="flex flex-col items-center shrink-0 border-l border-indigo-100 pl-4 py-1">
										<label class="text-[10px] font-bold text-slate-500 uppercase block mb-2 text-center w-full">Permukaan</label>
										<div class="scale-75 origin-top mb-[-15px]">
											<SingleToothMap bind:this={mapComponents[i]} number={t.tooth_number} selectedSurfaces={rest.surfaces.map(s => getPositionalName(s, t.tooth_number))} on:surfaceClick={(e) => handleRestorationSurfaceClick(i, e)} />
										</div>
										<button class="mt-1 text-[9px] font-bold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 w-full text-center" on:click={() => selectAllSurfaces(i)}>PILIH SEMUA</button>

										{#if rest.surfaces.length > 0}
											<div class="mt-2 flex flex-wrap gap-1 justify-center">
												{#each rest.surfaces as surf}
													<!-- svelte-ignore a11y-click-events-have-key-events -->
													<span role="button" tabindex="0" class="text-[9px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-90 active:bg-indigo-700 transition-all cursor-pointer px-1.5 py-0.5 rounded shadow-sm" on:click={() => handleRestorationSurfaceClick(i, { detail: { surfaceArea: getPositionalName(surf, t.tooth_number) }})} title="Hapus">{surf}</span>
												{/each}
											</div>
										{/if}
									</div>
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
