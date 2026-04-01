<script>
	import { onMount, onDestroy } from 'svelte';
	import { isSidebarOpen } from '$lib/stores/layout.js';
	import { getShiftCountdown } from '$lib/utils/formatters.js';

	let shifts = [];
	let hours = '00';
	let mins = '00';
	let secs = '00';
	let timerClass = 'text-white';
	let interval;
	let loading = true;
	let statusMsg = 'No Active Shift';

	function updateTimer() {
		if (shifts.length === 0) {
			statusMsg = 'No Active Shift';
			return;
		}

		const result = getShiftCountdown(shifts);
		
		if (!result.active) {
			statusMsg = result.nextShift ? `Next: ${result.nextShift}` : 'No Active Shift';
			hours = '00';
			mins = '00';
			secs = '00';
			timerClass = 'text-white/40';
			return;
		}

		statusMsg = 'Shift Ends In';
		// Calculate precise H:M:S from endTime
		const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
		const [endH, endM] = result.endTime.split(':').map(Number);
		const end = new Date(now);
		end.setHours(endH, endM, 0, 0);

		const diffMs = end - now;
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

	async function fetchShifts() {
		try {
			const res = await fetch('/api/auth/shifts');
			if (res.ok) {
				const json = await res.json();
				shifts = json.data || [];
			}
		} catch (e) {
			console.error('Failed to fetch shifts:', e);
		} finally {
			loading = false;
			updateTimer();
		}
	}

	onMount(() => {
		fetchShifts();
		interval = setInterval(updateTimer, 1000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

{#if $isSidebarOpen}
<div class="flex flex-col bg-black/20 rounded-2xl p-5 shadow-inner w-full font-display min-h-[120px] justify-center">
	{#if loading}
		<div class="flex justify-center p-2">
			<div class="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
		</div>
	{:else}
		<span class="text-[10px] font-bold tracking-[0.15em] text-white/50 uppercase mb-4">{statusMsg}</span>
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
	{/if}
</div>
{:else}
<div class="flex items-center justify-center p-3 rounded-2xl bg-black/20 w-full" title="{statusMsg}: {hours}:{mins}:{secs}">
	{#if loading}
		<div class="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
	{:else}
		<span class="material-symbols-outlined {timerClass}" style="font-size: 24px;">timer</span>
	{/if}
</div>
{/if}


