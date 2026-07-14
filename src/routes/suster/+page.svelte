<script>
	import { onMount } from "svelte";

	export let data;
	$: user = data?.user;

	let greeting = "";

	onMount(() => {
		const hour = new Date().getHours();
		if (hour < 12) greeting = "Selamat Pagi";
		else if (hour < 15) greeting = "Selamat Siang";
		else if (hour < 18) greeting = "Selamat Sore";
		else greeting = "Selamat Malam";
	});
</script>

<svelte:head>
	<title>Suster Dashboard — Oratio Clinic</title>
</svelte:head>

<div class="suster-home">
	<!-- Welcome Section -->
	<div class="welcome-card">
		<div class="welcome-left">
			<p class="welcome-greeting">{greeting}, 👋</p>
			<h1 class="welcome-name">{user?.name || "Suster"}</h1>
			<p class="welcome-subtitle">Suster Panel — Oratio Clinic</p>
		</div>
		<div class="welcome-icon">
			<span class="material-symbols-outlined">health_and_safety</span>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="section-header">
		<span class="material-symbols-outlined section-icon">apps</span>
		<h2>Quick Actions</h2>
	</div>
	<div class="actions-grid">
		<a href="/suster/history" class="action-card">
			<div class="action-icon history-icon">
				<span class="material-symbols-outlined">history</span>
			</div>
			<div class="action-info">
				<h3>Encounter History</h3>
				<p>View and filter previous patient visit records, SOAP notes, and clinical photos.</p>
			</div>
			<span class="material-symbols-outlined action-arrow">arrow_forward</span>
		</a>
		<a href="/suster/edit-patient" class="action-card">
			<div class="action-icon edit-icon">
				<span class="material-symbols-outlined">edit_note</span>
			</div>
			<div class="action-info">
				<h3>Edit Data Pasien</h3>
				<p>Update patient personal information, medical history, allergies, and contact details.</p>
			</div>
			<span class="material-symbols-outlined action-arrow">arrow_forward</span>
		</a>
	</div>
</div>

<style>
	.suster-home {
		max-width: 960px;
		margin: 0 auto;
	}

	/* Welcome Card */
	.welcome-card {
		background: linear-gradient(135deg, #E11D48, #BE123C, #9F1239);
		border-radius: var(--radius-xl);
		padding: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: white;
		box-shadow: 0 8px 32px rgba(225, 29, 72, 0.3);
		margin-bottom: 2rem;
		position: relative;
		overflow: hidden;
	}

	.welcome-card::before {
		content: '';
		position: absolute;
		top: -50%;
		right: -20%;
		width: 60%;
		height: 200%;
		background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
		pointer-events: none;
	}

	.welcome-greeting {
		font-size: var(--font-size-sm);
		opacity: 0.85;
		font-weight: 500;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		margin-bottom: 0.25rem;
	}

	.welcome-name {
		font-size: var(--font-size-3xl);
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1.2;
		margin: 0.25rem 0;
	}

	.welcome-subtitle {
		font-size: var(--font-size-sm);
		opacity: 0.7;
		margin-top: 0.25rem;
	}

	.welcome-icon {
		width: 80px;
		height: 80px;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(8px);
		border-radius: var(--radius-xl);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.welcome-icon .material-symbols-outlined {
		font-size: 40px;
		color: white;
	}

	/* Section Header */
	.section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.section-icon {
		color: var(--primary);
		font-size: 20px;
	}

	.section-header h2 {
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--text-primary);
	}

	/* Actions Grid */
	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		gap: 1rem;
	}

	.action-card {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 1.5rem;
		background: var(--card-bg);
		border-radius: var(--radius-lg);
		border: 1px solid var(--border-color);
		text-decoration: none;
		color: inherit;
		transition: all 0.25s ease;
		box-shadow: var(--shadow-xs);
	}

	.action-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
		border-color: var(--primary);
	}

	.action-icon {
		width: 56px;
		height: 56px;
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.action-icon .material-symbols-outlined {
		font-size: 28px;
	}

	.history-icon {
		background: linear-gradient(135deg, #E11D48, #FB7185);
		color: white;
	}

	.history-icon .material-symbols-outlined {
		color: white;
	}

	.edit-icon {
		background: linear-gradient(135deg, #7C3AED, #A78BFA);
		color: white;
	}

	.edit-icon .material-symbols-outlined {
		color: white;
	}

	.action-info {
		flex: 1;
		min-width: 0;
	}

	.action-info h3 {
		font-size: var(--font-size-base);
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.action-info p {
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
		line-height: 1.4;
	}

	.action-arrow {
		color: var(--gray-400);
		font-size: 20px;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.action-card:hover .action-arrow {
		color: var(--primary);
		transform: translateX(4px);
	}

	@media (max-width: 768px) {
		.actions-grid {
			grid-template-columns: 1fr;
		}

		.welcome-card {
			padding: 1.5rem;
		}

		.welcome-name {
			font-size: var(--font-size-2xl);
		}

		.welcome-icon {
			width: 56px;
			height: 56px;
		}

		.welcome-icon .material-symbols-outlined {
			font-size: 28px;
		}
	}
</style>
