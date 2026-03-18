<script>
	import { onMount, onDestroy } from 'svelte';
	import DataTable from '$lib/components/Tables/DataTable.svelte';
	import { QUEUE_COLUMNS, STATUS_COLORS } from '$lib/utils/constants.js';
	import { formatElapsedTime, getWaitTimeClass, formatTime } from '$lib/utils/formatters.js';

	let encounters = [];
	let loading = true;
	let viewMode = 'board'; // 'board' | 'table'
	let filterDate = new Date().toISOString().split('T')[0];
	let filterDoctor = '';
	let refreshInterval;

	// Summary counts
	$: waitingCount = encounters.filter(e => ['Planned', 'Arrived'].includes(e.encounter?.status)).length;
	$: inProgressCount = encounters.filter(e => e.encounter?.status === 'In Progress').length;
	$: dischargedCount = encounters.filter(e => e.encounter?.status === 'Discharged').length;
	$: completedCount = encounters.filter(e => e.encounter?.status === 'Completed').length;

	$: queueData = QUEUE_COLUMNS.map(col => ({
		...col,
		items: encounters.filter(e => col.statuses.includes(e.encounter?.status))
	}));

	async function loadEncounters() {
		try {
			const params = new URLSearchParams({ date: filterDate });
			if (filterDoctor) params.set('doctor_id', filterDoctor);
			const res = await fetch(`/api/encounters?${params}`);
			const data = await res.json();
			encounters = data.data || [];
		} catch (err) {
			console.error('Failed to load encounters:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadEncounters();
		refreshInterval = setInterval(loadEncounters, 30000);
	});

	onDestroy(() => {
		if (refreshInterval) clearInterval(refreshInterval);
	});

	const tableColumns = [
		{ key: 'queue', label: 'No. Antrian', format: (_, row) => row.encounter?.queue_number || '-' },
		{ key: 'patient', label: 'Nama Pasien', format: (_, row) => row.patient_name || '-' },
		{ key: 'nik', label: 'NIK', format: (_, row) => row.patient_nik || '-' },
		{ key: 'doctor', label: 'Dokter', format: (_, row) => row.doctor_name || '-' },
		{ key: 'status', label: 'Status', format: (_, row) => row.encounter?.status || '-' },
		{ key: 'time', label: 'Waktu Datang', format: (_, row) => formatTime(row.encounter?.created_at) }
	];
</script>

<svelte:head>
	<title>Antrian — Oratio Dental</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="page-title" style="margin: 0;">Manajemen Antrian</h1>
		<div class="flex gap-3">
			<input type="date" class="form-input" style="width: auto;" bind:value={filterDate} on:change={loadEncounters} />
			<div class="flex gap-1" style="background: var(--gray-100); border-radius: var(--radius-md); padding: 2px;">
				<button class="tab" class:active={viewMode === 'board'} on:click={() => viewMode = 'board'}>Board</button>
				<button class="tab" class:active={viewMode === 'table'} on:click={() => viewMode = 'table'}>Tabel</button>
			</div>
		</div>
	</div>

	<!-- Summary Bar -->
	<div class="summary-bar">
		<div class="summary-item">
			<span class="summary-dot" style="background: var(--warning);"></span>
			<strong>{waitingCount}</strong> menunggu
		</div>
		<div class="summary-item">
			<span class="summary-dot" style="background: var(--primary);"></span>
			<strong>{inProgressCount}</strong> dalam proses
		</div>
		<div class="summary-item">
			<span class="summary-dot" style="background: var(--success);"></span>
			<strong>{dischargedCount}</strong> selesai periksa
		</div>
		<div class="summary-item">
			<span class="summary-dot" style="background: var(--gray-400);"></span>
			<strong>{completedCount}</strong> selesai hari ini
		</div>
	</div>

	{#if loading}
		<div style="text-align: center; padding: var(--space-16);">
			<div class="spinner spinner-lg" style="margin: 0 auto;"></div>
			<p class="text-muted mt-4">Memuat antrian...</p>
		</div>
	{:else if viewMode === 'board'}
		<!-- Queue Board -->
		<div class="queue-board">
			{#each queueData as column}
				<div class="queue-column">
					<div class="queue-column-header">
						<span class="queue-column-title">{column.label}</span>
						<span class="queue-column-count">{column.items.length}</span>
					</div>
					{#each column.items as item}
						<div class="queue-card">
							<div class="flex items-center justify-between">
								<span class="queue-number">#{item.encounter.queue_number}</span>
								<span class="badge {STATUS_COLORS[item.encounter.status] || 'badge-gray'}">{item.encounter.status}</span>
							</div>
							<div class="patient-name">{item.patient_name || '-'}</div>
							<div class="doctor-name">Dr. {item.doctor_name || '-'}</div>
							<div class="wait-time {getWaitTimeClass(item.encounter.created_at)}">
								⏱ {formatElapsedTime(item.encounter.created_at)}
							</div>
						</div>
					{:else}
						<div class="empty-state" style="padding: var(--space-8) var(--space-4);">
							<p class="text-sm text-muted">Tidak ada antrian</p>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		<!-- Table View -->
		<DataTable
			data={encounters}
			columns={tableColumns}
			total={encounters.length}
			limit={100}
			searchable={false}
		/>
	{/if}
</div>
