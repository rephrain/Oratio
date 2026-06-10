<script>
	import { connectionStatus } from '$lib/stores/realtimeConnection.js';
	import { fly, fade } from 'svelte/transition';

	const STATUS_CONFIG = {
		connecting: {
			icon: 'sync',
			label: 'Connecting...',
			class: 'text-amber-500',
			pulse: true
		},
		connected: {
			icon: 'check_circle',
			label: 'Real-time Linked',
			class: 'text-emerald-500',
			pulse: false
		},
		disconnected: {
			icon: 'cloud_off',
			label: 'Offline',
			class: 'text-slate-400',
			pulse: false
		},
		error: {
			icon: 'error',
			label: 'Connection Error',
			class: 'text-rose-500',
			pulse: true
		}
	};

	$: config = STATUS_CONFIG[$connectionStatus] || STATUS_CONFIG.disconnected;
</script>

<div class="rt-status-container" title={config.label}>
	<div class="rt-indicator {config.class}">
		<span class="material-symbols-outlined {config.pulse ? 'rt-pulse' : ''}">
			{config.icon}
		</span>
		<span class="rt-label">{config.label}</span>
	</div>
</div>

<style>
	.rt-status-container {
		display: flex;
		align-items: center;
		padding: 4px 12px;
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(8px);
		border-radius: 100px;
		border: 1px solid rgba(226, 232, 240, 0.8);
		cursor: help;
		transition: all 0.3s ease;
	}

	.rt-status-container:hover {
		background: #fff;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.rt-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.rt-indicator .material-symbols-outlined {
		font-size: 16px;
	}

	.rt-label {
		display: none;
	}

	@media (min-width: 768px) {
		.rt-label {
			display: block;
		}
	}

	.rt-pulse {
		animation: rtPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
	}

	@keyframes rtPulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(0.9); }
	}
</style>
