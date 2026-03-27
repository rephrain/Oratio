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

<div class="tooth-wrapper">
	<div class="tooth-number font-medium">{number}</div>
	
	<div class="tooth-svg-container">
		<svg width="40" height="40" viewBox="0 0 100 100" class="tooth-diagram">
			<!-- Top Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points="0,0 100,0 75,25 25,25" 
				fill={getFill(top, 'top')} 
				stroke="#1e293b" 
				stroke-width="2" 
				class="surface"
				on:click={() => handleSurfaceClick('top')}
			/>
			
			<!-- Right Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points="100,0 100,100 75,75 75,25" 
				fill={getFill(right, 'right')} 
				stroke="#1e293b" 
				stroke-width="2" 
				class="surface"
				on:click={() => handleSurfaceClick('right')}
			/>
			
			<!-- Bottom Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points="0,100 100,100 75,75 25,75" 
				fill={getFill(bottom, 'bottom')} 
				stroke="#1e293b" 
				stroke-width="2" 
				class="surface"
				on:click={() => handleSurfaceClick('bottom')}
			/>
			
			<!-- Left Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points="0,0 0,100 25,75 25,25" 
				fill={getFill(left, 'left')} 
				stroke="#1e293b" 
				stroke-width="2" 
				class="surface"
				on:click={() => handleSurfaceClick('left')}
			/>
			
			<!-- Center Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points="25,25 75,25 75,75 25,75" 
				fill={getFill(center, 'center')} 
				stroke="#1e293b" 
				stroke-width="2" 
				class="surface center-surface"
				on:click={() => handleSurfaceClick('center')}
			/>

			{#if globalCondition === 'Extracted'}
				<!-- Draw a large red X indicating extracted tooth -->
				<line x1="0" y1="0" x2="100" y2="100" stroke="#EF4444" stroke-width="8" />
				<line x1="100" y1="0" x2="0" y2="100" stroke="#EF4444" stroke-width="8" />
			{/if}
			{#if globalCondition === 'Missing'}
				<circle cx="50" cy="50" r="45" fill="none" stroke="#64748B" stroke-width="6" stroke-dasharray="10 10" />
			{/if}
		</svg>
	</div>
</div>

<style>
	.tooth-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.tooth-number {
		font-size: 13px;
		color: var(--text-primary);
		line-height: 1;
	}

	.tooth-diagram {
		cursor: pointer;
		filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
		transition: transform 0.1s ease;
	}
	
	.tooth-diagram:hover {
		transform: scale(1.05);
	}

	.surface {
		transition: fill 0.2s ease, opacity 0.2s ease;
	}

	.surface:hover {
		opacity: 0.8;
	}
</style>
