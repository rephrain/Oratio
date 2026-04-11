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
		
		if (surfaceData?.bahan_restorasi === 'Amalgam Filling') return '#000000';
		if (surfaceData?.bahan_restorasi === 'Composite filling') return 'url(#hatch-green)';
		if (surfaceData?.bahan_restorasi === 'Fissure Sealant') return 'url(#hatch-red)';

		if (surfaceData?.color) return surfaceData.color;
		return '#ffffff';
	}

	function getStroke(surfaceData, defaultStroke = '#94a3b8') {
		if (surfaceData?.condition && surfaceData.condition.toUpperCase().includes("CARIES")) return '#000000';
		return defaultStroke;
	}

	function getStrokeWidth(surfaceData, defaultWidth = '2.5') {
		if (surfaceData?.condition && surfaceData.condition.toUpperCase().includes("CARIES")) return '4';
		return defaultWidth;
	}

	$: isFMC = center?.restoration?.includes('Full Metal Crown') || 
			   center?.restoration?.includes('Metal Bridge') || 
			   center?.restoration?.includes('Gold Metal Crown');
	$: isPOC = center?.restoration?.includes('Porcelain Crown') || 
			   center?.restoration?.includes('Porcelain Bridge') || 
			   center?.restoration?.includes('Metal Porcelain');
	$: isIPX = center?.restoration?.toLowerCase().includes('implan');
	$: isBridgeComponent = center?.restoration?.toLowerCase().includes('bridge') || 
						   center?.restoration?.includes('Pontic') || 
						   center?.restoration?.includes('Gigi abutment');
	$: isDenture = center?.protesa?.toLowerCase().includes('denture') || center?.restoration?.toLowerCase().includes('denture');

	$: isAnterior = ['1', '2', '3'].includes(String(number).charAt(1));

	$: cond = center?.condition?.toLowerCase() || '';
	$: isRightSideOfMouth = ['1', '4', '5', '8'].includes(String(number).charAt(0));
	$: isMaxillary = ['1', '2', '5', '6'].includes(String(number).charAt(0));

	$: drawArrowLeft = false;
	$: drawArrowRight = false;
	$: drawCurvedAbove = false;
	$: drawCurvedBelow = false;

	$: if (cond.includes('version')) {
		if (cond === 'mesio version') {
			if (isRightSideOfMouth) drawArrowRight = true; else drawArrowLeft = true;
		} else if (cond === 'disto version') {
			if (isRightSideOfMouth) drawArrowLeft = true; else drawArrowRight = true;
		} else if (cond.includes('linguo') || cond.includes('palato')) {
			drawCurvedBelow = true;
		} else {
			drawCurvedAbove = true;
		}
	}

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

<div class="flex flex-col items-center gap-1.5 transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105">
	<div class="text-[13px] font-bold text-slate-500 leading-none pb-0.5 pointer-events-none select-none">{number}</div>
	
	<div class="relative cursor-pointer filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:drop-shadow-[0_3px_5px_rgba(0,0,0,0.1)] transition-all duration-200">
		<svg width="42" height="42" viewBox="0 0 100 100" class="overflow-visible group">
			<defs>
				<pattern id="hatch-green" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
					<rect width="10" height="10" fill="#10B981" />
					<line x1="0" y1="0" x2="0" y2="10" stroke="#065F46" stroke-width="2" />
				</pattern>
				<pattern id="hatch-red" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
					<rect width="10" height="10" fill="#FCA5A5" />
					<line x1="0" y1="0" x2="0" y2="10" stroke="#991B1B" stroke-width="2" />
				</pattern>
				<pattern id="hatch-vertical-black" width="6" height="10" patternUnits="userSpaceOnUse">
					<line x1="3" y1="0" x2="3" y2="10" stroke="#000000" stroke-width="1.5" />
				</pattern>
			</defs>
			<!-- Top Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points={points.top} 
				fill={getFill(top, 'top')} 
				stroke={getStroke(top)} 
				stroke-width={getStrokeWidth(top)} 
				stroke-linejoin="round"
				class="transition-all duration-200 hover:opacity-85 hover:stroke-primary"
				on:click={() => handleSurfaceClick('top')}
			/>
			
			{#if isBridgeComponent}
				<!-- Bridge bracket line above tooth -->
				<line x1="-5" y1="-15" x2="105" y2="-15" stroke="#000000" stroke-width="6" class="pointer-events-none" />
			{/if}
			
			<!-- Right Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points={points.right} 
				fill={getFill(right, 'right')} 
				stroke={getStroke(right)} 
				stroke-width={getStrokeWidth(right)} 
				stroke-linejoin="round"
				class="transition-all duration-200 hover:opacity-85 hover:stroke-primary"
				on:click={() => handleSurfaceClick('right')}
			/>
			
			<!-- Bottom Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points={points.bottom} 
				fill={getFill(bottom, 'bottom')} 
				stroke={getStroke(bottom)} 
				stroke-width={getStrokeWidth(bottom)} 
				stroke-linejoin="round"
				class="transition-all duration-200 hover:opacity-85 hover:stroke-primary"
				on:click={() => handleSurfaceClick('bottom')}
			/>
			
			<!-- Left Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points={points.left} 
				fill={getFill(left, 'left')} 
				stroke={getStroke(left)} 
				stroke-width={getStrokeWidth(left)} 
				stroke-linejoin="round"
				class="transition-all duration-200 hover:opacity-85 hover:stroke-primary"
				on:click={() => handleSurfaceClick('left')}
			/>
			
			<!-- Center Polygon -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<polygon 
				points={points.center} 
				fill={getFill(center, 'center')} 
				stroke={getStroke(center)} 
				stroke-width={getStrokeWidth(center)} 
				stroke-linejoin="round"
				class="transition-all duration-200 hover:opacity-85 hover:stroke-primary z-10"
				on:click={() => handleSurfaceClick('center')}
			/>

			{#if isFMC || isPOC}
				<!-- Thick black outline for Full Metal Crown / Porcelain Crown -->
				<rect x="0" y="0" width="100" height="100" fill="none" stroke="#000000" stroke-width="6" class="pointer-events-none" />
			{/if}
			{#if isPOC}
				<!-- Vertical hatching for Porcelain Crown -->
				<rect x="0" y="0" width="100" height="100" fill="url(#hatch-vertical-black)" class="pointer-events-none" />
			{/if}

			{#if globalCondition === 'Extracted' || globalCondition === 'Missing'}
				<!-- Draw a large black X indicating extracted/missing tooth -->
				<line x1="10" y1="-10" x2="90" y2="110" stroke="#000000" stroke-width="8" stroke-linecap="round" class="pointer-events-none" />
				<line x1="90" y1="-10" x2="10" y2="110" stroke="#000000" stroke-width="8" stroke-linecap="round" class="pointer-events-none" />
			{/if}
			{#if globalCondition === 'Non-Vital'}
				<!-- Triangle below the tooth indicating non-vital -->
				<polygon points="35,100 65,100 50,125" fill="#ffffff" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" class="pointer-events-none" />
			{/if}
			{#if globalCondition === 'RCT'}
				<!-- Solid black triangle below the tooth indicating Perawatan Saluran Akar -->
				<polygon points="35,100 65,100 50,125" fill="#000000" stroke="#000000" stroke-width="2.5" stroke-linejoin="round" class="pointer-events-none" />
			{/if}
			{#if globalCondition === 'Fracture'}
				<!-- Fracture symbol # over the tooth -->
				<g class="pointer-events-none" stroke="#000000" stroke-width="4" stroke-linecap="square">
					<!-- Horizontal lines -->
					<line x1="20" y1="35" x2="80" y2="35" />
					<line x1="20" y1="65" x2="80" y2="65" />
					<!-- Diagonal lines (angled slightly) -->
					<line x1="45" y1="20" x2="35" y2="80" />
					<line x1="65" y1="20" x2="55" y2="80" />
				</g>
			{/if}
			{#if globalCondition === 'Sisa Akar'}
				<!-- Draw a thick V shape for Sisa Akar / Retained root -->
				<line x1="15" y1="-10" x2="45" y2="115" stroke="#000000" stroke-width="10" stroke-linecap="round" class="pointer-events-none" />
				<line x1="85" y1="-25" x2="45" y2="115" stroke="#000000" stroke-width="10" stroke-linecap="round" class="pointer-events-none" />
			{/if}
			{#if ['NON', 'UNE', 'PRE', 'ANO'].includes(globalCondition)}
				<!-- Text overlay for Gigi tidak ada/Un-erupted/Partial erupted/Anomali -->
				<text x="50" y="15" font-family="sans-serif" font-size="28" font-weight="900" fill="#000000" stroke="#ffffff" stroke-width="2" paint-order="stroke" text-anchor="middle" class="pointer-events-none">{globalCondition}</text>
			{/if}
			{#if isIPX}
				<!-- Text IPX below the tooth -->
				<text x="50" y="145" font-family="serif" font-size="28" font-weight="900" fill="#000000" text-anchor="middle" class="pointer-events-none" dominant-baseline="hanging">IPX</text>
			{/if}
			{#if isDenture}
				<!-- Text PRD/FLD below the tooth -->
				<text x="50" y="{isIPX ? 175 : 145}" font-family="serif" font-size="28" font-weight="900" fill="#000000" text-anchor="middle" class="pointer-events-none" dominant-baseline="hanging">PRD/FLD</text>
			{/if}
			{#if drawArrowLeft}
				<g class="pointer-events-none" stroke="#000000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<line x1="80" y1="-15" x2="20" y2="-15" />
					<polyline points="35,-25 20,-15 35,-5" />
				</g>
			{/if}
			{#if drawArrowRight}
				<g class="pointer-events-none" stroke="#000000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<line x1="20" y1="-15" x2="80" y2="-15" />
					<polyline points="65,-25 80,-15 65,-5" />
				</g>
			{/if}
			{#if drawCurvedAbove}
				<g class="pointer-events-none" stroke="#000000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M 30,-5 Q 50,-35 80,-10" />
					<polyline points="65,-15 80,-10 75,-25" />
				</g>
			{/if}
			{#if drawCurvedBelow}
				<g class="pointer-events-none" stroke="#000000" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
					<path d="M 30,105 Q 50,135 80,110" />
					<polyline points="65,115 80,110 75,125" />
				</g>
			{/if}
		</svg>
	</div>
</div>
