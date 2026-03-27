<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '../UI/Modal.svelte';

	export let show = false;
	export let toothNumber = null;
	export let surface = null; // 'top', 'bottom', 'left', 'right', 'center'
	export let currentData = {};

	const dispatch = createEventDispatcher();

	// Local state bound to form
	let condition = 'SOUND';
	let restoration = '';
	let notes = '';

	// Sync local state when modal opens
	$: if (show) {
		condition = currentData?.condition || 'SOUND';
		restoration = currentData?.restoration || '';
		notes = currentData?.notes || '';
	}

	const CONDITIONS = [
		{ value: 'SOUND', label: 'Sound (Normal)', color: '#ffffff' },
		{ value: 'CARIES', label: 'Caries (Karies)', color: '#EF4444' }, // Red
		{ value: 'RESTORATION', label: 'Restoration (Tambalan)', color: '#10B981' }, // Green
		{ value: 'MISSING', label: 'Missing (Gigi Hilang)', color: '#9CA3AF' }, // Gray outline
		{ value: 'EXTRACTED', label: 'Extracted (Dicabut)', color: '#DC2626' } // Big Red Cross
	];

	// Translate geometric surface to clinical surface based on tooth number
	function getClinicalSurfaceName(tNum, geoSurface) {
		if (!tNum || !geoSurface) return 'Whole Tooth';
		if (geoSurface === 'center') return 'Occlusal/Incisal (O/I)';
		
		const isLower = tNum.toString().startsWith('3') || tNum.toString().startsWith('4') || tNum.toString().startsWith('7') || tNum.toString().startsWith('8');
		const isRight = tNum.toString().startsWith('1') || tNum.toString().startsWith('4') || tNum.toString().startsWith('5') || tNum.toString().startsWith('8');

		if (geoSurface === 'top') return isLower ? 'Lingual (L)' : 'Buccal/Labial (B)';
		if (geoSurface === 'bottom') return isLower ? 'Buccal/Labial (B)' : 'Palatal/Lingual (P/L)';
		
		// Map left/right to Mesial/Distal
		if (geoSurface === 'left') return isRight ? 'Mesial (M)' : 'Distal (D)';
		if (geoSurface === 'right') return isRight ? 'Distal (D)' : 'Mesial (M)';
		
		return geoSurface;
	}

	function handleSave() {
		const selectedCondition = CONDITIONS.find(c => c.value === condition);
		dispatch('save', {
			toothNumber,
			surface,
			data: {
				condition,
				restoration,
				notes,
				color: condition === 'SOUND' ? null : selectedCondition.color
			}
		});
		show = false;
	}
</script>

<Modal bind:show title="Pemeriksaan Gigi {toothNumber}" on:close>
	<div class="mb-4">
		<div class="badge badge-primary text-sm p-2 w-full justify-center">
			Permukaan: <strong>{getClinicalSurfaceName(toothNumber, surface)}</strong>
		</div>
	</div>

	<div class="form-group mb-4">
		<label class="form-label" for="cond">Kondisi (Keadaan)</label>
		<select id="cond" class="form-select" bind:value={condition}>
			{#each CONDITIONS as c}
				<option value={c.value}>{c.label}</option>
			{/each}
		</select>
	</div>

	{#if condition === 'RESTORATION'}
		<div class="form-group mb-4">
			<label class="form-label" for="rest">Jenis Restorasi</label>
			<select id="rest" class="form-select" bind:value={restoration}>
				<option value="">-- Pilih --</option>
				<option value="Amalgam">Amalgam</option>
				<option value="Composite">Komposit</option>
				<option value="GIC">GIC</option>
				<option value="Crown">Crown / Mahkota</option>
			</select>
		</div>
	{/if}

	<div class="form-group">
		<label class="form-label" for="notes">Catatan & Tindakan (ICD-9-CM)</label>
		<textarea id="notes" class="form-textarea" placeholder="Contoh: Tumpatan komposit kavitas kelas II..." bind:value={notes}></textarea>
	</div>

	<div slot="footer">
		<button class="btn btn-secondary" on:click={() => show = false}>Batal</button>
		<button class="btn btn-primary" on:click={handleSave}>Simpan Perubahan</button>
	</div>
</Modal>
