<script>
	import ToothDiagram from './ToothDiagram.svelte';
	import { createEventDispatcher } from 'svelte';

	// The record containing all tooth data formatted by the parent
	// Shape: { [toothNumber]: { top: {}, bottom: {}, left: {}, right: {}, center: {}, global: null } }
	export let odontogramData = {};
	export let selectedTooth = null;
	export let selectedSurfaceArea = null;

	const dispatch = createEventDispatcher();

	// FDI Numbering Setup
	const quadrant1 = [18, 17, 16, 15, 14, 13, 12, 11]; // Maxillary Right
	const quadrant2 = [21, 22, 23, 24, 25, 26, 27, 28]; // Maxillary Left
	
	const quadrant4 = [48, 47, 46, 45, 44, 43, 42, 41]; // Mandibular Right
	const quadrant3 = [31, 32, 33, 34, 35, 36, 37, 38]; // Mandibular Left

	// Deciduous
	const quad5 = [55, 54, 53, 52, 51];
	const quad6 = [61, 62, 63, 64, 65];
	const quad8 = [85, 84, 83, 82, 81];
	const quad7 = [71, 72, 73, 74, 75];

	function handleSurfaceClick(event) {
		dispatch('toothClick', {
			tooth: event.detail.tooth,
			surface: event.detail.surfaceArea
		});
	}

	// Helper to pluck data safely
	function getT(num) {
		return odontogramData[num] || {};
	}

	function isSelected(num, surface) {
		return selectedTooth == num && selectedSurfaceArea == surface ? surface : '';
	}
</script>

<div class="odontogram-board">
	<!-- PERMANENT UPPER -->
	<div class="arch-row">
		<div class="quadrant quad-right">
			{#each quadrant1 as num}
				<ToothDiagram 
					number={num} 
					top={getT(num).top} right={getT(num).right} bottom={getT(num).bottom} left={getT(num).left} center={getT(num).center} globalCondition={getT(num).global}
					selectedSurface={selectedTooth == num ? selectedSurfaceArea : ''}
					on:surfaceClick={handleSurfaceClick}
				/>
			{/each}
		</div>
		<div class="midline"></div>
		<div class="quadrant quad-left">
			{#each quadrant2 as num}
				<ToothDiagram 
					number={num} 
					top={getT(num).top} right={getT(num).right} bottom={getT(num).bottom} left={getT(num).left} center={getT(num).center} globalCondition={getT(num).global}
					selectedSurface={selectedTooth == num ? selectedSurfaceArea : ''}
					on:surfaceClick={handleSurfaceClick}
				/>
			{/each}
		</div>
	</div>

	<!-- DECIDUOUS UPPER (Child) -->
	<div class="arch-row child-arch mt-4">
		<div class="quadrant quad-right justify-end">
			{#each quad5 as num}
				<ToothDiagram 
					number={num} 
					top={getT(num).top} right={getT(num).right} bottom={getT(num).bottom} left={getT(num).left} center={getT(num).center} globalCondition={getT(num).global}
					selectedSurface={selectedTooth == num ? selectedSurfaceArea : ''}
					on:surfaceClick={handleSurfaceClick}
				/>
			{/each}
		</div>
		<div class="midline"></div>
		<div class="quadrant quad-left justify-start">
			{#each quad6 as num}
				<ToothDiagram 
					number={num} 
					top={getT(num).top} right={getT(num).right} bottom={getT(num).bottom} left={getT(num).left} center={getT(num).center} globalCondition={getT(num).global}
					selectedSurface={selectedTooth == num ? selectedSurfaceArea : ''}
					on:surfaceClick={handleSurfaceClick}
				/>
			{/each}
		</div>
	</div>

	<!-- DECIDUOUS LOWER (Child) -->
	<div class="arch-row child-arch mt-4">
		<div class="quadrant quad-right justify-end">
			{#each quad8 as num}
				<ToothDiagram 
					number={num} 
					top={getT(num).top} right={getT(num).right} bottom={getT(num).bottom} left={getT(num).left} center={getT(num).center} globalCondition={getT(num).global}
					selectedSurface={selectedTooth == num ? selectedSurfaceArea : ''}
					on:surfaceClick={handleSurfaceClick}
				/>
			{/each}
		</div>
		<div class="midline"></div>
		<div class="quadrant quad-left justify-start">
			{#each quad7 as num}
				<ToothDiagram 
					number={num} 
					top={getT(num).top} right={getT(num).right} bottom={getT(num).bottom} left={getT(num).left} center={getT(num).center} globalCondition={getT(num).global}
					selectedSurface={selectedTooth == num ? selectedSurfaceArea : ''}
					on:surfaceClick={handleSurfaceClick}
				/>
			{/each}
		</div>
	</div>

	<!-- PERMANENT LOWER -->
	<div class="arch-row mt-4">
		<div class="quadrant quad-right">
			{#each quadrant4 as num}
				<ToothDiagram 
					number={num} 
					top={getT(num).top} right={getT(num).right} bottom={getT(num).bottom} left={getT(num).left} center={getT(num).center} globalCondition={getT(num).global}
					selectedSurface={selectedTooth == num ? selectedSurfaceArea : ''}
					on:surfaceClick={handleSurfaceClick}
				/>
			{/each}
		</div>
		<div class="midline"></div>
		<div class="quadrant quad-left">
			{#each quadrant3 as num}
				<ToothDiagram 
					number={num} 
					top={getT(num).top} right={getT(num).right} bottom={getT(num).bottom} left={getT(num).left} center={getT(num).center} globalCondition={getT(num).global}
					selectedSurface={selectedTooth == num ? selectedSurfaceArea : ''}
					on:surfaceClick={handleSurfaceClick}
				/>
			{/each}
		</div>
	</div>
</div>

<style>
	.odontogram-board {
		background: var(--card-bg);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		border: 1px solid var(--border-color);
		box-shadow: var(--shadow-sm);
		overflow-x: auto;
		min-width: 800px;
	}

	.arch-row {
		display: flex;
		justify-content: center;
		margin-bottom: var(--space-4);
	}

	.quadrant {
		display: flex;
		gap: 6px;
		flex: 1;
	}

	.quad-right {
		justify-content: flex-end;
		padding-right: var(--space-4);
	}

	.quad-left {
		justify-content: flex-start;
		padding-left: var(--space-4);
	}

	.midline {
		width: 4px;
		background-color: var(--border-color);
		opacity: 0.6;
		margin: 0 var(--space-2);
		border-radius: 2px;
	}

	.child-arch {
		transform: scale(0.9);
	}

	.justify-end { justify-content: flex-end !important; }
	.justify-start { justify-content: flex-start !important; }
</style>
