<script>
	import { onMount } from "svelte";
	import { ADMIN_TABLES } from "$lib/utils/constants.js";

	let stats = {};
	let loading = true;

	const importantTables = [
		"users",
		"patients",
		"encounters",
		"payments",
		"items",
	];

	async function loadStats() {
		try {
			for (const key of importantTables) {
				const res = await fetch(`/api/admin/${key}?limit=1`);
				const data = await res.json();
				stats[key] = data.total || 0;
			}
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	onMount(loadStats);
</script>

<svelte:head>
	<title>Admin Dashboard — Oratio Clinic</title>
</svelte:head>

<div>
	<h1 class="page-title">Dashboard Admin</h1>

	{#if loading}
		<div style="text-align: center; padding: var(--space-16);">
			<div class="spinner spinner-lg" style="margin: 0 auto;"></div>
		</div>
	{:else}
		<div class="stats-grid mb-6">
			<div class="stat-card">
				<div class="stat-icon stat-icon-primary">👥</div>
				<div>
					<div class="stat-value">{stats.users || 0}</div>
					<div class="stat-label">Users</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon stat-icon-success">🏥</div>
				<div>
					<div class="stat-value">{stats.patients || 0}</div>
					<div class="stat-label">Patients</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon stat-icon-warning">📋</div>
				<div>
					<div class="stat-value">{stats.encounters || 0}</div>
					<div class="stat-label">Encounters</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon stat-icon-danger">💳</div>
				<div>
					<div class="stat-value">{stats.payments || 0}</div>
					<div class="stat-label">Payments</div>
				</div>
			</div>
		</div>

		<!-- Quick Links -->
		<div class="card">
			<h3 class="card-title mb-4">📂 Manajemen Data</h3>
			<div class="grid grid-3 gap-3">
				{#each Object.entries(ADMIN_TABLES) as [slug, config]}
					<a href="/admin/{slug}" class="quick-link">
						<span class="font-medium">{config.label}</span>
						<span class="text-xs text-muted">/{slug}</span>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.quick-link {
		display: flex;
		flex-direction: column;
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--text-primary);
		transition: all var(--transition-fast);
	}
	.quick-link:hover {
		background: var(--primary-light);
		border-color: var(--primary);
		transform: translateY(-2px);
		box-shadow: var(--shadow-sm);
	}
</style>
