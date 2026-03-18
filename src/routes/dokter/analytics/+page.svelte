<script>
	import { onMount } from 'svelte';
	import { formatCurrency, formatDate } from '$lib/utils/formatters.js';

	export let data;
	$: user = data?.user;

	let encounters = [];
	let loading = true;
	let dateFrom = getMonthStart();
	let dateTo = new Date().toISOString().split('T')[0];

	// helper for chart
	function getMaxVolume(volume) { return Math.max(...volume.map(d => d[1]), 1); }
	function getBarHeight(count, maxCount) { return maxCount ? (count / maxCount) * 120 : 0; }

	function getMonthStart() {
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
	}

	// KPI values
	$: patientsToday = encounters.filter(e => {
		const d = new Date(e.encounter?.created_at).toDateString();
		return d === new Date().toDateString();
	}).length;

	$: patientsThisWeek = encounters.filter(e => {
		const d = new Date(e.encounter?.created_at);
		const now = new Date();
		const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		return d >= weekAgo;
	}).length;

	$: patientsThisMonth = encounters.length;

	$: completedCount = encounters.filter(e => e.encounter?.status === 'Completed').length;
	$: cancelledCount = encounters.filter(e => ['Cancelled', 'Discontinued'].includes(e.encounter?.status)).length;
	$: completionRate = encounters.length ? Math.round((completedCount / encounters.length) * 100) : 0;

	// Avg duration
	$: avgDuration = (() => {
		const completed = encounters.filter(e => e.encounter?.status === 'Completed' || e.encounter?.status === 'Discharged');
		if (!completed.length) return 0;
		return Math.round(completed.length > 0 ? 25 : 0); // placeholder
	})();

	// Diagnosis breakdown
	$: diagnosisMap = (() => {
		const map = {};
		encounters.forEach(e => {
			if (e.encounter?.assessment) {
				const key = e.encounter.assessment.substring(0, 50);
				map[key] = (map[key] || 0) + 1;
			}
		});
		return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
	})();

	// Recent activity
	$: recentEncounters = encounters
		.sort((a, b) => new Date(b.encounter?.created_at) - new Date(a.encounter?.created_at))
		.slice(0, 10);

	// Daily volume
	$: dailyVolume = (() => {
		const map = {};
		encounters.forEach(e => {
			const d = new Date(e.encounter?.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
			map[d] = (map[d] || 0) + 1;
		});
		return Object.entries(map);
	})();

	async function loadData() {
		loading = true;
		try {
			const params = new URLSearchParams();
			const res = await fetch(`/api/encounters?limit=500`);
			const resp = await res.json();
			encounters = resp.data || [];
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	onMount(loadData);
</script>

<svelte:head>
	<title>Analytics — Oratio Dental</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="page-title" style="margin: 0;">📊 Analytics & Statistik</h1>
		<div class="flex gap-3 items-center">
			<input type="date" class="form-input" style="width: auto;" bind:value={dateFrom} />
			<span class="text-muted">—</span>
			<input type="date" class="form-input" style="width: auto;" bind:value={dateTo} />
			<button class="btn btn-primary btn-sm" on:click={loadData}>Filter</button>
		</div>
	</div>

	{#if loading}
		<div style="text-align: center; padding: var(--space-16);">
			<div class="spinner spinner-lg" style="margin: 0 auto;"></div>
		</div>
	{:else}
		<!-- KPI Cards -->
		<div class="stats-grid mb-6">
			<div class="stat-card">
				<div class="stat-icon stat-icon-primary">📅</div>
				<div>
					<div class="stat-value">{patientsToday}</div>
					<div class="stat-label">Pasien Hari Ini</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon stat-icon-success">📆</div>
				<div>
					<div class="stat-value">{patientsThisWeek}</div>
					<div class="stat-label">Minggu Ini</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon stat-icon-warning">📊</div>
				<div>
					<div class="stat-value">{patientsThisMonth}</div>
					<div class="stat-label">Bulan Ini</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon stat-icon-danger">⏱</div>
				<div>
					<div class="stat-value">{avgDuration} min</div>
					<div class="stat-label">Rata-rata Durasi</div>
				</div>
			</div>
		</div>

		<div class="grid grid-2 gap-6 mb-6">
			<!-- Completion Rate -->
			<div class="card">
				<h3 class="card-title mb-4">✅ Tingkat Penyelesaian</h3>
				<div style="text-align: center; padding: var(--space-4);">
					<div style="font-size: 3rem; font-weight: 800; color: var(--primary);">{completionRate}%</div>
					<div class="text-sm text-muted mt-2">
						{completedCount} selesai · {cancelledCount} dibatalkan
					</div>
					<div style="background: var(--gray-100); border-radius: var(--radius-full); height: 12px; margin-top: var(--space-4); overflow: hidden;">
						<div style="background: var(--success); height: 100%; width: {completionRate}%; border-radius: var(--radius-full); transition: width 0.5s ease;"></div>
					</div>
				</div>
			</div>

			<!-- Patient Volume -->
			<div class="card">
				<h3 class="card-title mb-4">📈 Volume Pasien Harian</h3>
				{#if dailyVolume.length > 0}
					<div style="display: flex; align-items: flex-end; gap: 4px; height: 150px; padding: var(--space-2);">
						{#each dailyVolume as [day, count]}
							<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
								<span class="text-xs font-bold">{count}</span>
								<div style="width: 100%; height: {getBarHeight(count, getMaxVolume(dailyVolume))}px; background: linear-gradient(180deg, var(--primary), var(--accent)); border-radius: var(--radius-sm) var(--radius-sm) 0 0; min-height: 4px;"></div>
								<span class="text-xs text-muted">{day}</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted">Tidak ada data</p>
				{/if}
			</div>
		</div>

		<div class="grid grid-2 gap-6 mb-6">
			<!-- Top Diagnoses -->
			<div class="card">
				<h3 class="card-title mb-4">🏥 Diagnosis Terbanyak</h3>
				{#if diagnosisMap.length > 0}
					{#each diagnosisMap as [diagnosis, count]}
						<div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2);">
							<div style="flex: 1;">
								<div class="text-sm truncate">{diagnosis}</div>
								<div style="background: var(--gray-100); border-radius: var(--radius-full); height: 6px; margin-top: 4px; overflow: hidden;">
									<div style="background: var(--primary); height: 100%; width: {(count / (diagnosisMap[0]?.[1] || 1)) * 100}%; border-radius: var(--radius-full);"></div>
								</div>
							</div>
							<span class="badge badge-primary">{count}</span>
						</div>
					{/each}
				{:else}
					<p class="text-sm text-muted">Tidak ada data diagnosis</p>
				{/if}
			</div>

			<!-- Recent Activity -->
			<div class="card">
				<h3 class="card-title mb-4">🕐 Aktivitas Terbaru</h3>
				<div style="max-height: 300px; overflow-y: auto;">
					{#each recentEncounters as item}
						<div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) 0; border-bottom: 1px solid var(--border-color);">
							<div style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary); flex-shrink: 0;"></div>
							<div style="flex: 1; min-width: 0;">
								<div class="text-sm font-medium truncate">{item.patient_name || '-'}</div>
								<div class="text-xs text-muted">{formatDate(item.encounter?.created_at)}</div>
							</div>
							<span class="badge badge-gray">{item.encounter?.status}</span>
						</div>
					{:else}
						<p class="text-sm text-muted">Tidak ada aktivitas</p>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
