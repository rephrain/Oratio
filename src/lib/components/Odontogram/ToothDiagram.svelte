<script>
	import { createEventDispatcher } from 'svelte';
	
	export let number = '';
	
	// Data representing what condition is bound to each geometry
	// Expected shape: { condition: 'Caries'|'Restoration'|..., color: string }
	export let top = null;
	export let right = null;
	export let bottom = null;
	export let left = null;
	export let center = null;
	
	// Global tooth conditions (e.g. extracted, missing)
	export let globalCondition = null; // 'Extracted', 'Missing'
	
	export let selectedSurface = ''; // e.g. 'top', 'left' for highlighting
	
	const dispatch = createEventDispatcher();
	
	function handleSurfaceClick(surfaceArea) {
		dispatch('surfaceClick', { tooth: number, surfaceArea });
	}

	function getFill(surfaceData, position) {
		if (selectedSurface === position) return 'var(--primary-light)';
		if (surfaceData?.color) return surfaceData.color;
		return '#ffffff';
	}
</script>

<div class="flex flex-col items-center gap-1.5 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105">
	<div class="text-[13px] font-bold text-slate-500 leading-none pb-0.5 pointer-events-none select-none">{number}</div>
	
	<div class="relative cursor-pointer filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:drop-shadow-[0_3px_5px_rgba(0,0,0,0.1)] transition-all duration-200">
		<svg width="42" height="42" viewBox="0 0 100 100" class="overflow-visible group">
			<!-- Top Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points="0,0 100,0 75,25 25,25" 
				fill={getFill(top, 'top')} 
				stroke="#94a3b8" 
				stroke-width="2.5" 
				stroke-linejoin="round"
				class="transition-all duration-200 hover:opacity-85 hover:stroke-primary"
				on:click={() => handleSurfaceClick('top')}
			/>
			
			<!-- Right Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points="100,0 100,100 75,75 75,25" 
				fill={getFill(right, 'right')} 
				stroke="#94a3b8" 
				stroke-width="2.5" 
				stroke-linejoin="round"
				class="transition-all duration-200 hover:opacity-85 hover:stroke-primary"
				on:click={() => handleSurfaceClick('right')}
			/>
			
			<!-- Bottom Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points="0,100 100,100 75,75 25,75" 
				fill={getFill(bottom, 'bottom')} 
				stroke="#94a3b8" 
				stroke-width="2.5" 
				stroke-linejoin="round"
				class="transition-all duration-200 hover:opacity-85 hover:stroke-primary"
				on:click={() => handleSurfaceClick('bottom')}
			/>
			
			<!-- Left Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points="0,0 0,100 25,75 25,25" 
				fill={getFill(left, 'left')} 
				stroke="#94a3b8" 
				stroke-width="2.5" 
				stroke-linejoin="round"
				class="transition-all duration-200 hover:opacity-85 hover:stroke-primary"
				on:click={() => handleSurfaceClick('left')}
			/>
			
			<!-- Center Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points="25,25 75,25 75,75 25,75" 
				fill={getFill(center, 'center')} 
				stroke="#94a3b8" 
				stroke-width="2.5" 
				stroke-linejoin="round"
				class="transition-all duration-200 hover:opacity-85 hover:stroke-primary z-10"
				on:click={() => handleSurfaceClick('center')}
			/>

			{#if globalCondition === 'Extracted'}
				<!-- Draw a large red X indicating extracted tooth -->
				<line x1="0" y1="0" x2="100" y2="100" stroke="#EF4444" stroke-width="8" stroke-linecap="round" class="pointer-events-none" />
				<line x1="100" y1="0" x2="0" y2="100" stroke="#EF4444" stroke-width="8" stroke-linecap="round" class="pointer-events-none" />
			{/if}
			{#if globalCondition === 'Missing'}
				<!-- Gray out circle indicating missing tooth -->
				<circle cx="50" cy="50" r="45" fill="rgba(148,163,184,0.1)" stroke="#94a3b8" stroke-width="6" stroke-dasharray="10 10" class="pointer-events-none" />
			{/if}
		</svg>
	</div>
</div>
