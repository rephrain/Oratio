<script>
	import { onMount, onDestroy } from 'svelte';
	import { isSidebarOpen } from '$lib/stores/layout.js';

	// Hardcoded fallback for UI demonstration.
	// In reality, this would be fetched from the database / current session.
	let shiftEnd = new Date();
	shiftEnd.setHours(17, 0, 0, 0); // Example: 5 PM

	let hours = '00';
	let mins = '00';
	let secs = '00';
	let timerClass = 'text-white';
	let interval;

	function updateTimer() {
		const now = new Date();
		const diffMs = shiftEnd - now;

		if (diffMs <= 0) {
			hours = '00';
			mins = '00';
			secs = '00';
			timerClass = 'text-red-400';
			return;
		}

		const totalSeconds = Math.floor(diffMs / 1000);
		const h = Math.floor(totalSeconds / 3600);
		const m = Math.floor((totalSeconds % 3600) / 60);
		const s = totalSeconds % 60;

		hours = h.toString().padStart(2, '0');
		mins = m.toString().padStart(2, '0');
		secs = s.toString().padStart(2, '0');

		if (totalSeconds < 600) {
			timerClass = 'text-red-400 font-bold';
		} else if (totalSeconds < 1800) {
			timerClass = 'text-yellow-400';
		} else {
			timerClass = 'text-white';
		}
	}

	onMount(() => {
		updateTimer();
		interval = setInterval(updateTimer, 1000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

{#if $isSidebarOpen}
<div class="flex flex-col bg-black/20 rounded-2xl p-5 shadow-inner w-full font-display">
	<span class="text-[10px] font-bold tracking-[0.15em] text-white/50 uppercase mb-4">Shift Countdown</span>
	<div class="flex justify-between items-center w-full">
		<div class="flex flex-col items-center gap-2">
			<span class="text-[26px] {timerClass} font-medium tracking-wide leading-none">{hours}</span>
			<span class="text-[10px] text-white/40 font-semibold tracking-wider">HRS</span>
		</div>
		<div class="text-xl text-white/20 pb-5 font-bold leading-none">:</div>
		<div class="flex flex-col items-center gap-2">
			<span class="text-[26px] {timerClass} font-medium tracking-wide leading-none">{mins}</span>
			<span class="text-[10px] text-white/40 font-semibold tracking-wider">MIN</span>
		</div>
		<div class="text-xl text-white/20 pb-5 font-bold leading-none">:</div>
		<div class="flex flex-col items-center gap-2">
			<span class="text-[26px] {timerClass} font-medium tracking-wide leading-none">{secs}</span>
			<span class="text-[10px] text-white/40 font-semibold tracking-wider">SEC</span>
		</div>
	</div>
</div>
{:else}
<div class="flex items-center justify-center p-3 rounded-2xl bg-black/20 w-full" title="Shift Countdown: {hours}:{mins}:{secs}">
	<span class="material-symbols-outlined {timerClass}" style="font-size: 24px;">timer</span>
</div>
{/if}


