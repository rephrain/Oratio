<script>
	import { createEventDispatcher } from 'svelte';
	
	export let number = '';
	export let selectedSurfaces = []; // Array of selected surface keys: ['center', 'top', 'bottom', 'left', 'right']

	const dispatch = createEventDispatcher();

	$: isLower = String(number).startsWith('3') || String(number).startsWith('4') || String(number).startsWith('7') || String(number).startsWith('8');
	$: isRightSideOfMouth = ['1', '4', '5', '8'].includes(String(number).charAt(0));
	$: isAnterior = ['1', '2', '3'].includes(String(number).charAt(1));

	function handleSurfaceClick(surfaceArea) {
		dispatch('surfaceClick', { surfaceArea });
	}

	function isSelected(pos) {
		return selectedSurfaces.includes(pos);
	}

	// Clinical Labels mapping
	function getLabel(pos) {
		if (pos === 'center') return isAnterior ? 'I' : 'O';
		if (pos === 'top') return isLower ? 'L' : 'B'; // For upper, top is Buccal/Labial. For lower, top is Lingual
		if (pos === 'bottom') return isLower ? 'B' : 'P'; // For lower, bottom is Buccal. For upper, bottom is Palatal
		if (pos === 'left') return isRightSideOfMouth ? 'M' : 'D';
		if (pos === 'right') return isRightSideOfMouth ? 'D' : 'M';
		return '';
	}

	// Helper for text positions
	const tPos = isAnterior ? {
		top: { x: 50, y: 15 },
		right: { x: 80, y: 50 },
		bottom: { x: 50, y: 85 },
		left: { x: 20, y: 50 },
		center: { x: 50, y: 50 },
	} : {
		top: { x: 50, y: 15 },
		right: { x: 85, y: 50 },
		bottom: { x: 50, y: 85 },
		left: { x: 15, y: 50 },
		center: { x: 50, y: 50 },
	};

	$: points = isAnterior ? {
		top: "0,0 100,0 75,35 25,35",
		right: "100,0 100,100 75,65 75,35",
		bottom: "0,100 100,100 75,65 25,65",
		left: "0,0 0,100 25,65 25,35",
		center: "25,35 75,35 75,65 25,65"
	} : {
		top: "0,0 100,0 75,25 25,25",
		right: "100,0 100,100 75,75 75,25",
		bottom: "0,100 100,100 75,75 25,75",
		left: "0,0 0,100 25,75 25,25",
		center: "25,25 75,25 75,75 25,75"
	};
</script>

<div class="relative w-full max-w-[200px] mx-auto aspect-square flex flex-col items-center justify-center">
	<svg width="100%" height="100%" viewBox="0 0 100 100" class="overflow-visible group filter drop-shadow-sm">
		<!-- Top Polygon -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<g on:click={() => handleSurfaceClick('top')} class="cursor-pointer">
			<polygon points={points.top} 
				fill={isSelected('top') ? 'var(--primary-light)' : '#f8fafc'} 
				stroke="#cbd5e1" stroke-width="2" stroke-linejoin="round"
				class="transition-all duration-200 hover:brightness-95 {isSelected('top') ? 'stroke-primary' : ''}" />
			<text x={tPos.top.x} y={tPos.top.y} font-size="12" font-weight="bold" fill={isSelected('top') ? 'var(--primary)' : '#94a3b8'} text-anchor="middle" dominant-baseline="middle" class="pointer-events-none select-none">{getLabel('top')}</text>
		</g>

		<!-- Right Polygon -->
		<g on:click={() => handleSurfaceClick('right')} class="cursor-pointer">
			<polygon points={points.right} 
				fill={isSelected('right') ? 'var(--primary-light)' : '#f8fafc'} 
				stroke="#cbd5e1" stroke-width="2" stroke-linejoin="round"
				class="transition-all duration-200 hover:brightness-95 {isSelected('right') ? 'stroke-primary' : ''}" />
			<text x={tPos.right.x} y={tPos.right.y} font-size="12" font-weight="bold" fill={isSelected('right') ? 'var(--primary)' : '#94a3b8'} text-anchor="middle" dominant-baseline="middle" class="pointer-events-none select-none">{getLabel('right')}</text>
		</g>

		<!-- Bottom Polygon -->
		<g on:click={() => handleSurfaceClick('bottom')} class="cursor-pointer">
			<polygon points={points.bottom} 
				fill={isSelected('bottom') ? 'var(--primary-light)' : '#f8fafc'} 
				stroke="#cbd5e1" stroke-width="2" stroke-linejoin="round"
				class="transition-all duration-200 hover:brightness-95 {isSelected('bottom') ? 'stroke-primary' : ''}" />
			<text x={tPos.bottom.x} y={tPos.bottom.y} font-size="12" font-weight="bold" fill={isSelected('bottom') ? 'var(--primary)' : '#94a3b8'} text-anchor="middle" dominant-baseline="middle" class="pointer-events-none select-none">{getLabel('bottom')}</text>
		</g>

		<!-- Left Polygon -->
		<g on:click={() => handleSurfaceClick('left')} class="cursor-pointer">
			<polygon points={points.left} 
				fill={isSelected('left') ? 'var(--primary-light)' : '#f8fafc'} 
				stroke="#cbd5e1" stroke-width="2" stroke-linejoin="round"
				class="transition-all duration-200 hover:brightness-95 {isSelected('left') ? 'stroke-primary' : ''}" />
			<text x={tPos.left.x} y={tPos.left.y} font-size="12" font-weight="bold" fill={isSelected('left') ? 'var(--primary)' : '#94a3b8'} text-anchor="middle" dominant-baseline="middle" class="pointer-events-none select-none">{getLabel('left')}</text>
		</g>

		<!-- Center Polygon -->
		<g on:click={() => handleSurfaceClick('center')} class="cursor-pointer">
			<polygon points={points.center} 
				fill={isSelected('center') ? 'var(--primary-light)' : '#ffffff'} 
				stroke="#cbd5e1" stroke-width="2" stroke-linejoin="round"
				class="transition-all duration-200 hover:brightness-95 z-10 {isSelected('center') ? 'stroke-primary' : ''}" />
			<text x={tPos.center.x} y={tPos.center.y} font-size="12" font-weight="bold" fill={isSelected('center') ? 'var(--primary)' : '#94a3b8'} text-anchor="middle" dominant-baseline="middle" class="pointer-events-none select-none">{getLabel('center')}</text>
		</g>
	</svg>
</div>
