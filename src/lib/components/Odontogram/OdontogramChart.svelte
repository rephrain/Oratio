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
		return odontogramData[String(num)] || {};
	}

	function isSelected(num, surface) {
		return selectedTooth == num && selectedSurfaceArea == surface ? surface : '';
	}
</script>

<div class="min-w-[700px] max-w-4xl mx-auto py-8">
	<!-- PERMANENT UPPER -->
	<div class="flex justify-center mb-6">
		<div class="flex gap-1.5 flex-1 justify-end pr-6">
			{#each quadrant1 as num}
				<ToothDiagram 
					number={num} 
					top={getT(num).top} right={getT(num).right} bottom={getT(num).bottom} left={getT(num).left} center={getT(num).center} globalCondition={getT(num).global}
					selectedSurface={selectedTooth == num ? selectedSurfaceArea : ''}
					on:surfaceClick={handleSurfaceClick}
				/>
			{/each}
		</div>
		<div class="w-1 bg-slate-200 rounded-full mx-2 opacity-80"></div>
		<div class="flex gap-1.5 flex-1 justify-start pl-6">
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
	<div class="flex justify-center mb-6 opacity-95 scale-90 transform origin-top">
		<div class="flex gap-1.5 flex-1 justify-end pr-6">
			{#each quad5 as num}
				<ToothDiagram 
					number={num} 
					top={getT(num).top} right={getT(num).right} bottom={getT(num).bottom} left={getT(num).left} center={getT(num).center} globalCondition={getT(num).global}
					selectedSurface={selectedTooth == num ? selectedSurfaceArea : ''}
					on:surfaceClick={handleSurfaceClick}
				/>
			{/each}
		</div>
		<div class="w-1 bg-slate-200 rounded-full mx-2 opacity-80"></div>
		<div class="flex gap-1.5 flex-1 justify-start pl-6">
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
	<div class="flex justify-center mb-6 opacity-95 scale-90 transform origin-bottom">
		<div class="flex gap-1.5 flex-1 justify-end pr-6">
			{#each quad8 as num}
				<ToothDiagram 
					number={num} 
					top={getT(num).top} right={getT(num).right} bottom={getT(num).bottom} left={getT(num).left} center={getT(num).center} globalCondition={getT(num).global}
					selectedSurface={selectedTooth == num ? selectedSurfaceArea : ''}
					on:surfaceClick={handleSurfaceClick}
				/>
			{/each}
		</div>
		<div class="w-1 bg-slate-200 rounded-full mx-2 opacity-80"></div>
		<div class="flex gap-1.5 flex-1 justify-start pl-6">
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
	<div class="flex justify-center">
		<div class="flex gap-1.5 flex-1 justify-end pr-6">
			{#each quadrant4 as num}
				<ToothDiagram 
					number={num} 
					top={getT(num).top} right={getT(num).right} bottom={getT(num).bottom} left={getT(num).left} center={getT(num).center} globalCondition={getT(num).global}
					selectedSurface={isSelected(num, selectedSurfaceArea)}
					on:surfaceClick={handleSurfaceClick}
				/>
			{/each}
		</div>
		<div class="w-1 bg-slate-200 rounded-full mx-2 opacity-80"></div>
		<div class="flex gap-1.5 flex-1 justify-start pl-6">
			{#each quadrant3 as num}
				<ToothDiagram 
					number={num} 
					top={getT(num).top} right={getT(num).right} bottom={getT(num).bottom} left={getT(num).left} center={getT(num).center} globalCondition={getT(num).global}
					selectedSurface={isSelected(num, selectedSurfaceArea)}
					on:surfaceClick={handleSurfaceClick}
				/>
			{/each}
		</div>
	</div>
</div>
