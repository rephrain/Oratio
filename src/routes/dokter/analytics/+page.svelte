<script>
	import { onMount, onDestroy } from "svelte";
	import { formatCurrency, formatDate } from "$lib/utils/formatters.js";
	import { STATUS_COLORS } from "$lib/utils/constants.js";

	export let data;
	$: user = data?.user;

	let encounters = [];
	let loading = true;
	let dateFrom = getMonthStart();
	let dateTo = new Date().toISOString().split("T")[0];

	// Chart instances
	let volumeChart = null;
	let treatmentChart = null;
	let diagnosisChart = null;
	let completionChart = null;

	// Canvas refs
	let volumeCanvas;
	let treatmentCanvas;
	let diagnosisCanvas;
	let completionCanvas;

	function getMonthStart() {
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
	}

	// KPI values
	$: patientsToday = encounters.filter((e) => {
		const d = new Date(e.encounter?.created_at).toDateString();
		return d === new Date().toDateString();
	}).length;

	$: patientsThisWeek = encounters.filter((e) => {
		const d = new Date(e.encounter?.created_at);
		const now = new Date();
		const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		return d >= weekAgo;
	}).length;

	$: patientsThisMonth = encounters.length;

	$: completedCount = encounters.filter(
		(e) => e.encounter?.status === "Completed",
	).length;
	$: dischargedCount = encounters.filter(
		(e) => e.encounter?.status === "Discharged",
	).length;
	$: cancelledCount = encounters.filter((e) =>
		["Cancelled", "Discontinued"].includes(e.encounter?.status),
	).length;
	$: inProgressCount = encounters.filter(
		(e) => e.encounter?.status === "In Progress",
	).length;
	$: completionRate = encounters.length
		? Math.round(
				((completedCount + dischargedCount) / encounters.length) * 100,
			)
		: 0;

	// Avg duration estimate (from created_at to updated_at for completed)
	$: avgDuration = (() => {
		const completed = encounters.filter((e) =>
			["Completed", "Discharged"].includes(e.encounter?.status),
		);
		if (!completed.length) return 0;
		let totalMs = 0;
		let validCount = 0;
		for (const e of completed) {
			const start = new Date(e.encounter.created_at);
			const end = new Date(e.encounter.updated_at);
			const diff = end - start;
			if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
				totalMs += diff;
				validCount++;
			}
		}
		return validCount > 0 ? Math.round(totalMs / validCount / 60000) : 0;
	})();

	// Diagnosis breakdown
	$: diagnosisMap = (() => {
		const map = {};
		encounters.forEach((e) => {
			if (e.encounter?.assessment) {
				const key = e.encounter.assessment.substring(0, 60);
				map[key] = (map[key] || 0) + 1;
			}
		});
		return Object.entries(map)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10);
	})();

	// Daily volume
	$: dailyVolume = (() => {
		const map = {};
		encounters.forEach((e) => {
			const d = new Date(e.encounter?.created_at).toLocaleDateString(
				"id-ID",
				{ day: "2-digit", month: "short" },
			);
			map[d] = (map[d] || 0) + 1;
		});
		return Object.entries(map);
	})();

	// Recent activity
	$: recentEncounters = [...encounters]
		.sort(
			(a, b) =>
				new Date(b.encounter?.created_at) -
				new Date(a.encounter?.created_at),
		)
		.slice(0, 10);

	// Referral data
	$: referralData = (() => {
		const refs = {};
		encounters.forEach((e) => {
			if (e.encounter?.referral_source) {
				const src = e.encounter.referral_source;
				const doc = e.doctor_name || "Unknown";
				const key = `${src} → ${doc}`;
				refs[key] = (refs[key] || 0) + 1;
			}
		});
		return Object.entries(refs)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10);
	})();

	async function loadData() {
		loading = true;
		try {
			const params = new URLSearchParams({
				date_from: dateFrom,
				date_to: dateTo,
				limit: "1000",
			});
			const res = await fetch(`/api/encounters?${params}`);
			const resp = await res.json();
			encounters = resp.data || [];
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
			// Render charts after data loads
			setTimeout(renderCharts, 50);
		}
	}

	async function renderCharts() {
		if (typeof window === "undefined") return;
		const { Chart, registerables } = await import("chart.js");
		Chart.register(...registerables);

		const colors = {
			primary: "#3B82F6",
			accent: "#38BDF8",
			success: "#10B981",
			warning: "#F59E0B",
			danger: "#EF4444",
			purple: "#8B5CF6",
			pink: "#EC4899",
			teal: "#14B8A6",
			orange: "#F97316",
			indigo: "#6366F1",
		};
		const palette = [
			colors.primary,
			colors.accent,
			colors.success,
			colors.warning,
			colors.danger,
			colors.purple,
			colors.pink,
			colors.teal,
			colors.orange,
			colors.indigo,
		];

		// Volume Line Chart
		if (volumeCanvas) {
			if (volumeChart) volumeChart.destroy();
			volumeChart = new Chart(volumeCanvas.getContext("2d"), {
				type: "line",
				data: {
					labels: dailyVolume.map((d) => d[0]),
					datasets: [
						{
							label: "Pasien",
							data: dailyVolume.map((d) => d[1]),
							borderColor: colors.primary,
							backgroundColor: colors.primary + "20",
							fill: true,
							tension: 0.4,
							pointRadius: 4,
							pointBackgroundColor: colors.primary,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: { display: false } },
					scales: {
						y: { beginAtZero: true, ticks: { stepSize: 1 } },
						x: { grid: { display: false } },
					},
				},
			});
		}

		// Top Diagnoses Bar Chart
		if (diagnosisCanvas && diagnosisMap.length > 0) {
			if (diagnosisChart) diagnosisChart.destroy();
			diagnosisChart = new Chart(diagnosisCanvas.getContext("2d"), {
				type: "bar",
				data: {
					labels: diagnosisMap.map((d) =>
						d[0].length > 30 ? d[0].substring(0, 30) + "..." : d[0],
					),
					datasets: [
						{
							label: "Jumlah",
							data: diagnosisMap.map((d) => d[1]),
							backgroundColor: palette.slice(
								0,
								diagnosisMap.length,
							),
							borderRadius: 6,
							barThickness: 24,
						},
					],
				},
				options: {
					indexAxis: "y",
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: { display: false } },
					scales: {
						x: { beginAtZero: true, ticks: { stepSize: 1 } },
						y: { grid: { display: false } },
					},
				},
			});
		}

		// Completion Rate Doughnut
		if (completionCanvas) {
			if (completionChart) completionChart.destroy();
			completionChart = new Chart(completionCanvas.getContext("2d"), {
				type: "doughnut",
				data: {
					labels: [
						"Selesai",
						"Discharged",
						"Dalam Proses",
						"Dibatalkan",
						"Lainnya",
					],
					datasets: [
						{
							data: [
								completedCount,
								dischargedCount,
								inProgressCount,
								cancelledCount,
								Math.max(
									0,
									encounters.length -
										completedCount -
										dischargedCount -
										inProgressCount -
										cancelledCount,
								),
							],
							backgroundColor: [
								colors.success,
								colors.teal,
								colors.primary,
								colors.danger,
								"#E5E7EB",
							],
							borderWidth: 0,
							hoverOffset: 8,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					cutout: "65%",
					plugins: {
						legend: {
							position: "bottom",
							labels: { padding: 12, usePointStyle: true },
						},
					},
				},
			});
		}

		// Treatment/Procedure Breakdown (reuse diagnosis canvas if no separate one)
		if (treatmentCanvas) {
			if (treatmentChart) treatmentChart.destroy();
			// Group by doctor for revenue-like view
			const doctorGroups = {};
			encounters.forEach((e) => {
				const doc = e.doctor_name || "N/A";
				doctorGroups[doc] = (doctorGroups[doc] || 0) + 1;
			});
			const docEntries = Object.entries(doctorGroups)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 6);

			treatmentChart = new Chart(treatmentCanvas.getContext("2d"), {
				type: "doughnut",
				data: {
					labels: docEntries.map((d) => d[0]),
					datasets: [
						{
							data: docEntries.map((d) => d[1]),
							backgroundColor: palette.slice(
								0,
								docEntries.length,
							),
							borderWidth: 0,
							hoverOffset: 8,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					cutout: "55%",
					plugins: {
						legend: {
							position: "bottom",
							labels: { padding: 12, usePointStyle: true },
						},
					},
				},
			});
		}
	}

	onMount(loadData);

	onDestroy(() => {
		if (volumeChart) volumeChart.destroy();
		if (treatmentChart) treatmentChart.destroy();
		if (diagnosisChart) diagnosisChart.destroy();
		if (completionChart) completionChart.destroy();
	});
</script>

<svelte:head>
	<title>Analytics — Oratio Clinic</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="page-title" style="margin: 0;">📊 Analytics & Statistik</h1>
		<div class="flex gap-3 items-center">
			<input
				type="date"
				class="form-input"
				style="width: auto;"
				bind:value={dateFrom}
			/>
			<span class="text-muted">—</span>
			<input
				type="date"
				class="form-input"
				style="width: auto;"
				bind:value={dateTo}
			/>
			<button class="btn btn-primary btn-sm" on:click={loadData}
				>Filter</button
			>
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
					<div class="stat-label">Periode Ini</div>
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
			<!-- Completion Rate Doughnut -->
			<div class="card">
				<h3 class="card-title mb-4">✅ Tingkat Penyelesaian</h3>
				<div style="position: relative; text-align: center;">
					<div style="height: 220px;">
						<canvas bind:this={completionCanvas}></canvas>
					</div>
					<div
						style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -70%); font-size: 2rem; font-weight: 800; color: var(--primary);"
					>
						{completionRate}%
					</div>
				</div>
			</div>

			<!-- Patient Volume Line Chart -->
			<div class="card">
				<h3 class="card-title mb-4">📈 Volume Pasien Harian</h3>
				{#if dailyVolume.length > 0}
					<div style="height: 220px;">
						<canvas bind:this={volumeCanvas}></canvas>
					</div>
				{:else}
					<p class="text-sm text-muted">Tidak ada data</p>
				{/if}
			</div>
		</div>

		<div class="grid grid-2 gap-6 mb-6">
			<!-- Top Diagnoses Bar Chart -->
			<div class="card">
				<h3 class="card-title mb-4">🏥 Diagnosis Terbanyak</h3>
				{#if diagnosisMap.length > 0}
					<div
						style="height: {Math.max(
							200,
							diagnosisMap.length * 36,
						)}px;"
					>
						<canvas bind:this={diagnosisCanvas}></canvas>
					</div>
				{:else}
					<p class="text-sm text-muted">Tidak ada data diagnosis</p>
				{/if}
			</div>

			<!-- Encounters by Doctor Doughnut -->
			<div class="card">
				<h3 class="card-title mb-4">👨‍⚕️ Distribusi per Dokter</h3>
				{#if encounters.length > 0}
					<div style="height: 250px;">
						<canvas bind:this={treatmentCanvas}></canvas>
					</div>
				{:else}
					<p class="text-sm text-muted">Tidak ada data</p>
				{/if}
			</div>
		</div>

		<div class="grid grid-2 gap-6 mb-6">
			<!-- Referral Flow Table -->
			<div class="card">
				<h3 class="card-title mb-4">🔄 Alur Rujukan</h3>
				{#if referralData.length > 0}
					<div class="table-container">
						<table>
							<thead>
								<tr>
									<th>Rujukan</th>
									<th>Jumlah</th>
								</tr>
							</thead>
							<tbody>
								{#each referralData as [ref, count]}
									<tr>
										<td class="text-sm">{ref}</td>
										<td
											><span class="badge badge-primary"
												>{count}</span
											></td
										>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="text-sm text-muted">Tidak ada data rujukan</p>
				{/if}
			</div>

			<!-- Recent Activity -->
			<div class="card">
				<h3 class="card-title mb-4">🕐 Aktivitas Terbaru</h3>
				<div style="max-height: 300px; overflow-y: auto;">
					{#each recentEncounters as item}
						<div
							style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) 0; border-bottom: 1px solid var(--border-color);"
						>
							<div
								style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary); flex-shrink: 0;"
							></div>
							<div style="flex: 1; min-width: 0;">
								<div class="text-sm font-medium truncate">
									{item.patient_name || "-"}
								</div>
								<div class="text-xs text-muted">
									{formatDate(item.encounter?.created_at)} · Dr.
									{item.doctor_name || "-"}
								</div>
							</div>
							<span
								class="badge {STATUS_COLORS[
									item.encounter?.status
								] || 'badge-gray'}"
								>{item.encounter?.status}</span
							>
						</div>
					{:else}
						<p class="text-sm text-muted">Tidak ada aktivitas</p>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
