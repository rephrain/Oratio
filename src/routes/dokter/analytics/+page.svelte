<script>
	import { onMount, onDestroy } from "svelte";
	import { formatCurrency } from "$lib/utils/formatters.js";
	import { STATUS_COLORS } from "$lib/utils/constants.js";

	export let data;
	$: user = data?.user;

	let analytics = null;
	let loading = true;
	let error = null;

	// Date range
	let dateFrom = getMonthStart();
	let dateTo = getTodayStr();
	let quickRange = "month";

	// View mode toggle: 'all' | 'clinical' | 'revenue'
	let viewMode = "all";

	// Re-render charts when view mode changes (canvas elements get recreated by {#if} blocks)
	$: if (viewMode && analytics && !loading) {
		// Use tick + setTimeout to wait for Svelte to re-mount canvas elements
		import('svelte').then(({ tick }) => tick()).then(() => {
			setTimeout(renderCharts, 80);
		});
	}

	// Chart instances
	let charts = {};
	let canvasRefs = {};

	const DAYS_ID = [
		"Minggu",
		"Senin",
		"Selasa",
		"Rabu",
		"Kamis",
		"Jumat",
		"Sabtu",
	];

	function getTodayStr() {
		const d = new Date(
			new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
		);
		return d.toISOString().split("T")[0];
	}

	function getMonthStart() {
		const d = new Date(
			new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
		);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
	}

	function setQuickRange(range) {
		quickRange = range;
		const now = new Date(
			new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
		);
		dateTo = now.toISOString().split("T")[0];

		switch (range) {
			case "today":
				dateFrom = dateTo;
				break;
			case "week":
				const weekAgo = new Date(now.getTime() - 7 * 86400000);
				dateFrom = weekAgo.toISOString().split("T")[0];
				break;
			case "month":
				dateFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
				break;
			case "3months":
				const m3 = new Date(now);
				m3.setMonth(m3.getMonth() - 3);
				dateFrom = m3.toISOString().split("T")[0];
				break;
			case "6months":
				const m6 = new Date(now);
				m6.setMonth(m6.getMonth() - 6);
				dateFrom = m6.toISOString().split("T")[0];
				break;
			case "year":
				dateFrom = `${now.getFullYear()}-01-01`;
				break;
			case "all":
				dateFrom = "";
				dateTo = "";
				break;
		}
		loadData();
	}

	import { headerTitle } from "$lib/stores/layout.js";

	let refreshInterval;

	onMount(() => {
		headerTitle.set("Analytics & Statistik");
		loadData();
		refreshInterval = setInterval(() => loadData(true), 60000); // 1 minute is fine for analytics
	});

	onDestroy(() => {
		headerTitle.set(null);
		if (refreshInterval) clearInterval(refreshInterval);
	});

	async function loadData(isBg = false) {
		if (!isBg) loading = true;
		error = null;
		try {
			const params = new URLSearchParams({
				date_from: dateFrom,
				date_to: dateTo,
			});
			const res = await fetch(`/api/analytics?${params}`);
			if (!res.ok) throw new Error("Gagal memuat data analytics");
			analytics = await res.json();
		} catch (err) {
			console.error(err);
			error = err.message;
		} finally {
			if (!isBg) loading = false;
			setTimeout(renderCharts, 80);
		}
	}

	$: peakDay = (() => {
		if (!analytics?.dailyVolume?.length) return null;
		const sorted = [...analytics.dailyVolume].sort((a, b) => b.count - a.count);
		const top = sorted[0];
		if (!top || top.count === 0) return null;

		const dt = new Date(top.date);
		return {
			name: dt.toLocaleDateString("id-ID", {
				weekday: "long",
				timeZone: "Asia/Jakarta",
			}),
			date: dt.toLocaleDateString("id-ID", {
				day: "2-digit",
				month: "short",
				timeZone: "Asia/Jakarta",
			}),
			count: top.count,
		};
	})();

	$: peakHour = (() => {
		if (!analytics?.hourlyDist?.length) return null;
		const sorted = [...analytics.hourlyDist].sort((a, b) => b.count - a.count);
		const top = sorted[0];
		if (!top || top.count === 0) return null;

		const startHour = String(top.hour).padStart(2, "0") + ":00";
		const endHour = String((top.hour + 1) % 24).padStart(2, "0") + ":00";

		return {
			label: `${startHour} - ${endHour}`,
			count: top.count,
		};
	})();

	// Color palette
	const C = {
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
		lime: "#84CC16",
		cyan: "#06B6D4",
		rose: "#F43F5E",
		amber: "#D97706",
		emerald: "#059669",
	};
	const palette = [
		C.primary,
		C.accent,
		C.success,
		C.warning,
		C.danger,
		C.purple,
		C.pink,
		C.teal,
		C.orange,
		C.indigo,
		C.lime,
		C.cyan,
		C.rose,
		C.amber,
		C.emerald,
	];

	async function renderCharts() {
		if (typeof window === "undefined" || !analytics) return;
		const { Chart, registerables } = await import("chart.js");
		Chart.register(...registerables);

		// Destroy existing charts
		Object.values(charts).forEach((c) => c?.destroy());
		charts = {};

		const defaultFont = {
			family: "'Inter', 'Segoe UI', -apple-system, sans-serif",
			size: 12,
			weight: 500,
		};
		Chart.defaults.font = defaultFont;
		Chart.defaults.color = "#64748B";
		Chart.defaults.scale.grid.color = "rgba(241, 245, 249, 0.6)";
		Chart.defaults.scale.grid.borderDash = [4, 4];

		// Premium Tooltips
		Chart.defaults.plugins.tooltip.backgroundColor =
			"rgba(15, 23, 42, 0.85)";
		Chart.defaults.plugins.tooltip.titleFont = {
			size: 13,
			weight: "bold",
			family: defaultFont.family,
		};
		Chart.defaults.plugins.tooltip.bodyFont = {
			size: 12,
			family: defaultFont.family,
		};
		Chart.defaults.plugins.tooltip.padding = 12;
		Chart.defaults.plugins.tooltip.cornerRadius = 8;
		Chart.defaults.plugins.tooltip.displayColors = true;
		Chart.defaults.plugins.tooltip.boxPadding = 6;

		// Smooth animations
		Chart.defaults.animation.duration = 800;
		Chart.defaults.animation.easing = "easeOutQuart";

		// -- Daily Volume Line Chart --
		if (canvasRefs.volume && analytics.dailyVolume?.length > 0) {
			const ctx = canvasRefs.volume.getContext("2d");
			const gradient = ctx.createLinearGradient(0, 0, 0, 240);
			gradient.addColorStop(0, C.primary + "40"); // 25% opacity
			gradient.addColorStop(1, C.primary + "00"); // 0% opacity

			charts.volume = new Chart(ctx, {
				type: "line",
				data: {
					labels: analytics.dailyVolume.map((d) => {
						const dt = new Date(d.date);
						return dt.toLocaleDateString("id-ID", {
							day: "2-digit",
							month: "short",
							timeZone: "Asia/Jakarta",
						});
					}),
					datasets: [
						{
							label: "Pasien",
							data: analytics.dailyVolume.map((d) => d.count),
							borderColor: C.primary,
							backgroundColor: gradient,
							fill: true,
							tension: 0.4,
							pointRadius: 4,
							pointBackgroundColor: "white",
							pointBorderColor: C.primary,
							pointBorderWidth: 2,
							pointHoverRadius: 7,
							pointHoverBackgroundColor: C.primary,
							pointHoverBorderColor: "white",
							borderWidth: 3,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { display: false },
						tooltip: { mode: "index", intersect: false },
					},
					scales: {
						y: {
							beginAtZero: true,
							ticks: { stepSize: 1, padding: 10 },
							border: { display: false },
						},
						x: {
							grid: { display: false },
							border: { display: false },
							ticks: { padding: 10 },
						},
					},
					interaction: {
						mode: "nearest",
						axis: "x",
						intersect: false,
					},
				},
			});
		}

		// -- Status Doughnut --
		if (canvasRefs.status && analytics.statusBreakdown) {
			const allStatuses = [
				"Planned",
				"In Progress",
				"On Hold",
				"Discharged",
				"Completed",
				"Cancelled",
				"Discontinued",
			];
			const statusColors = {
				Completed: C.success,
				Discharged: C.teal,
				"In Progress": C.primary,
				Planned: C.accent,
				"On Hold": C.warning,
				Cancelled: C.danger,
				Discontinued: C.pink,
			};

			// Ensure all statuses exist even if backend returns 0 for them
			const statusMap = Object.fromEntries(
				allStatuses.map((s) => [s, 0]),
			);
			(analytics.statusBreakdown || []).forEach((s) => {
				statusMap[s.status] = s.count;
			});

			const mappedData = allStatuses.map((s) => ({
				status: s,
				count: statusMap[s],
			}));

			charts.status = new Chart(canvasRefs.status.getContext("2d"), {
				type: "doughnut",
				data: {
					labels: mappedData.map((s) => s.status),
					datasets: [
						{
							data: mappedData.map((s) => s.count),
							backgroundColor: mappedData.map(
								(s) => statusColors[s.status] || "#E5E7EB",
							),
							borderWidth: 2,
							borderColor: "white",
							hoverOffset: 8,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					cutout: "75%",
					plugins: {
						legend: {
							position: "bottom",
							labels: {
								padding: 15,
								usePointStyle: true,
								pointStyle: "circle",
								font: { size: 11 },
							},
						},
					},
				},
			});
		}

		// -- Hourly Distribution Bar --
		if (canvasRefs.hourly && analytics.hourlyDist?.length > 0) {
			const hours = Array.from({ length: 24 }, (_, i) => i);
			const hourMap = {};
			analytics.hourlyDist.forEach((h) => (hourMap[h.hour] = h.count));
			charts.hourly = new Chart(canvasRefs.hourly.getContext("2d"), {
				type: "bar",
				data: {
					labels: hours
						.filter((h) => h >= 6 && h <= 22)
						.map((h) => `${String(h).padStart(2, "0")}:00`),
					datasets: [
						{
							label: "Pasien",
							data: hours
								.filter((h) => h >= 6 && h <= 22)
								.map((h) => hourMap[h] || 0),
							backgroundColor: hours
								.filter((h) => h >= 6 && h <= 22)
								.map((h) => {
									const v = hourMap[h] || 0;
									const max = Math.max(
										...Object.values(hourMap),
										1,
									);
									const intensity = Math.round(
										40 + (v / max) * 60,
									);
									return `hsla(217, 91%, ${intensity}%, 0.85)`;
								}),
							borderRadius: 6,
							barPercentage: 0.6,
							borderSkipped: false,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: { display: false } },
					scales: {
						y: {
							beginAtZero: true,
							ticks: { stepSize: 1, padding: 8 },
							border: { display: false },
						},
						x: {
							grid: { display: false },
							border: { display: false },
							ticks: { padding: 8 },
						},
					},
				},
			});
		}

		// -- Day of Week Bar --
		if (canvasRefs.dow && analytics.dowDist?.length > 0) {
			const dowMap = {};
			analytics.dowDist.forEach((d) => (dowMap[d.dow] = d.count));
			charts.dow = new Chart(canvasRefs.dow.getContext("2d"), {
				type: "bar",
				data: {
					labels: DAYS_ID,
					datasets: [
						{
							label: "Pasien",
							data: DAYS_ID.map((_, i) => dowMap[i] || 0),
							backgroundColor: DAYS_ID.map((_, i) =>
								i === 0 ? C.danger + "22" : C.primary + "22",
							),
							borderColor: DAYS_ID.map((_, i) =>
								i === 0 ? C.danger : C.primary,
							),
							borderWidth: 2,
							borderRadius: 8,
							barPercentage: 0.55,
							borderSkipped: false,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: { display: false } },
					scales: {
						y: {
							beginAtZero: true,
							ticks: { stepSize: 1, padding: 8 },
							border: { display: false },
						},
						x: {
							grid: { display: false },
							border: { display: false },
							ticks: { padding: 8 },
						},
					},
				},
			});
		}

		// -- Top Diagnoses Horizontal Bar --
		if (canvasRefs.diagnoses && analytics.topDiagnoses?.length > 0) {
			charts.diagnoses = new Chart(
				canvasRefs.diagnoses.getContext("2d"),
				{
					type: "bar",
					data: {
						labels: analytics.topDiagnoses.map((d) =>
							truncLabel(d.display, 35),
						),
						datasets: [
							{
								label: "Jumlah",
								data: analytics.topDiagnoses.map(
									(d) => d.count,
								),
								backgroundColor: palette
									.slice(0, analytics.topDiagnoses.length)
									.map((c) => c + "E6"),
								borderRadius: 6,
								barThickness: 20,
								borderSkipped: false,
							},
						],
					},
					options: {
						indexAxis: "y",
						responsive: true,
						maintainAspectRatio: false,
						plugins: { legend: { display: false } },
						scales: {
							x: {
								beginAtZero: true,
								ticks: { stepSize: 1 },
								border: { display: false },
							},
							y: {
								grid: { display: false },
								border: { display: false },
								ticks: { padding: 10, font: { size: 11 } },
							},
						},
					},
				},
			);
		}

		// -- Top Items Revenue Bar --
		if (canvasRefs.items && analytics.topItems?.length > 0) {
			charts.items = new Chart(canvasRefs.items.getContext("2d"), {
				type: "bar",
				data: {
					labels: analytics.topItems.map((d) =>
						truncLabel(d.name, 30),
					),
					datasets: [
						{
							label: "Pendapatan",
							data: analytics.topItems.map((d) =>
								Number(d.total_revenue),
							),
							backgroundColor: palette
								.slice(0, analytics.topItems.length)
								.map((c) => c + "CC"),
							borderColor: palette.slice(0, analytics.topItems.length),
							borderWidth: 2,
							hoverBackgroundColor: palette.slice(0, analytics.topItems.length),
							borderRadius: 8,
							barThickness: 24,
							borderSkipped: false,
						},
					],
				},
				options: {
					indexAxis: "y",
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { display: false },
						tooltip: {
							callbacks: {
								label: (ctx) => formatCurrency(ctx.raw),
							},
						},
					},
					scales: {
						x: {
							beginAtZero: true,
							border: { display: false },
							ticks: { callback: (v) => formatCurrency(v) },
						},
						y: {
							grid: { display: false },
							border: { display: false },
							ticks: { padding: 10, font: { size: 11 } },
						},
					},
				},
			});
		}

		// -- Revenue by Group Doughnut --
		if (canvasRefs.revenueGroup && analytics.revenueByGroup?.length > 0) {
			charts.revenueGroup = new Chart(
				canvasRefs.revenueGroup.getContext("2d"),
				{
					type: "doughnut",
					data: {
						labels: analytics.revenueByGroup.map(
							(d) => d.item_group || "Lainnya",
						),
						datasets: [
							{
								data: analytics.revenueByGroup.map((d) =>
									Number(d.total_revenue),
								),
								backgroundColor: palette.slice(
									0,
									analytics.revenueByGroup.length,
								).map(c => c + "E6"),
								hoverBackgroundColor: palette.slice(
									0,
									analytics.revenueByGroup.length,
								),
								borderWidth: 3,
								borderColor: "white",
								hoverOffset: 12,
							},
						],
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						cutout: "72%",
						plugins: {
							legend: {
								position: "bottom",
								labels: {
									padding: 15,
									usePointStyle: true,
									pointStyle: "circle",
									font: { size: 11 },
								},
							},
							tooltip: {
								callbacks: {
									label: (ctx) =>
										`${ctx.label}: ${formatCurrency(ctx.raw)}`,
								},
							},
						},
					},
				},
			);
		}

		// -- Daily Revenue Line Chart --
		if (canvasRefs.revenueTrend && analytics.dailyRevenue?.length > 0) {
			const rCtx = canvasRefs.revenueTrend.getContext("2d");
			const revGradient = rCtx.createLinearGradient(0, 0, 0, 240);
			revGradient.addColorStop(0, C.success + "40");
			revGradient.addColorStop(1, C.success + "00");

			charts.revenueTrend = new Chart(rCtx, {
				type: "line",
				data: {
					labels: analytics.dailyRevenue.map((d) => {
						const dt = new Date(d.date);
						return dt.toLocaleDateString("id-ID", {
							day: "2-digit",
							month: "short",
							timeZone: "Asia/Jakarta",
						});
					}),
					datasets: [
						{
							label: "Revenue",
							data: analytics.dailyRevenue.map((d) =>
								Number(d.revenue),
							),
							borderColor: C.success,
							backgroundColor: revGradient,
							fill: true,
							tension: 0.4,
							pointRadius: 4,
							pointBackgroundColor: "white",
							pointBorderColor: C.success,
							pointBorderWidth: 2,
							pointHoverRadius: 7,
							pointHoverBackgroundColor: C.success,
							pointHoverBorderColor: "white",
							borderWidth: 3,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { display: false },
						tooltip: {
							mode: "index",
							intersect: false,
							callbacks: {
								label: (ctx) =>
									`Revenue: ${formatCurrency(ctx.raw)}`,
							},
						},
					},
					scales: {
						y: {
							beginAtZero: true,
							border: { display: false },
							ticks: {
								padding: 10,
								callback: (v) => formatCurrency(v),
							},
						},
						x: {
							grid: { display: false },
							border: { display: false },
							ticks: { padding: 10 },
						},
					},
					interaction: {
						mode: "nearest",
						axis: "x",
						intersect: false,
					},
				},
			});
		}

		// -- Gender Pie --
		if (canvasRefs.gender && analytics.genderDist?.length > 0) {
			const genderLabels = {
				male: "Laki-laki",
				female: "Perempuan",
				unknown: "Tidak Diketahui",
			};
			const genderColors = {
				male: C.primary,
				female: C.pink,
				unknown: "#CBD5E1",
			};
			charts.gender = new Chart(canvasRefs.gender.getContext("2d"), {
				type: "doughnut",
				data: {
					labels: analytics.genderDist.map(
						(g) => genderLabels[g.gender] || g.gender,
					),
					datasets: [
						{
							data: analytics.genderDist.map((g) => g.count),
							backgroundColor: analytics.genderDist.map(
								(g) => genderColors[g.gender] || "#94A3B8",
							),
							borderWidth: 2,
							borderColor: "white",
							hoverOffset: 8,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					cutout: "72%",
					plugins: {
						legend: {
							position: "bottom",
							labels: {
								padding: 15,
								usePointStyle: true,
								pointStyle: "circle",
							},
						},
					},
				},
			});
		}

		// -- Age Distribution Bar --
		if (canvasRefs.age && analytics.ageDist?.length > 0) {
			charts.age = new Chart(canvasRefs.age.getContext("2d"), {
				type: "bar",
				data: {
					labels: analytics.ageDist.map((a) => a.age_group + " thn"),
					datasets: [
						{
							label: "Pasien",
							data: analytics.ageDist.map((a) => a.count),
							backgroundColor: [
								C.cyan,
								C.accent,
								C.primary,
								C.purple,
								C.indigo,
								C.warning,
								C.orange,
							].map((c) => c + "E6"),
							borderRadius: 8,
							barPercentage: 0.65,
							borderSkipped: false,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: { display: false } },
					scales: {
						y: {
							beginAtZero: true,
							ticks: { stepSize: 1, padding: 8 },
							border: { display: false },
						},
						x: {
							grid: { display: false },
							border: { display: false },
							ticks: { padding: 8 },
						},
					},
				},
			});
		}

		// -- Top Teeth Bar --
		if (canvasRefs.teeth && analytics.topTeeth?.length > 0) {
			charts.teeth = new Chart(canvasRefs.teeth.getContext("2d"), {
				type: "bar",
				data: {
					labels: analytics.topTeeth.map(
						(t) => `Gigi ${t.tooth_number}`,
					),
					datasets: [
						{
							label: "Tindakan",
							data: analytics.topTeeth.map((t) => t.count),
							backgroundColor: C.teal + "22",
							borderColor: C.teal,
							borderWidth: 2,
							borderRadius: 8,
							barPercentage: 0.6,
							borderSkipped: false,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: { display: false } },
					scales: {
						y: {
							beginAtZero: true,
							ticks: { stepSize: 1, padding: 8 },
							border: { display: false },
						},
						x: {
							grid: { display: false },
							border: { display: false },
							ticks: { padding: 8 },
						},
					},
				},
			});
		}

		// -- Payment Method Doughnut --
		if (canvasRefs.paymentMethod && analytics.paymentMethodBreakdown?.length > 0) {
			const pmColors = [C.success, C.primary, C.purple, C.orange, C.teal, C.pink, C.amber];
			charts.paymentMethod = new Chart(canvasRefs.paymentMethod.getContext("2d"), {
				type: "doughnut",
				data: {
					labels: analytics.paymentMethodBreakdown.map((d) => d.payment_type),
					datasets: [{
						data: analytics.paymentMethodBreakdown.map((d) => Number(d.total_amount)),
						backgroundColor: pmColors.slice(0, analytics.paymentMethodBreakdown.length).map(c => c + "E6"),
						hoverBackgroundColor: pmColors.slice(0, analytics.paymentMethodBreakdown.length),
						borderWidth: 3,
						borderColor: "white",
						hoverOffset: 12,
					}],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					cutout: "72%",
					plugins: {
						legend: {
							position: "bottom",
							labels: { padding: 15, usePointStyle: true, pointStyle: "circle", font: { size: 11 } },
						},
						tooltip: {
							callbacks: {
								label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}`,
							},
						},
					},
				},
			});
		}

		// -- Revenue by Day of Week --
		if (canvasRefs.revenueDow && analytics.revenueDow?.length > 0) {
			const dowRevMap = {};
			analytics.revenueDow.forEach((d) => (dowRevMap[d.dow] = Number(d.revenue)));
			
			const rDowCtx = canvasRefs.revenueDow.getContext("2d");
			const rDowGrad = rDowCtx.createLinearGradient(0, 0, 0, 240);
			rDowGrad.addColorStop(0, C.success + "CC");
			rDowGrad.addColorStop(1, C.success + "33");
			const rDowDangerGrad = rDowCtx.createLinearGradient(0, 0, 0, 240);
			rDowDangerGrad.addColorStop(0, C.danger + "CC");
			rDowDangerGrad.addColorStop(1, C.danger + "33");

			charts.revenueDow = new Chart(rDowCtx, {
				type: "bar",
				data: {
					labels: DAYS_ID,
					datasets: [{
						label: "Revenue",
						data: DAYS_ID.map((_, i) => dowRevMap[i] || 0),
						backgroundColor: DAYS_ID.map((_, i) =>
							i === 0 ? rDowDangerGrad : rDowGrad,
						),
						hoverBackgroundColor: DAYS_ID.map((_, i) =>
							i === 0 ? C.danger : C.success,
						),
						borderColor: DAYS_ID.map((_, i) =>
							i === 0 ? C.danger : C.success,
						),
						borderWidth: 2,
						borderRadius: 8,
						barPercentage: 0.6,
						borderSkipped: false,
					}],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: { display: false } },
					scales: {
						y: {
							beginAtZero: true,
							border: { display: false },
							ticks: { padding: 8, callback: (v) => formatCurrency(v) },
						},
						x: {
							grid: { display: false },
							border: { display: false },
							ticks: { padding: 8 },
						},
					},
				},
			});
		}

		// -- Revenue Distribution Bar --
		if (canvasRefs.revenueDist && analytics.revenueDistribution?.length > 0) {
			const rDistCtx = canvasRefs.revenueDist.getContext("2d");
			const distGrad = rDistCtx.createLinearGradient(0, 0, 0, 240);
			distGrad.addColorStop(0, C.indigo + "CC");
			distGrad.addColorStop(1, C.indigo + "33");
			
			charts.revenueDist = new Chart(rDistCtx, {
				type: "bar",
				data: {
					labels: analytics.revenueDistribution.map((d) => d.bucket),
					datasets: [{
						label: "Jumlah Visit",
						data: analytics.revenueDistribution.map((d) => d.count),
						backgroundColor: distGrad,
						hoverBackgroundColor: C.indigo,
						borderColor: C.indigo,
						borderWidth: 2,
						borderRadius: 8,
						barPercentage: 0.65,
						borderSkipped: false,
					}],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: { legend: { display: false } },
					scales: {
						y: {
							beginAtZero: true,
							ticks: { stepSize: 1, padding: 8 },
							border: { display: false },
						},
						x: {
							grid: { display: false },
							border: { display: false },
							ticks: { padding: 8, font: { size: 10 } },
						},
					},
				},
			});
		}

		// -- Monthly Revenue Bar --
		if (canvasRefs.monthlyRev && analytics.monthlyRevenue?.length > 0) {
			const mCtx = canvasRefs.monthlyRev.getContext("2d");
			const mGradient = mCtx.createLinearGradient(0, 0, 0, 260);
			mGradient.addColorStop(0, C.emerald + "CC");
			mGradient.addColorStop(1, C.emerald + "33");
			charts.monthlyRev = new Chart(mCtx, {
				type: "bar",
				data: {
					labels: analytics.monthlyRevenue.map((d) => d.month_label),
					datasets: [{
						label: "Revenue",
						data: analytics.monthlyRevenue.map((d) => Number(d.revenue)),
						backgroundColor: mGradient,
						hoverBackgroundColor: C.emerald,
						borderColor: C.emerald,
						borderWidth: 2,
						borderRadius: 8,
						barPercentage: 0.6,
						borderSkipped: false,
					}],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { display: false },
						tooltip: {
							callbacks: {
								label: (ctx) => `Revenue: ${formatCurrency(ctx.raw)}`,
								afterLabel: (ctx) => `Encounters: ${analytics.monthlyRevenue[ctx.dataIndex]?.encounter_count || 0}`,
							},
						},
					},
					scales: {
						y: {
							beginAtZero: true,
							border: { display: false },
							ticks: { padding: 10, callback: (v) => formatCurrency(v) },
						},
						x: {
							grid: { display: false },
							border: { display: false },
							ticks: { padding: 10 },
						},
					},
				},
			});
		}

		// -- Pareto Patient Revenue Chart (bar + line) --
		if (canvasRefs.pareto && analytics.paretoPatientRevenue?.length > 0) {
			const paretoData = analytics.paretoPatientRevenue;
			const totalParetoRev = paretoData.reduce((s, d) => s + Number(d.total_revenue), 0);
			let cumulative = 0;
			const cumulativePct = paretoData.map((d) => {
				cumulative += Number(d.total_revenue);
				return Math.round((cumulative / totalParetoRev) * 100);
			});
			// Find the index where cumulative reaches 80%
			const pareto80Idx = cumulativePct.findIndex((p) => p >= 80);
			const paretoBarColors = paretoData.map((_, i) =>
				i <= pareto80Idx ? C.success + "CC" : C.primary + "55"
			);

			charts.pareto = new Chart(canvasRefs.pareto.getContext("2d"), {
				type: "bar",
				data: {
					labels: paretoData.map((d) => truncLabel(d.patient_name, 12)),
					datasets: [
						{
							type: "bar",
							label: "Revenue",
							data: paretoData.map((d) => Number(d.total_revenue)),
							backgroundColor: paretoBarColors,
							borderColor: paretoData.map((_, i) =>
								i <= pareto80Idx ? C.success : C.primary
							),
							borderWidth: 1.5,
							hoverBackgroundColor: paretoData.map((_, i) =>
								i <= pareto80Idx ? C.success : C.primary
							),
							borderRadius: 8,
							barPercentage: 0.7,
							borderSkipped: false,
							yAxisID: "y",
							order: 2,
						},
						{
							type: "line",
							label: "Kumulatif %",
							data: cumulativePct,
							borderColor: C.danger,
							backgroundColor: C.danger + "22",
							pointRadius: 4,
							pointHoverRadius: 6,
							pointBackgroundColor: "white",
							pointBorderColor: C.danger,
							pointBorderWidth: 2,
							borderWidth: 3,
							tension: 0.4,
							fill: false,
							yAxisID: "y1",
							order: 1,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							position: "bottom",
							labels: { padding: 12, usePointStyle: true, pointStyle: "circle", font: { size: 11 } },
						},
						tooltip: {
							callbacks: {
								label: (ctx) => {
									if (ctx.dataset.yAxisID === "y1") return `Kumulatif: ${ctx.raw}%`;
									return `Revenue: ${formatCurrency(ctx.raw)}`;
								},
							},
						},
						annotation: undefined,
					},
					scales: {
						y: {
							beginAtZero: true,
							position: "left",
							border: { display: false },
							ticks: { padding: 8, callback: (v) => formatCurrency(v) },
						},
						y1: {
							beginAtZero: true,
							position: "right",
							max: 100,
							border: { display: false },
							grid: { display: false },
							ticks: { padding: 8, callback: (v) => v + "%" },
						},
						x: {
							grid: { display: false },
							border: { display: false },
							ticks: { padding: 8, font: { size: 9 }, maxRotation: 45, minRotation: 30 },
						},
					},
				},
			});
		}
		// -- Referral Stats Doughnut --
		if (canvasRefs.referrals && analytics.referralStats?.length > 0) {
			charts.referrals = new Chart(canvasRefs.referrals.getContext("2d"), {
				type: "doughnut",
				data: {
					labels: analytics.referralStats.map((d) => d.doctor_name || d.doctor_code || "Dokter Luar"),
					datasets: [{
						data: analytics.referralStats.map((d) => d.count),
						backgroundColor: palette.slice(0, analytics.referralStats.length).map(c => c + "E6"),
						hoverBackgroundColor: palette.slice(0, analytics.referralStats.length),
						borderWidth: 3,
						borderColor: "white",
						hoverOffset: 12,
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					cutout: "70%",
					plugins: {
						legend: {
							position: "bottom",
							labels: { padding: 15, usePointStyle: true, pointStyle: "circle", font: { size: 10 } }
						},
						tooltip: {
							callbacks: {
								label: (ctx) => `${ctx.label}: ${ctx.raw} rujukan`
							}
						}
					}
				}
			});
		}
	}

	function truncLabel(str, len = 30) {
		if (!str) return "-";
		return str.length > len ? str.substring(0, len) + "..." : str;
	}

	function fmtDate(d) {
		if (!d) return "-";
		return new Date(d).toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			timeZone: "Asia/Jakarta",
		});
	}

	function fmtTime(d) {
		if (!d) return "-";
		return new Date(d).toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Jakarta",
		});
	}

	onMount(loadData);

	onDestroy(() => {
		Object.values(charts).forEach((c) => c?.destroy());
	});
</script>

<svelte:head>
	<title>Analytics — Oratio Clinic</title>
</svelte:head>

<div class="analytics-page">
	<!-- Header Filter Controls -->
	<div class="analytics-header">
		<div class="analytics-controls-wrapper">
			<div class="quick-ranges">
				{#each [["today", "Hari Ini"], ["week", "7 Hari"], ["month", "Bulan Ini"], ["3months", "3 Bulan"], ["6months", "6 Bulan"], ["year", "Tahun Ini"], ["all", "Semua"]] as [key, label]}
					<button
						class="range-btn"
						class:active={quickRange === key}
						on:click={() => setQuickRange(key)}>{label}</button
					>
				{/each}
			</div>

			<div class="date-range-card">
				<div class="date-input-wrap">
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						class="date-icon"
						><rect x="3" y="4" width="18" height="18" rx="2" ry="2"
						></rect><line x1="16" y1="2" x2="16" y2="6"></line><line
							x1="8"
							y1="2"
							x2="8"
							y2="6"
						></line><line x1="3" y1="10" x2="21" y2="10"
						></line></svg
					>
					<input
						type="date"
						class="date-input"
						bind:value={dateFrom}
					/>
				</div>
				<span class="date-sep">—</span>
				<div class="date-input-wrap">
					<input type="date" class="date-input" bind:value={dateTo} />
				</div>
				<button
					class="filter-btn"
					on:click={() => {
						quickRange = "custom";
						loadData();
					}}
					title="Terapkan Filter"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><polygon
							points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
						></polygon></svg
					>
				</button>
			</div>

			<div class="view-toggle">
				{#each [["all", "Semua", "M3 3v18h18M18 17V9M13 17V5M8 17v-3"], ["clinical", "Klinis", "M22 12h-4l-3 9L9 3l-3 9H2"], ["revenue", "Revenue", "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"]] as [key, label, icon]}
					<button
						class="view-btn"
						class:active={viewMode === key}
						on:click={() => (viewMode = key)}
						title="Tampilkan {label}"
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d={icon}></path>
						</svg>
						{label}
					</button>
				{/each}
			</div>
		</div>
	</div>

	{#if loading}
		<div class="loading-state">
			<div class="spinner spinner-lg"></div>
			<p>Memuat data analytics...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<div class="error-icon">⚠️</div>
			<p>{error}</p>
			<button class="btn btn-primary btn-sm" on:click={loadData}
				>Coba Lagi</button
			>
		</div>
	{:else if analytics}
		<!-- KPI Cards Row 1 -->
		<div class="kpi-grid">
			<div class="kpi-card kpi-blue">
				<div class="kpi-icon-wrap">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><rect x="3" y="4" width="18" height="18" rx="2" ry="2"
						></rect><line x1="16" y1="2" x2="16" y2="6"></line><line
							x1="8"
							y1="2"
							x2="8"
							y2="6"
						></line><line x1="3" y1="10" x2="21" y2="10"
						></line><path d="M8 14h.01" /><path
							d="M12 14h.01"
						/><path d="M16 14h.01" /><path d="M8 18h.01" /><path
							d="M12 18h.01"
						/><path d="M16 18h.01" /></svg
					>
				</div>
				<div class="kpi-content">
					<div class="kpi-label">
						{quickRange === "today" ? "Pasien Hari Ini" : peakDay ? "Hari Teramai" : "Pasien Hari Ini"}
					</div>
					<div class="flex items-center gap-2">
						<div class="kpi-value">
							{quickRange === "today"
								? (analytics.periodCounts?.today_count || 0)
								: peakDay
									? peakDay.name
									: (analytics.periodCounts?.today_count || 0)}
						</div>
						{#if quickRange === "today"}
							{#if analytics.changes?.today_count !== undefined}
								{@const chg = analytics.changes.today_count}
								{@const isZero = chg === 0}
								{@const isPos = chg > 0}
								{#if isZero}
									<span class="text-slate-400 text-[10px] font-bold flex items-center">-</span>
								{:else}
									<span class="{isPos ? 'text-green-500' : 'text-red-500'} text-[10px] font-bold flex items-center">
										{isPos ? "+" : "-"}{Math.abs(chg)}% <span class="material-symbols-outlined text-[13px] ml-0.5">{isPos ? "trending_up" : "trending_down"}</span>
									</span>
								{/if}
							{/if}
						{:else if peakDay}
							<span class="text-slate-400 text-[10px] font-bold flex items-center">
								{peakDay.date} ({peakDay.count})
							</span>
						{/if}
					</div>
				</div>
			</div>

			<div class="kpi-card kpi-cyan">
				<div class="kpi-icon-wrap">
					{#if quickRange !== "today" && peakHour}
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><circle cx="12" cy="12" r="10" /><polyline
								points="12 6 12 12 16 14"
							/></svg
						>
					{:else}
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M8 2v4" /><path d="M16 2v4" /><rect
								width="18"
								height="18"
								x="3"
								y="4"
								rx="2"
							/><path d="M3 10h18" /><path d="M8 14h8" /></svg
						>
					{/if}
				</div>
				<div class="kpi-content">
					<div class="kpi-label">
						{quickRange === "today" ? "Pasien Kemarin" : peakHour ? "Jam Teramai" : "7 Hari Terakhir"}
					</div>
					<div class="flex items-center gap-2">
						<div class="kpi-value {quickRange !== 'today' && peakHour ? 'text-[1.2rem]' : ''}">
							{quickRange === "today"
								? (analytics.periodCounts?.yesterday_count || 0)
								: peakHour
									? peakHour.label
									: (analytics.periodCounts?.week_count || 0)}
						</div>
						{#if quickRange === "today"}
							<!-- Yesterday count usually doesn't show trend in our logic -->
						{:else if peakHour}
							<span class="text-slate-400 text-[10px] font-bold flex items-center">
								{peakHour.count} Pasien
							</span>
						{:else if analytics.changes?.week_count !== undefined}
							{@const chg = analytics.changes.week_count}
							{@const isZero = chg === 0}
							{@const isPos = chg > 0}
							{#if isZero}
								<span class="text-slate-400 text-[10px] font-bold flex items-center">-</span>
							{:else}
								<span class="{isPos ? 'text-green-500' : 'text-red-500'} text-[10px] font-bold flex items-center">
									{isPos ? "+" : "-"}{Math.abs(chg)}% <span class="material-symbols-outlined text-[13px] ml-0.5">{isPos ? "trending_up" : "trending_down"}</span>
								</span>
							{/if}
						{/if}
					</div>
				</div>
			</div>

			<div class="kpi-card kpi-purple">
				<div class="kpi-icon-wrap">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="M3 3v18h18" /><path d="M18 17V9" /><path
							d="M13 17V5"
						/><path d="M8 17v-3" /></svg
					>
				</div>
				<div class="kpi-content">
					<div class="kpi-label">Total Kunjungan</div>
					<div class="flex items-center gap-2">
						<div class="kpi-value">
							{analytics.overview?.total_encounters || 0}
						</div>
						{#if analytics.changes?.total_encounters !== undefined && dateFrom && dateTo}
							{@const chg = analytics.changes.total_encounters}
							{@const isZero = chg === 0}
							{@const isPos = chg > 0}
							{#if isZero}
								<span class="text-slate-400 text-[10px] font-bold flex items-center">-</span>
							{:else}
								<span class="{isPos ? 'text-green-500' : 'text-red-500'} text-[10px] font-bold flex items-center">
									{isPos ? '+' : '-'}{Math.abs(chg)}% <span class="material-symbols-outlined text-[13px] ml-0.5">{isPos ? 'trending_up' : 'trending_down'}</span>
								</span>
							{/if}
						{/if}
					</div>
				</div>
			</div>

			<div class="kpi-card kpi-teal">
				<div class="kpi-icon-wrap">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path
							d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
						/><circle cx="9" cy="7" r="4" /><path
							d="M22 21v-2a4 4 0 0 0-3-3.87"
						/><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg
					>
				</div>
				<div class="kpi-content">
					<div class="kpi-label">Pasien Unik</div>
					<div class="flex items-center gap-2">
						<div class="kpi-value">
							{analytics.overview?.unique_patients || 0}
						</div>
						{#if analytics.changes?.unique_patients !== undefined && dateFrom && dateTo}
							{@const chg = analytics.changes.unique_patients}
							{@const isZero = chg === 0}
							{@const isPos = chg > 0}
							{#if isZero}
								<span class="text-slate-400 text-[10px] font-bold flex items-center">-</span>
							{:else}
								<span class="{isPos ? 'text-green-500' : 'text-red-500'} text-[10px] font-bold flex items-center">
									{isPos ? '+' : '-'}{Math.abs(chg)}% <span class="material-symbols-outlined text-[13px] ml-0.5">{isPos ? 'trending_up' : 'trending_down'}</span>
								</span>
							{/if}
						{/if}
					</div>
				</div>
			</div>

			<div class="kpi-card kpi-orange">
				<div class="kpi-icon-wrap">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path
							d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
						/><path d="m9 12 2 2 4-4" /></svg
					>
				</div>
				<div class="kpi-content">
					<div class="kpi-label">Tingkat Penyelesaian</div>
					<div class="flex items-center gap-2">
						<div class="kpi-value">
							{analytics.overview?.completion_rate || 0}%
						</div>
						{#if analytics.changes?.completion_rate !== undefined && dateFrom && dateTo}
							{@const chg = analytics.changes.completion_rate}
							{@const isZero = chg === 0}
							{@const isPos = chg > 0}
							{#if isZero}
								<span class="text-slate-400 text-[10px] font-bold flex items-center">-</span>
							{:else}
								<span class="{isPos ? 'text-green-500' : 'text-red-500'} text-[10px] font-bold flex items-center">
									{isPos ? '+' : '-'}{Math.abs(chg)}% <span class="material-symbols-outlined text-[13px] ml-0.5">{isPos ? 'trending_up' : 'trending_down'}</span>
								</span>
							{/if}
						{/if}
					</div>
				</div>
			</div>

			<div class="kpi-card kpi-amber">
				<div class="kpi-icon-wrap">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><circle cx="12" cy="12" r="10" /><polyline
							points="12 6 12 12 16 14"
						/></svg
					>
				</div>
				<div class="kpi-content">
					<div class="kpi-label">Rata-rata Tunggu</div>
					<div class="flex items-center gap-2">
						<div class="kpi-value">
							{analytics.timingStats?.avg_wait_minutes
								? Math.round(analytics.timingStats.avg_wait_minutes)
								: "-"} <span class="kpi-unit">min</span>
						</div>
						{#if analytics.changes?.avg_wait_minutes !== undefined && dateFrom && dateTo}
							{@const chg = analytics.changes.avg_wait_minutes}
							{@const isZero = chg === 0}
							{@const isPos = chg > 0}
							{#if isZero}
								<span class="text-slate-400 text-[10px] font-bold flex items-center">-</span>
							{:else}
								<span class="{isPos ? 'text-green-500' : 'text-red-500'} text-[10px] font-bold flex items-center">
									{isPos ? '+' : '-'}{Math.abs(chg)}% <span class="material-symbols-outlined text-[13px] ml-0.5">{isPos ? 'trending_up' : 'trending_down'}</span>
								</span>
							{/if}
						{/if}
					</div>
				</div>
			</div>

			<div class="kpi-card kpi-indigo">
				<div class="kpi-icon-wrap">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg
					>
				</div>
				<div class="kpi-content">
					<div class="kpi-label">Rata-rata Konsultasi</div>
					<div class="flex items-center gap-2">
						<div class="kpi-value">
							{analytics.timingStats?.avg_consult_minutes
								? Math.round(
										analytics.timingStats.avg_consult_minutes,
									)
								: "-"} <span class="kpi-unit">min</span>
						</div>
						{#if analytics.changes?.avg_consult_minutes !== undefined && dateFrom && dateTo}
							{@const chg = analytics.changes.avg_consult_minutes}
							{@const isZero = chg === 0}
							{@const isPos = chg > 0}
							{#if isZero}
								<span class="text-slate-400 text-[10px] font-bold flex items-center">-</span>
							{:else}
								<span class="{isPos ? 'text-green-500' : 'text-red-500'} text-[10px] font-bold flex items-center">
									{isPos ? '+' : '-'}{Math.abs(chg)}% <span class="material-symbols-outlined text-[13px] ml-0.5">{isPos ? 'trending_up' : 'trending_down'}</span>
								</span>
							{/if}
						{/if}
					</div>
				</div>
			</div>

			<div class="kpi-card kpi-emerald">
				<div class="kpi-icon-wrap">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><rect width="20" height="14" x="2" y="5" rx="2" /><line
							x1="2"
							x2="22"
							y1="10"
							y2="10"
						/></svg
					>
				</div>
				<div class="kpi-content">
					<div class="kpi-label">Total Pendapatan</div>
					<div class="flex items-center gap-2">
						<div class="kpi-value kpi-value-sm">
							{formatCurrency(
								Number(analytics.revenueStats?.total_revenue || 0),
							)}
						</div>
						{#if analytics.changes?.total_revenue !== undefined && dateFrom && dateTo}
							{@const chg = analytics.changes.total_revenue}
							{@const isZero = chg === 0}
							{@const isPos = chg > 0}
							{#if isZero}
								<span class="text-slate-400 text-[10px] font-bold flex items-center">-</span>
							{:else}
								<span class="{isPos ? 'text-green-500' : 'text-red-500'} text-[10px] font-bold flex items-center">
									{isPos ? '+' : '-'}{Math.abs(chg)}% <span class="material-symbols-outlined text-[13px] ml-0.5">{isPos ? 'trending_up' : 'trending_down'}</span>
								</span>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Charts Row 1 : Volume + Status -->
		{#if viewMode !== "revenue"}
			<div class="chart-grid-2">
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-blue">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><polyline
										points="22 12 18 12 15 21 9 3 6 12 2 12"
									></polyline></svg
								>
							</div>
							<h3 class="chart-title">Volume Pasien Harian</h3>
						</div>
						<span class="chart-badge"
							>{analytics.dailyVolume?.length || 0} hari</span
						>
					</div>
					{#if analytics.dailyVolume?.length > 0}
						<div class="chart-body" style="height: 240px;">
							<canvas bind:this={canvasRefs.volume}></canvas>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data</div>
					{/if}
				</div>

				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-emerald">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
									></path><polyline
										points="22 4 12 14.01 9 11.01"
									></polyline></svg
								>
							</div>
							<h3 class="chart-title">Status Kunjungan</h3>
						</div>
						<span class="chart-badge"
							>{analytics.overview?.completion_rate || 0}% selesai</span
						>
					</div>
					{#if analytics.statusBreakdown}
						<div
							class="chart-body"
							style="height: 240px; position: relative;"
						>
							<canvas bind:this={canvasRefs.status}></canvas>
							<div class="doughnut-center">
								<div class="doughnut-value">
									{analytics.overview?.total_encounters || 0}
								</div>
								<div class="doughnut-label">Total</div>
							</div>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data</div>
					{/if}
				</div>
			</div>

			<!-- Charts Row 2 : Peak Hours + Day of Week -->
			<div class="chart-grid-2">
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-purple">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><circle cx="12" cy="12" r="10"
									></circle><polyline
										points="12 6 12 12 16 14"
									></polyline></svg
								>
							</div>
							<h3 class="chart-title">
								Distribusi Jam Kunjungan
							</h3>
						</div>
						{#if analytics.hourlyDist?.length > 0}
							{@const peak = analytics.hourlyDist.reduce(
								(a, b) => (b.count > a.count ? b : a),
								{ count: 0 },
							)}
							<span class="chart-badge"
								>Puncak: {String(peak.hour).padStart(
									2,
									"0",
								)}:00</span
							>
						{/if}
					</div>
					{#if analytics.hourlyDist?.length > 0}
						<div class="chart-body" style="height: 220px;">
							<canvas bind:this={canvasRefs.hourly}></canvas>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data</div>
					{/if}
				</div>

				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-orange">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><rect
										x="3"
										y="4"
										width="18"
										height="18"
										rx="2"
										ry="2"
									></rect><line x1="16" y1="2" x2="16" y2="6"
									></line><line x1="8" y1="2" x2="8" y2="6"
									></line><line x1="3" y1="10" x2="21" y2="10"
									></line></svg
								>
							</div>
							<h3 class="chart-title">Distribusi Hari</h3>
						</div>
						{#if analytics.dowDist?.length > 0}
							{@const busiest = analytics.dowDist.reduce(
								(a, b) => (b.count > a.count ? b : a),
								{ count: 0 },
							)}
							<span class="chart-badge"
								>Terbanyak: {DAYS_ID[busiest.dow]}</span
							>
						{/if}
					</div>
					{#if analytics.dowDist?.length > 0}
						<div class="chart-body" style="height: 220px;">
							<canvas bind:this={canvasRefs.dow}></canvas>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data</div>
					{/if}
				</div>
			</div>

			<!-- Charts Row 3 : Patient Demographics -->
			<div class="chart-grid-2">
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-pink">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
									></path><circle cx="9" cy="7" r="4"
									></circle><path
										d="M23 21v-2a4 4 0 0 0-3-3.87"
									></path><path d="M16 3.13a4 4 0 0 1 0 7.75"
									></path></svg
								>
							</div>
							<h3 class="chart-title">Jenis Kelamin Pasien</h3>
						</div>
						{#if analytics.genderDist?.length > 0}
							{@const totalGenders = analytics.genderDist.reduce(
								(a, b) => a + Number(b.count),
								0,
							)}
							<span class="chart-badge"
								>{totalGenders} pasien</span
							>
						{/if}
					</div>
					{#if analytics.genderDist?.length > 0}
						{@const totalGendersCenter =
							analytics.genderDist.reduce(
								(a, b) => a + Number(b.count),
								0,
							)}
						<div
							class="chart-body"
							style="height: 220px; position: relative;"
						>
							<canvas bind:this={canvasRefs.gender}></canvas>
							<div class="doughnut-center">
								<div class="doughnut-value">
									{totalGendersCenter}
								</div>
								<div class="doughnut-label">Total</div>
							</div>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data</div>
					{/if}
				</div>

				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-cyan">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><rect
										x="3"
										y="4"
										width="18"
										height="18"
										rx="2"
										ry="2"
									></rect><line x1="16" y1="2" x2="16" y2="6"
									></line><line x1="8" y1="2" x2="8" y2="6"
									></line><line x1="3" y1="10" x2="21" y2="10"
									></line></svg
								>
							</div>
							<h3 class="chart-title">Distribusi Usia Pasien</h3>
						</div>
						{#if analytics.ageDist?.length > 0}
							{@const highestAge = analytics.ageDist.reduce(
								(a, b) => (b.count > a.count ? b : a),
								{ count: 0 },
							)}
							<span class="chart-badge"
								>Terbanyak: {highestAge.age_group} thn</span
							>
						{/if}
					</div>
					{#if analytics.ageDist?.length > 0}
						<div class="chart-body" style="height: 220px;">
							<canvas bind:this={canvasRefs.age}></canvas>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data</div>
					{/if}
				</div>
			</div>

			<!-- Charts Row 4 : Diagnoses + Teeth -->
			<div class="chart-grid-2">
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-indigo">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
									></path><polyline points="14 2 14 8 20 8"
									></polyline><path d="M12 18v-6"></path><path
										d="M9 15h6"
									></path></svg
								>
							</div>
							<h3 class="chart-title">
								Top 10 Diagnosis (ICD-10)
							</h3>
						</div>
						{#if analytics.topDiagnoses?.length > 0}
							<span class="chart-badge"
								>Puncak: {analytics.topDiagnoses[0].count} kasus</span
							>
						{/if}
					</div>
					{#if analytics.topDiagnoses?.length > 0}
						<div
							class="chart-body"
							style="height: {Math.max(
								200,
								analytics.topDiagnoses.length * 32,
							)}px;"
						>
							<canvas bind:this={canvasRefs.diagnoses}></canvas>
						</div>
					{:else}
						<div class="chart-empty">
							Tidak ada data diagnosis ICD-10
						</div>
					{/if}
				</div>

				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-teal">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M12 2C7.5 2 4.5 5 4.5 9c0 3 2 4.5 3.5 6l1.5 5h5l1.5-5c1.5-1.5 3.5-3 3.5-6 0-4-3-7-7.5-7z"
									></path></svg
								>
							</div>
							<h3 class="chart-title">
								Gigi Paling Sering Ditangani
							</h3>
						</div>
						{#if analytics.odontogramStats}
							<span class="chart-badge"
								>{analytics.odontogramStats
									.total_tooth_records || 0} record</span
							>
						{/if}
					</div>
					{#if analytics.topTeeth?.length > 0}
						<div class="chart-body" style="height: 250px;">
							<canvas bind:this={canvasRefs.teeth}></canvas>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data odontogram</div>
					{/if}
				</div>
			</div>

			<!-- Tables Row : Procedures + Conditions + Medications -->
			<div class="chart-grid-3">
				<!-- Top Procedures (ICD-9-CM) -->
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-purple">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M12 20h9"></path><path
										d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
									></path></svg
								>
							</div>
							<h3 class="chart-title">Top Prosedur (ICD-9-CM)</h3>
						</div>
					</div>
					{#if analytics.topProcedures?.length > 0}
						<div class="table-scroll">
							<table class="data-table">
								<thead>
									<tr
										><th>Kode</th><th>Prosedur</th><th
											>Jml</th
										></tr
									>
								</thead>
								<tbody>
									{#each analytics.topProcedures as proc}
										<tr>
											<td
												><span class="code-badge"
													>{proc.code}</span
												></td
											>
											<td class="text-sm"
												>{truncLabel(
													proc.display,
													40,
												)}</td
											>
											<td
												><span class="count-badge"
													>{proc.count}</span
												></td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data prosedur</div>
					{/if}
				</div>

				<!-- Top Tooth Conditions -->
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-blue">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><circle cx="11" cy="11" r="8"
									></circle><line
										x1="21"
										y1="21"
										x2="16.65"
										y2="16.65"
									></line></svg
								>
							</div>
							<h3 class="chart-title">Kondisi Gigi Terbanyak</h3>
						</div>
					</div>
					{#if analytics.topConditions?.length > 0}
						<div class="table-scroll">
							<table class="data-table">
								<thead>
									<tr
										><th>#</th><th>Kondisi</th><th>Jml</th
										></tr
									>
								</thead>
								<tbody>
									{#each analytics.topConditions as cond, i}
										<tr>
											<td class="text-muted">{i + 1}</td>
											<td class="text-sm"
												>{cond.condition}</td
											>
											<td
												><span class="count-badge"
													>{cond.count}</span
												></td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data kondisi</div>
					{/if}
				</div>

				<!-- Top Prescribed Medications -->
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-amber">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M10.5 20.5 4.5 14.5a3 3 0 0 1 0-4.24l7.07-7.07a3 3 0 0 1 4.24 0l6 6a3 3 0 0 1 0 4.24l-7.07 7.07a3 3 0 0 1-4.24 0z"
									></path><line x1="12" y1="2" x2="12" y2="22"
									></line></svg
								>
							</div>
							<h3 class="chart-title">Obat Terbanyak (KFA)</h3>
						</div>
						{#if analytics.prescriptionStats}
							<span class="chart-badge"
								>{analytics.prescriptionStats
									.total_prescriptions || 0} resep</span
							>
						{/if}
					</div>
					{#if analytics.topMedications?.length > 0}
						<div class="table-scroll">
							<table class="data-table">
								<thead>
									<tr
										><th>Obat</th><th>Frek</th><th>Qty</th
										></tr
									>
								</thead>
								<tbody>
									{#each analytics.topMedications as med}
										<tr>
											<td class="text-sm"
												>{truncLabel(
													med.medication,
													35,
												)}</td
											>
											<td
												><span class="count-badge"
													>{med.count}</span
												></td
											>
											<td class="text-muted"
												>{med.total_qty}</td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data resep</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Revenue Trend Line Chart -->
		{#if viewMode !== "clinical"}
			<div class="chart-grid-2">
				<div class="chart-card" style="grid-column: 1 / -1;">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-emerald">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><polyline
										points="22 12 18 12 15 21 9 3 6 12 2 12"
									></polyline></svg
								>
							</div>
							<h3 class="chart-title">Tren Revenue Harian</h3>
						</div>
						{#if analytics.dailyRevenue?.length > 0}
							{@const totalRev = analytics.dailyRevenue.reduce(
								(a, b) => a + Number(b.revenue),
								0,
							)}
							<span class="chart-badge"
								>{formatCurrency(totalRev)} total</span
							>
						{/if}
					</div>
					{#if analytics.dailyRevenue?.length > 0}
						<div class="chart-body" style="height: 260px;">
							<canvas bind:this={canvasRefs.revenueTrend}
							></canvas>
						</div>
					{:else}
						<div class="chart-empty">
							Tidak ada data revenue harian
						</div>
					{/if}
				</div>
			</div>

			<!-- Revenue Section -->
			<div class="chart-grid-2">
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-emerald">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><line x1="12" y1="1" x2="12" y2="23"
									></line><path
										d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
									></path></svg
								>
							</div>
							<h3 class="chart-title">Top Tindakan (Revenue)</h3>
						</div>
						<span class="chart-badge"
							>{formatCurrency(
								Number(
									analytics.revenueStats
										?.avg_revenue_per_encounter || 0,
								),
							)}/visit</span
						>
					</div>
					{#if analytics.topItems?.length > 0}
						<div
							class="chart-body"
							style="height: {Math.max(
								200,
								analytics.topItems.length * 32,
							)}px;"
						>
							<canvas bind:this={canvasRefs.items}></canvas>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data item</div>
					{/if}
				</div>

				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-cyan">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M21.21 15.89A10 10 0 1 1 8 2.83"
									></path><path
										d="M22 12A10 10 0 0 0 12 2v10z"
									></path></svg
								>
							</div>
							<h3 class="chart-title">Revenue per Kategori</h3>
						</div>
						{#if analytics.revenueByGroup?.length > 0}
							{@const topCategory =
								analytics.revenueByGroup.reduce(
									(a, b) =>
										Number(b.total_revenue) >
										Number(a.total_revenue)
											? b
											: a,
									{ total_revenue: 0, item_group: "" },
								)}
							<span class="chart-badge"
								>Terbesar: {topCategory.item_group}</span
							>
						{/if}
					</div>
					{#if analytics.revenueByGroup?.length > 0}
						<div
							class="chart-body"
							style="height: 250px; position: relative;"
						>
							<canvas bind:this={canvasRefs.revenueGroup}
							></canvas>
							<div class="doughnut-center">
								<div class="doughnut-value doughnut-value-sm">
									{formatCurrency(
										Number(
											analytics.revenueStats
												?.total_revenue || 0,
										),
									)}
								</div>
								<div class="doughnut-label">Total</div>
							</div>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data kategori</div>
					{/if}
				</div>
			</div>

			<!-- Revenue KPI Mini Cards -->
			<div class="kpi-grid kpi-grid-4">
				<div class="kpi-card kpi-emerald">
					<div class="kpi-icon-wrap">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
					</div>
					<div class="kpi-content">
						<div class="kpi-label">Avg Revenue/Visit</div>
						<div class="flex items-center gap-2">
							<div class="kpi-value kpi-value-sm">
								{formatCurrency(
									Number(
										analytics.revenueStats
											?.avg_revenue_per_encounter || 0,
									),
								)}
							</div>
							{#if analytics.changes?.avg_revenue_per_encounter !== undefined && dateFrom && dateTo}
								{@const chg =
									analytics.changes.avg_revenue_per_encounter}
								{@const isZero = chg === 0}
								{@const isPos = chg > 0}
								{#if isZero}
									<span
										class="text-slate-400 text-[10px] font-bold flex items-center"
										>-</span
									>
								{:else}
									<span
										class="{isPos
											? 'text-green-500'
											: 'text-red-500'} text-[10px] font-bold flex items-center"
									>
										{isPos ? "+" : "-"}{Math.abs(chg)}% <span
											class="material-symbols-outlined text-[13px] ml-0.5"
											>{isPos
												? "trending_up"
												: "trending_down"}</span
										>
									</span>
								{/if}
							{/if}
						</div>
					</div>
				</div>
				<div class="kpi-card kpi-blue">
					<div class="kpi-icon-wrap">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
					</div>
					<div class="kpi-content">
						<div class="kpi-label">Visit + Billing</div>
						<div class="flex items-center gap-2">
							<div class="kpi-value">
								{analytics.revenueStats?.encounters_with_items || 0}
							</div>
							{#if analytics.changes?.encounters_with_items !== undefined && dateFrom && dateTo}
								{@const chg =
									analytics.changes.encounters_with_items}
								{@const isZero = chg === 0}
								{@const isPos = chg > 0}
								{#if isZero}
									<span
										class="text-slate-400 text-[10px] font-bold flex items-center"
										>-</span
									>
								{:else}
									<span
										class="{isPos
											? 'text-green-500'
											: 'text-red-500'} text-[10px] font-bold flex items-center"
									>
										{isPos ? "+" : "-"}{Math.abs(chg)}% <span
											class="material-symbols-outlined text-[13px] ml-0.5"
											>{isPos
												? "trending_up"
												: "trending_down"}</span
										>
									</span>
								{/if}
							{/if}
						</div>
					</div>
				</div>
				<div class="kpi-card kpi-orange">
					<div class="kpi-icon-wrap">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
					</div>
					<div class="kpi-content">
						<div class="kpi-label">Total Diskon</div>
						<div class="flex items-center gap-2">
							<div class="kpi-value kpi-value-sm">
								{formatCurrency(
									Number(
										analytics.discountStats
											?.total_discount_amount || 0,
									),
								)}
							</div>
							{#if analytics.changes?.total_discount_amount !== undefined && dateFrom && dateTo}
								{@const chg =
									analytics.changes.total_discount_amount}
								{@const isZero = chg === 0}
								{@const isPos = chg > 0}
								{#if isZero}
									<span
										class="text-slate-400 text-[10px] font-bold flex items-center"
										>-</span
									>
								{:else}
									<span
										class="{isPos
											? 'text-red-500'
											: 'text-green-500'} text-[10px] font-bold flex items-center"
									>
										{isPos ? "+" : "-"}{Math.abs(chg)}% <span
											class="material-symbols-outlined text-[13px] ml-0.5"
											>{isPos
												? "trending_up"
												: "trending_down"}</span
										>
									</span>
								{/if}
							{/if}
						</div>
					</div>
				</div>
				<div class="kpi-card kpi-purple">
					<div class="kpi-icon-wrap">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
					</div>
					<div class="kpi-content">
						<div class="kpi-label">Metode Bayar</div>
						<div class="kpi-value kpi-value-sm">{analytics.paymentMethodBreakdown?.[0]?.payment_type || '-'}</div>
					</div>
				</div>
			</div>

			<!-- Payment Method + Revenue by DOW -->
			<div class="chart-grid-2">
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-purple">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
							</div>
							<h3 class="chart-title">Metode Pembayaran</h3>
						</div>
						{#if analytics.paymentMethodBreakdown?.length > 0}
							<span class="chart-badge">{analytics.paymentMethodBreakdown.length} metode</span>
						{/if}
					</div>
					{#if analytics.paymentMethodBreakdown?.length > 0}
						{@const totalPmt = analytics.paymentMethodBreakdown.reduce((s, d) => s + Number(d.total_amount), 0)}
						<div class="chart-body" style="height: 240px; position: relative;">
							<canvas bind:this={canvasRefs.paymentMethod}></canvas>
							<div class="doughnut-center">
								<div class="doughnut-value doughnut-value-sm">{formatCurrency(totalPmt)}</div>
								<div class="doughnut-label">Total</div>
							</div>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data pembayaran</div>
					{/if}
				</div>

				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-emerald">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
							</div>
							<h3 class="chart-title">Revenue per Hari</h3>
						</div>
						{#if analytics.revenueDow?.length > 0}
							{@const topDowRev = analytics.revenueDow.reduce((a, b) => Number(b.revenue) > Number(a.revenue) ? b : a, { revenue: 0 })}
							<span class="chart-badge">Terbanyak: {DAYS_ID[topDowRev.dow]}</span>
						{/if}
					</div>
					{#if analytics.revenueDow?.length > 0}
						<div class="chart-body" style="height: 240px;">
							<canvas bind:this={canvasRefs.revenueDow}></canvas>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data</div>
					{/if}
				</div>
			</div>

			<!-- Revenue Distribution + Monthly Revenue -->
			<div class="chart-grid-2">
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-indigo">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
							</div>
							<h3 class="chart-title">Distribusi Revenue/Visit</h3>
						</div>
						{#if analytics.revenueDistribution?.length > 0}
							{@const topBucket = analytics.revenueDistribution.reduce((a, b) => b.count > a.count ? b : a, { count: 0 })}
							<span class="chart-badge">Terbanyak: {topBucket.bucket}</span>
						{/if}
					</div>
					{#if analytics.revenueDistribution?.length > 0}
						<div class="chart-body" style="height: 240px;">
							<canvas bind:this={canvasRefs.revenueDist}></canvas>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data distribusi</div>
					{/if}
				</div>

				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-amber">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
							</div>
							<h3 class="chart-title">Revenue Bulanan</h3>
						</div>
						{#if analytics.monthlyRevenue?.length > 0}
							<span class="chart-badge">{analytics.monthlyRevenue.length} bulan</span>
						{/if}
					</div>
					{#if analytics.monthlyRevenue?.length > 0}
						<div class="chart-body" style="height: 240px;">
							<canvas bind:this={canvasRefs.monthlyRev}></canvas>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data bulanan</div>
					{/if}
				</div>
			</div>

			<!-- Pareto Patient Revenue (full width) -->
			<div class="chart-grid-2">
				<div class="chart-card" style="grid-column: 1 / -1;">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-orange">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
							</div>
							<h3 class="chart-title">Analisis Pareto Pasien (80/20)</h3>
						</div>
						{#if analytics.paretoPatientRevenue?.length > 0}
							{@const totalParetoRev = analytics.paretoPatientRevenue.reduce((s, d) => s + Number(d.total_revenue), 0)}
							{@const totalPatients = analytics.paretoPatientRevenue.length}
							{@const top20Count = Math.max(1, Math.ceil(totalPatients * 0.2))}
							{@const top20Rev = analytics.paretoPatientRevenue.slice(0, top20Count).reduce((s, d) => s + Number(d.total_revenue), 0)}
							{@const top20Pct = totalParetoRev > 0 ? Math.round((top20Rev / totalParetoRev) * 100) : 0}
							<span class="chart-badge">Top {top20Count} pasien ({Math.round(top20Count/totalPatients*100)}%) = {top20Pct}% revenue</span>
						{/if}
					</div>
					{#if analytics.paretoPatientRevenue?.length > 0}
						<div class="chart-body" style="height: 300px;">
							<canvas bind:this={canvasRefs.pareto}></canvas>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data pasien</div>
					{/if}
				</div>
			</div>

			<!-- Discount Summary Table -->
			{#if analytics.discountStats?.total_payments > 0}
			<div class="chart-grid-2">
				<div class="chart-card" style="grid-column: 1 / -1;">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-orange">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
							</div>
							<h3 class="chart-title">Ringkasan Diskon & Penjualan</h3>
						</div>
					</div>
					<div class="summary-stats">
						<div class="summary-row">
							<span>Total Penjualan (Gross)</span>
							<strong>{formatCurrency(Number(analytics.discountStats?.gross_sales || 0))}</strong>
						</div>
						<div class="summary-row">
							<span>Total Diskon</span>
							<strong style="color: var(--danger);">-{formatCurrency(Number(analytics.discountStats?.total_discount_amount || 0))}</strong>
						</div>
						<div class="summary-row">
							<span>Penjualan Bersih (Net)</span>
							<strong style="color: var(--success);">{formatCurrency(Number(analytics.discountStats?.net_sales || 0))}</strong>
						</div>
						<div class="summary-row">
							<span>Transaksi dengan Diskon</span>
							<strong>{analytics.discountStats?.discounted_count || 0} / {analytics.discountStats?.total_payments || 0}</strong>
						</div>
						{#if analytics.discountStats?.avg_discount_percent}
						<div class="summary-row">
							<span>Rata-rata Diskon</span>
							<strong>{analytics.discountStats.avg_discount_percent}%</strong>
						</div>
						{/if}
					</div>
				</div>
			</div>
			{/if}
		{/if}

		<!-- Bottom Section: Reasons + Referrals + Form Mode + Recent -->
		{#if viewMode !== "revenue"}
			<div class="chart-grid-2">
				<!-- Visit Reasons -->
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-purple">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
									></path><polyline points="14 2 14 8 20 8"
									></polyline><line
										x1="16"
										y1="13"
										x2="8"
										y2="13"
									></line><line x1="16" y1="17" x2="8" y2="17"
									></line><polyline points="10 9 9 9 8 9"
									></polyline></svg
								>
							</div>
							<h3 class="chart-title">
								Alasan Kunjungan (SNOMED)
							</h3>
						</div>
						{#if analytics.topReasons?.length > 0}
							<span class="chart-badge"
								>Puncak: {analytics.topReasons[0].count} kasus</span
							>
						{/if}
					</div>

					{#if analytics.reasonTypeDist?.length > 0}
						<div class="reason-type-summary">
							{#each analytics.reasonTypeDist as dist}
								<div
									class="type-stat {dist.type.toLowerCase()}"
								>
									<span class="type-dot"></span>
									<span class="type-text"
										>{dist.type}:
										<strong>{dist.count}</strong></span
									>
								</div>
							{/each}
						</div>
					{/if}

					{#if analytics.topReasons?.length > 0}
						<div class="table-scroll">
							<table class="data-table">
								<thead>
									<tr
										><th>#</th><th>Tipe</th><th>Alasan</th
										><th>Jml</th></tr
									>
								</thead>
								<tbody>
									{#each analytics.topReasons as reason, i}
										<tr>
											<td class="text-muted">{i + 1}</td>
											<td>
												<span
													class="type-badge {reason.type?.toLowerCase() ||
														'finding'}"
												>
													{reason.type || "Finding"}
												</span>
											</td>
											<td class="text-sm"
												>{truncLabel(
													reason.reason,
													45,
												)}</td
											>
											<td
												><span class="count-badge"
													>{reason.count}</span
												></td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="chart-empty">
							Tidak ada data alasan kunjungan
						</div>
					{/if}
				</div>

				<!-- Referrals -->
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-indigo">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M17 2.1l4 4-4 4"></path><path
										d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"
									></path><path
										d="M21 11.8v2a4 4 0 0 1-4 4H4.2"
									></path></svg
								>
							</div>
							<h3 class="chart-title">Rujukan per Dokter</h3>
						</div>
						<span class="chart-badge"
							>{analytics.referralOverview?.total_referrals || 0} rujukan</span
						>
					</div>
					{#if analytics.referralStats?.length > 0}
						<div class="chart-body" style="height: 240px; position: relative;">
							<canvas bind:this={canvasRefs.referrals}></canvas>
							<div class="doughnut-center">
								<div class="doughnut-value doughnut-value-sm">{analytics.referralOverview?.total_referrals || 0}</div>
								<div class="doughnut-label">Rujukan</div>
							</div>
						</div>
						<div class="table-scroll mt-4">
							<table class="data-table">
								<thead>
									<tr>
										<th>Dokter</th>
										<th class="text-right">Jumlah</th>
									</tr>
								</thead>
								<tbody>
									{#each analytics.referralStats as ref}
										<tr class="hover:bg-slate-50/50 transition-colors">
											<td>
												<div class="flex flex-col py-1">
													<span class="font-bold text-slate-700">{ref.doctor_name || 'Dokter Luar'}</span>
													<span class="text-[10px] text-slate-400 font-mono">{ref.doctor_code}</span>
												</div>
											</td>
											<td class="text-right">
												<span class="count-badge count-badge-indigo"
													>{ref.count}</span
												>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data rujukan</div>
					{/if}
				</div>
			</div>

			<!-- Form Mode + Prescription/Odontogram Stats + Recent Activity -->
			<div class="chart-grid-3">
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-pink">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path
										d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
									></path><path
										d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
									></path></svg
								>
							</div>
							<h3 class="chart-title">Mode Form</h3>
						</div>
						<span class="chart-badge"
							>Total: {analytics.overview?.total_encounters ||
								0}</span
						>
					</div>
					{#if analytics.formModeDist?.length > 0}
						<div class="form-mode-list">
							{#each analytics.formModeDist as fm}
								<div class="form-mode-item">
									<div class="form-mode-label">
										{fm.form_mode}
									</div>
									<div class="form-mode-bar-wrap">
										<div
											class="form-mode-bar"
											style="width: {(fm.count /
												(analytics.overview
													?.total_encounters || 1)) *
												100}%;
										       background: {fm.form_mode === 'SOAP' ? C.primary : C.purple};"
										></div>
									</div>
									<div class="form-mode-count">
										{fm.count}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="chart-empty">Tidak ada data</div>
					{/if}
				</div>

				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-blue">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M3 3v18h18"></path><path
										d="M18 17v-9"
									></path><path d="M13 17v-5"></path><path
										d="M8 17v-3"
									></path></svg
								>
							</div>
							<h3 class="chart-title">Ringkasan Statistik</h3>
						</div>
					</div>
					<div class="summary-stats">
						<div class="summary-row">
							<span>Rata-rata Resep/Visit</span>
							<strong
								>{analytics.prescriptionStats
									?.avg_rx_per_encounter || 0}</strong
							>
						</div>
						<div class="summary-row">
							<span>Total Resep</span>
							<strong
								>{analytics.prescriptionStats
									?.total_prescriptions || 0}</strong
							>
						</div>
						<div class="summary-row">
							<span>Encounters + Odontogram</span>
							<strong
								>{analytics.odontogramStats
									?.encounters_with_odontogram || 0}</strong
							>
						</div>
						<div class="summary-row">
							<span>Gigi Ditangani (Unik)</span>
							<strong
								>{analytics.odontogramStats
									?.distinct_teeth_treated || 0}</strong
							>
						</div>
						<div class="summary-row">
							<span>Encounters + Billing</span>
							<strong
								>{analytics.revenueStats
									?.encounters_with_items || 0}</strong
							>
						</div>
						<div class="summary-row">
							<span>Rata-rata Revenue/Visit</span>
							<strong
								>{formatCurrency(
									Number(
										analytics.revenueStats
											?.avg_revenue_per_encounter || 0,
									),
								)}</strong
							>
						</div>
					</div>
				</div>

				<!-- Recent Activity -->
				<div class="chart-card">
					<div class="chart-header">
						<div class="chart-title-wrap">
							<div class="chart-icon-box bg-orange">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><circle cx="12" cy="12" r="10"
									></circle><polyline
										points="12 6 12 12 16 14"
									></polyline></svg
								>
							</div>
							<h3 class="chart-title">Aktivitas Terbaru</h3>
						</div>
					</div>
					{#if analytics.recentEncounters?.length > 0}
						<div class="recent-list">
							{#each analytics.recentEncounters as item}
								<div class="recent-item">
									<div
										class="recent-dot"
										style="background: {item.status ===
											'Completed' ||
										item.status === 'Discharged'
											? C.success
											: item.status === 'In Progress'
												? C.primary
												: item.status === 'Cancelled'
													? C.danger
													: C.accent};"
									></div>
									<div class="recent-info">
										<div class="recent-name">
											{item.patient_name || "-"}
										</div>
										<div class="recent-meta">
											{fmtDate(item.created_at)} · {fmtTime(
												item.created_at,
											)}
										</div>
									</div>
									<span
										class="badge {STATUS_COLORS[
											item.status
										] || 'badge-gray'} badge-sm"
										>{item.status}</span
									>
								</div>
							{/each}
						</div>
					{:else}
						<div class="chart-empty">Tidak ada aktivitas</div>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.analytics-page {
		max-width: 1400px;
		margin: 0 auto;
	}

	/* Header */
	.analytics-header {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		margin-bottom: 2rem;
		background: white;
		padding: 1.25rem 1.75rem;
		border-radius: 16px;
		border: 1px solid var(--border-color);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.analytics-controls-wrapper {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		flex-wrap: wrap;
	}

	.quick-ranges {
		display: flex;
		background: var(--gray-50);
		border-radius: 10px;
		padding: 4px;
		border: 1px solid var(--gray-200);
	}

	.view-toggle {
		display: flex;
		background: var(--gray-50);
		border-radius: 10px;
		padding: 4px;
		border: 1px solid var(--gray-200);
		gap: 2px;
	}

	.view-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		font-size: 0.8rem;
		font-weight: 600;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		background: transparent;
		color: var(--text-secondary);
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		font-family: inherit;
		white-space: nowrap;
	}

	.view-btn:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.5);
	}

	.view-btn.active {
		background: white;
		color: var(--primary);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.view-btn svg {
		flex-shrink: 0;
		opacity: 0.7;
	}

	.view-btn.active svg {
		opacity: 1;
	}

	.range-btn {
		padding: 6px 14px;
		font-size: 0.8rem;
		font-weight: 600;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		background: transparent;
		color: var(--text-secondary);
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		font-family: inherit;
		position: relative;
	}

	.range-btn:hover {
		color: var(--text-primary);
	}

	.range-btn.active {
		background: white;
		color: var(--primary);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.date-range-card {
		display: flex;
		align-items: center;
		background: white;
		border-radius: 10px;
		border: 1px solid var(--gray-200);
		padding: 4px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
	}

	.date-input-wrap {
		position: relative;
		display: flex;
		align-items: center;
		padding: 0 10px;
		gap: 6px;
	}

	.date-icon {
		color: var(--text-secondary);
		opacity: 0.7;
	}

	.date-input {
		width: 110px !important;
		font-size: 0.8rem !important;
		padding: 6px 0 !important;
		border: none !important;
		background: transparent !important;
		color: var(--text-primary) !important;
		font-weight: 500 !important;
		cursor: pointer;
	}

	.date-input:focus {
		outline: none !important;
		box-shadow: none !important;
	}

	.date-input::-webkit-calendar-picker-indicator {
		opacity: 0;
		position: absolute;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}

	.date-sep {
		color: var(--gray-300);
		font-size: 0.9rem;
		margin: 0 4px;
	}

	.filter-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--primary-light);
		color: var(--primary);
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		margin-left: 4px;
	}

	.filter-btn:hover {
		background: var(--primary);
		color: white;
	}

	/* Loading & Error */
	.loading-state,
	.error-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--text-secondary);
	}
	.error-icon {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	/* KPI Grid */
	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.25rem;
		margin-bottom: 2rem;
	}

	.kpi-card {
		background: white;
		border-radius: 16px;
		padding: 1.25rem 1.5rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 1rem;
		border: 1px solid var(--border-color);
		position: relative;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
	}

	.kpi-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
		border-color: var(--border-color);
	}

	.kpi-card::after {
		content: "";
		position: absolute;
		right: -10px;
		top: -10px;
		width: 80px;
		height: 80px;
		border-radius: 50%;
		opacity: 0.1;
		transition: transform 0.3s ease;
		z-index: 0;
	}

	.kpi-card:hover::after {
		transform: scale(1.5);
	}

	.kpi-icon-wrap {
		width: 42px;
		height: 42px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		position: relative;
		z-index: 1;
	}

	.kpi-content {
		min-width: 0;
		position: relative;
		z-index: 1;
	}

	.kpi-label {
		font-size: 0.8rem;
		color: var(--text-secondary);
		font-weight: 600;
		margin-bottom: 0.35rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.kpi-value {
		font-size: 2rem;
		font-weight: 800;
		color: var(--text-primary);
		line-height: 1.1;
		letter-spacing: -0.03em;
	}

	.kpi-value-sm {
		font-size: 1.5rem;
	}

	.kpi-unit {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--text-secondary);
		margin-left: 2px;
	}

	/* Card Roles */
	.kpi-blue .kpi-icon-wrap {
		background: #eef2ff;
		color: #4f46e5;
	}
	.kpi-blue::after {
		background: #4f46e5;
	}

	.kpi-cyan .kpi-icon-wrap {
		background: #ecfeff;
		color: #0891b2;
	}
	.kpi-cyan::after {
		background: #0891b2;
	}

	.kpi-purple .kpi-icon-wrap {
		background: #f3e8ff;
		color: #9333ea;
	}
	.kpi-purple::after {
		background: #9333ea;
	}

	.kpi-teal .kpi-icon-wrap {
		background: #f0fdfa;
		color: #0d9488;
	}
	.kpi-teal::after {
		background: #0d9488;
	}

	.kpi-orange .kpi-icon-wrap {
		background: #fff7ed;
		color: #ea580c;
	}
	.kpi-orange::after {
		background: #ea580c;
	}

	.kpi-amber .kpi-icon-wrap {
		background: #fffbeb;
		color: #d97706;
	}
	.kpi-amber::after {
		background: #d97706;
	}

	.kpi-indigo .kpi-icon-wrap {
		background: #f5f3ff;
		color: #6366f1;
	}
	.kpi-indigo::after {
		background: #6366f1;
	}

	.kpi-emerald .kpi-icon-wrap {
		background: #ecfdf5;
		color: #059669;
	}
	.kpi-emerald::after {
		background: #059669;
	}

	/* Chart Grid Layouts */

	/* Chart Grid Layouts */
	.chart-grid-2 {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.25rem;
		margin-bottom: 1.25rem;
	}
	.chart-grid-3 {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.25rem;
		margin-bottom: 1.25rem;
	}

	/* Chart Card */
	.chart-card {
		background: white;
		border-radius: 16px;
		border: 1px solid var(--border-color);
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.015);
		display: flex;
		flex-direction: column;
	}
	.chart-card:hover {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
		border-color: var(--gray-200);
		transform: translateY(-2px);
	}
	.chart-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 1.25rem 0.5rem;
	}
	.chart-title-wrap {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.chart-icon-box {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.chart-icon-box.bg-blue {
		background: #eff6ff;
		color: #3b82f6;
	}
	.chart-icon-box.bg-emerald {
		background: #ecfdf5;
		color: #10b981;
	}
	.chart-icon-box.bg-purple {
		background: #f3e8ff;
		color: #a855f7;
	}
	.chart-icon-box.bg-orange {
		background: #ffedd5;
		color: #f97316;
	}
	.chart-icon-box.bg-cyan {
		background: #cffafe;
		color: #06b6d4;
	}
	.chart-icon-box.bg-indigo {
		background: #e0e7ff;
		color: #6366f1;
	}
	.chart-icon-box.bg-pink {
		background: #fce7f3;
		color: #ec4899;
	}
	.chart-icon-box.bg-teal {
		background: #f0fdfa;
		color: #0d9488;
	}
	.chart-icon-box.bg-amber {
		background: #fef3c7;
		color: #d97706;
	}
	.chart-title {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
		letter-spacing: -0.01em;
	}
	.chart-badge {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--primary);
		background: var(--primary-light);
		padding: 4px 10px;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
	}
	.chart-body {
		padding: 0.5rem 1.25rem 1.25rem;
		flex: 1;
	}
	.chart-empty {
		padding: 2.5rem 1rem;
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.8rem;
	}

	/* Doughnut Center */
	.doughnut-center {
		position: absolute;
		top: 42%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		pointer-events: none;
	}
	.doughnut-value {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--text-primary);
	}
	.doughnut-value-sm {
		font-size: 0.9rem;
	}
	.doughnut-label {
		font-size: 0.7rem;
		color: var(--text-secondary);
		font-weight: 500;
	}

	/* Data Tables */
	.table-scroll {
		padding: 0 0.5rem 0.5rem;
		max-height: 320px;
		overflow-y: auto;
	}
	.table-scroll::-webkit-scrollbar {
		width: 5px;
	}
	.table-scroll::-webkit-scrollbar-thumb {
		background: var(--border-color);
		border-radius: 6px;
	}
	.table-scroll::-webkit-scrollbar-track {
		background: transparent;
	}
	.data-table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		font-size: 0.825rem;
	}
	.data-table th {
		text-align: left;
		padding: 0.75rem 0.85rem;
		font-weight: 700;
		color: var(--text-secondary);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 2px solid var(--gray-100);
		position: sticky;
		top: 0;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(4px);
		z-index: 10;
	}
	.data-table td {
		padding: 0.65rem 0.85rem;
		border-bottom: 1px solid var(--gray-100);
		color: var(--text-primary);
		font-weight: 500;
	}
	.data-table tr:last-child td {
		border-bottom: none;
	}
	.data-table tr:hover td {
		background: var(--gray-50);
	}
	.code-badge {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--primary);
		background: var(--primary-light);
		padding: 3px 8px;
		border-radius: 6px;
		font-family: "JetBrains Mono", "Fira Code", monospace;
	}
	.count-badge {
		display: inline-block;
		min-width: 32px;
		text-align: center;
		font-size: 0.75rem;
		font-weight: 700;
		color: white;
		background: var(--primary);
		padding: 3px 8px;
		border-radius: 12px;
		box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
	}
	.text-sm {
		font-size: 0.825rem;
		font-weight: 600;
	}
	.text-muted {
		color: var(--text-secondary);
		font-size: 0.75rem;
		font-weight: 500;
	}

	/* SNOMED Type Badges */
	.type-badge {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 2px 6px;
		border-radius: 4px;
		display: inline-block;
	}
	.type-badge.finding {
		background: #e0f2fe;
		color: #0369a1;
	}
	.type-badge.procedure {
		background: #ecfdf5;
		color: #047857;
	}
	.type-badge.situation {
		background: #fffbeb;
		color: #b45309;
	}
	.type-badge.event {
		background: #f5f3ff;
		color: #6d28d9;
	}

	/* Reason Type Summary */
	.reason-type-summary {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding: 0.75rem 1.25rem 0.25rem;
		border-bottom: 1px solid var(--gray-100);
	}
	.type-stat {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.7rem;
		color: var(--text-secondary);
		padding: 2px 8px;
		background: var(--gray-50);
		border-radius: 20px;
	}
	.type-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
	}
	.type-text strong {
		color: var(--text-primary);
	}

	.type-stat.finding .type-dot {
		background: #0369a1;
	}
	.type-stat.procedure .type-dot {
		background: #047857;
	}
	.type-stat.situation .type-dot {
		background: #b45309;
	}
	.type-stat.event .type-dot {
		background: #6d28d9;
	}

	/* Form Mode */
	.form-mode-list {
		padding: 0.75rem 1.25rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.form-mode-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.form-mode-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-primary);
		min-width: 80px;
	}
	.form-mode-bar-wrap {
		flex: 1;
		height: 8px;
		background: var(--gray-100);
		border-radius: 4px;
		overflow: hidden;
	}
	.form-mode-bar {
		height: 100%;
		border-radius: 4px;
		transition: width 0.6s ease;
	}
	.form-mode-count {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--text-primary);
		min-width: 30px;
		text-align: right;
	}

	/* Summary Stats */
	.summary-stats {
		padding: 0.5rem 1.25rem 1rem;
	}
	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 0;
		border-bottom: 1px dashed var(--gray-200);
		font-size: 0.8rem;
	}
	.summary-row:last-child {
		border-bottom: none;
	}
	.summary-row span {
		color: var(--text-secondary);
		font-weight: 500;
	}
	.summary-row strong {
		color: var(--text-primary);
		font-weight: 700;
		font-size: 0.9rem;
	}

	/* Recent Activity */
	.recent-list {
		padding: 0 0.75rem 0.75rem;
		max-height: 320px;
		overflow-y: auto;
	}
	.recent-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.375rem;
		border-bottom: 1px solid var(--gray-100);
	}
	.recent-item:last-child {
		border-bottom: none;
	}
	.recent-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.recent-info {
		flex: 1;
		min-width: 0;
	}
	.recent-name {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.recent-meta {
		font-size: 0.7rem;
		color: var(--text-secondary);
	}
	.badge-sm {
		font-size: 0.65rem !important;
		padding: 2px 6px !important;
	}

	/* Responsive */
	@media (max-width: 1200px) {
		.kpi-grid {
			grid-template-columns: repeat(4, 1fr);
		}
		.chart-grid-3 {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 900px) {
		.kpi-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.chart-grid-2,
		.chart-grid-3 {
			grid-template-columns: 1fr;
		}
		.analytics-header {
			flex-direction: column;
		}
		.analytics-controls {
			align-items: flex-start;
			width: 100%;
		}
	}
	@media (max-width: 600px) {
		.kpi-grid {
			grid-template-columns: 1fr 1fr;
		}
		.quick-ranges {
			flex-wrap: wrap;
		}
		.date-range {
			flex-wrap: wrap;
		}
		.mini-stats-row {
			gap: 0.375rem;
		}
	}
</style>
