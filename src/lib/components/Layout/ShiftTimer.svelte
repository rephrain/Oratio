<script>
	import { onMount, onDestroy } from 'svelte';

	// Hardcoded fallback for UI demonstration.
	// In reality, this would be fetched from the database / current session.
	let shiftEnd = new Date();
	shiftEnd.setHours(17, 0, 0, 0); // Example: 5 PM

	let timeRemaining = 'Menghitung...';
	let timerClass = 'timer-normal';
	let interval;

	function updateTimer() {
		const now = new Date();
		const diffMs = shiftEnd - now;

		if (diffMs <= 0) {
			timeRemaining = 'Shift berakhir';
			timerClass = 'timer-critical';
			return;
		}

		const totalMinutes = Math.floor(diffMs / 1000 / 60);
		const hours = Math.floor(totalMinutes / 60);
		const mins = totalMinutes % 60;

		timeRemaining = `${hours}j ${mins}m tersisa`;

		if (totalMinutes < 10) {
			timerClass = 'timer-critical pulse';
		} else if (totalMinutes < 30) {
			timerClass = 'timer-warning pulse';
		} else {
			timerClass = 'timer-normal';
		}
	}

	onMount(() => {
		updateTimer();
		interval = setInterval(updateTimer, 60000); // update every minute
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

<div class="shift-timer {timerClass}">
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
		<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
	</svg>
	<span class="font-medium text-sm">
		Shift s/d {shiftEnd.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {timeRemaining}
	</span>
</div>

<style>
	.shift-timer {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 12px;
		border-radius: var(--radius-full);
		transition: all 0.3s ease;
	}

	.timer-normal {
		background-color: var(--primary-light);
		color: var(--primary);
	}

	.timer-warning {
		background-color: var(--warning-light);
		color: #92400e;
	}

	.timer-critical {
		background-color: var(--danger-light);
		color: var(--danger);
	}

	@keyframes pulse-warn {
		0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
		70% { box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
		100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
	}

	@keyframes pulse-crit {
		0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
		70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
		100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
	}

	.timer-warning.pulse {
		animation: pulse-warn 2s infinite;
	}

	.timer-critical.pulse {
		animation: pulse-crit 1s infinite;
	}
</style>
