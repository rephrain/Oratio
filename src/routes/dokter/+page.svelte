<script>
	import { onMount, onDestroy } from "svelte";
	import { goto } from "$app/navigation";
	import DataTable from "$lib/components/Tables/DataTable.svelte";
	import { STATUS_COLORS, DAYS_OF_WEEK } from "$lib/utils/constants.js";
	import {
		formatElapsedTime,
		formatTime,
		getShiftCountdown,
	} from "$lib/utils/formatters.js";

	export let data;
	$: user = data?.user;

	let encounters = [];
	let loading = true;
	let shiftInfo = { active: false, status: "no-shifts" };
	let doctorShifts = [];
	let refreshInterval;
	let shiftInterval;
	let filterDate = new Date().toISOString().split("T")[0];

	$: todayQueue = encounters.filter((e) =>
		["Planned", "Arrived"].includes(e.encounter?.status),
	);
	$: inProgress = encounters.filter(
		(e) => e.encounter?.status === "In Progress",
	);
	$: completedToday = encounters.filter((e) =>
		["Discharged", "Completed"].includes(e.encounter?.status),
	);

	async function loadEncounters() {
		try {
			const res = await fetch(`/api/encounters?date=${filterDate}`);
			const resp = await res.json();
			encounters = resp.data || [];
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	async function loadShifts() {
		if (!user?.id) return;
		try {
			const res = await fetch(`/api/admin/doctor-shifts?limit=100`);
			const resp = await res.json();
			doctorShifts = (resp.data || []).filter(
				(s) => s.doctor_id === user.id,
			);
			updateShift();
		} catch {}
	}

	function updateShift() {
		shiftInfo = getShiftCountdown(doctorShifts);
	}

	function openEncounter(row) {
		const enc = row.encounter || row;
		if (enc?.id) goto(`/dokter/${enc.id}`);
	}

	const tableColumns = [
		{
			key: "queue",
			label: "#",
			format: (_, r) => r.encounter?.queue_number || "-",
			sortable: true,
		},
		{
			key: "patient",
			label: "Pasien",
			format: (_, r) => r.patient_name || "-",
		},
		{
			key: "status",
			label: "Status",
			format: (_, r) => r.encounter?.status || "-",
		},
		{
			key: "time",
			label: "Waktu",
			format: (_, r) => formatTime(r.encounter?.created_at),
		},
		{
			key: "dur",
			label: "Durasi",
			format: (_, r) => formatElapsedTime(r.encounter?.created_at),
		},
	];

	onMount(() => {
		loadEncounters();
		loadShifts();
		refreshInterval = setInterval(loadEncounters, 30000);
		shiftInterval = setInterval(updateShift, 60000);
	});

	onDestroy(() => {
		if (refreshInterval) clearInterval(refreshInterval);
		if (shiftInterval) clearInterval(shiftInterval);
	});
</script>

<svelte:head>
	<title>Dashboard Dokter — Oratio Clinic</title>
</svelte:head>

<div>
	<!-- Shift Timer Bar -->
	{#if shiftInfo.active}
		<div class="shift-bar {shiftInfo.status}">
			<span>🕐 Shift berakhir pukul {shiftInfo.endTime}</span>
			<span class="font-bold">{shiftInfo.remaining} tersisa</span>
		</div>
	{:else if shiftInfo.status === "inactive"}
		<div class="shift-bar" style="background: var(--gray-600);">
			<span>💤 Tidak ada shift aktif</span>
			<span>Shift berikutnya: {shiftInfo.nextShift || "-"}</span>
		</div>
	{/if}

	<div style="margin-top: var(--space-4);">
		<div class="flex items-center justify-between mb-6">
			<h1 class="page-title" style="margin: 0;">Dashboard</h1>
			<input
				type="date"
				aria-label="Filter Tanggal"
				class="form-input"
				style="width: auto;"
				bind:value={filterDate}
				on:change={loadEncounters}
			/>
		</div>

		<!-- Stats -->
		<div class="stats-grid mb-6">
			<div class="stat-card">
				<div class="stat-icon stat-icon-warning">⏳</div>
				<div>
					<div class="stat-value">{todayQueue.length}</div>
					<div class="stat-label">Menunggu</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon stat-icon-primary">🔄</div>
				<div>
					<div class="stat-value">{inProgress.length}</div>
					<div class="stat-label">Dalam Proses</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon stat-icon-success">✅</div>
				<div>
					<div class="stat-value">{completedToday.length}</div>
					<div class="stat-label">Selesai</div>
				</div>
			</div>
			<div class="stat-card">
				<div
					class="stat-icon"
					style="background: var(--info-light); color: var(--info);"
				>
					📊
				</div>
				<div>
					<div class="stat-value">{encounters.length}</div>
					<div class="stat-label">Total Hari Ini</div>
				</div>
			</div>
		</div>

		<!-- Queue / Encounters Table -->
		{#if loading}
			<div style="text-align: center; padding: var(--space-16);">
				<div class="spinner spinner-lg" style="margin: 0 auto;"></div>
			</div>
		{:else}
			<div class="card">
				<div class="card-header">
					<h3 class="card-title">Antrian & Riwayat Hari Ini</h3>
				</div>
				<DataTable
					data={encounters}
					columns={tableColumns}
					total={encounters.length}
					limit={100}
					searchable={false}
					on:rowclick={(e) => openEncounter(e.detail.row)}
				/>
			</div>
		{/if}
	</div>
</div>
