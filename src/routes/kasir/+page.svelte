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

<div class="h-full flex flex-col">
	<!-- Summary Bar -->
	<div class="flex gap-4 mb-8 shrink-0">
		<div class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
			<div class="size-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
				<span class="material-symbols-outlined">hourglass_empty</span>
			</div>
			<div>
				<p class="text-2xl font-bold text-slate-900">{waitingCount}</p>
				<p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Waiting</p>
			</div>
		</div>
		<div class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
			<div class="size-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
				<span class="material-symbols-outlined">vital_signs</span>
			</div>
			<div>
				<p class="text-2xl font-bold text-slate-900">{inProgressCount}</p>
				<p class="text-xs font-medium text-slate-500 uppercase tracking-wide">In Progress</p>
			</div>
		</div>
		<div class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
			<div class="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
				<span class="material-symbols-outlined">task_alt</span>
			</div>
			<div>
				<p class="text-2xl font-bold text-slate-900">{completedCount}</p>
				<p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Completed Today</p>
			</div>
		</div>
		<div class="flex-1 min-w-[200px] bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
			<div class="size-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
				<span class="material-symbols-outlined">event</span>
			</div>
			<div>
				<p class="text-2xl font-bold text-slate-900">{encounters.length}</p>
				<p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Appointments</p>
			</div>
		</div>
	</div>

	<!-- View Switcher & Title -->
	<div class="flex items-center justify-between mb-6 shrink-0">
		<div>
			<h2 class="text-xl font-bold text-slate-900">Queue Management</h2>
			<p class="text-sm text-slate-500">Manage real-time patient status and flow</p>
		</div>
		<div class="flex items-center gap-4">
			<input type="date" class="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none" bind:value={filterDate} on:change={loadEncounters} />
			<div class="bg-white p-1 rounded-lg border border-slate-200 flex">
				<button class="px-4 py-2 {viewMode === 'board' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'} rounded-md text-sm font-medium flex items-center gap-2 transition-all" on:click={() => viewMode = 'board'}>
					<span class="material-symbols-outlined text-sm">view_kanban</span>
					Queue Board
				</button>
				<button class="px-4 py-2 {viewMode === 'table' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'} rounded-md text-sm font-medium flex items-center gap-2 transition-all" on:click={() => viewMode = 'table'}>
					<span class="material-symbols-outlined text-sm">format_list_bulleted</span>
					Appointment List
				</button>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="flex-1 flex flex-col items-center justify-center text-slate-400">
			<span class="material-symbols-outlined text-4xl animate-spin mb-2" style="animation: spin 1s linear infinite;">refresh</span>
			<p>Memuat antrian...</p>
		</div>
	{:else if viewMode === 'board'}
		<!-- Kanban Board -->
		<div class="grid grid-cols-4 gap-6 min-h-[600px] flex-1 overflow-hidden">
			{#each queueData as column}
				{@const colLower = column.label.toLowerCase()}
				{@const dotColor = colLower.includes('waiting') || colLower.includes('menunggu') ? 'bg-amber-400' : colLower.includes('progress') || colLower.includes('proses') ? 'bg-blue-500' : colLower.includes('discharge') || colLower.includes('pulang') ? 'bg-teal-500' : 'bg-slate-300'}
				
				<div class="flex flex-col gap-4 overflow-hidden h-full">
					<div class="flex items-center justify-between px-2 shrink-0">
						<h3 class="font-semibold text-slate-700 flex items-center gap-2">
							<span class="size-2 {dotColor} rounded-full"></span>
							{column.label}
							<span class="ml-1 text-slate-400 font-normal">{column.items.length}</span>
						</h3>
					</div>
					<div class="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 pb-4">
						{#each column.items as item}
							{#if colLower.includes('waiting') || colLower.includes('menunggu')}
								<!-- Waiting Card -->
								<div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-primary/50 transition-colors">
									<div class="flex justify-between items-start mb-3">
										<span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">Queue #{item.encounter.queue_number || '-'}</span>
										<span class="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
											<span class="material-symbols-outlined text-[12px]">schedule</span> {formatElapsedTime(item.encounter.created_at)}
										</span>
									</div>
									<h4 class="font-bold text-slate-900 mb-1">{item.patient_name || '-'}</h4>
									<p class="text-xs text-slate-500 mb-4 flex items-center gap-1">
										<span class="material-symbols-outlined text-[14px]">medical_services</span> Dr. {item.doctor_name || '-'}
									</p>
									<div class="flex justify-end gap-2 border-t border-slate-50 pt-3">
										<button class="text-xs font-semibold text-primary hover:underline">Start Session</button>
									</div>
								</div>

							{:else if colLower.includes('progress') || colLower.includes('proses')}
								<!-- In Progress Card -->
								<div class="bg-white p-4 rounded-lg border-2 border-primary/20 shadow-sm bg-primary/[0.02]">
									<div class="flex justify-between items-start mb-3">
										<span class="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold uppercase">Queue #{item.encounter.queue_number || '-'}</span>
										<span class="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full italic animate-pulse">
											Treatment...
										</span>
									</div>
									<h4 class="font-bold text-slate-900 mb-1">{item.patient_name || '-'}</h4>
									<p class="text-xs text-slate-500 mb-4 flex items-center gap-1">
										<span class="material-symbols-outlined text-[14px]">medical_services</span> Dr. {item.doctor_name || '-'}
									</p>
									<div class="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
										<div class="bg-primary h-full w-[65%]"></div>
									</div>
								</div>

							{:else if colLower.includes('discharge') || colLower.includes('pulang')}
								<!-- Discharged Card -->
								<div class="bg-white p-4 rounded-lg border border-slate-200 shadow-sm opacity-90">
									<div class="flex justify-between items-start mb-3">
										<span class="px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-[10px] font-bold uppercase">Queue #{item.encounter.queue_number || '-'}</span>
										<span class="flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
											Waiting Payment
										</span>
									</div>
									<h4 class="font-bold text-slate-900 mb-1">{item.patient_name || '-'}</h4>
									<p class="text-xs text-slate-500 mb-4 flex items-center gap-1">
										<span class="material-symbols-outlined text-[14px]">medical_services</span> Dr. {item.doctor_name || '-'}
									</p>
									<button class="w-full bg-accent text-white text-xs font-bold py-2 rounded shadow-sm hover:brightness-105 transition-all">
										Process Billing
									</button>
								</div>

							{:else}
								<!-- Completed Card -->
								<div class="bg-slate-50/50 p-4 rounded-lg border border-dashed border-slate-200 opacity-60 grayscale-[0.5]">
									<div class="flex justify-between items-start mb-3">
										<span class="px-2 py-0.5 bg-slate-200 text-slate-500 rounded text-[10px] font-bold uppercase">Queue #{item.encounter.queue_number || '-'}</span>
										<span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
									</div>
									<h4 class="font-bold text-slate-900 mb-1">{item.patient_name || '-'}</h4>
									<p class="text-[10px] text-slate-400">Checkout at {formatTime(item.encounter.updated_at || item.encounter.created_at)}</p>
								</div>
							{/if}
						{:else}
							<div class="p-8 text-center text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
								Tidak ada antrian
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Table View -->
		<div class="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
			<div class="p-4 border-b border-slate-200">
				<DataTable
					data={encounters}
					columns={tableColumns}
					total={encounters.length}
					limit={100}
					searchable={false}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
/* No styles needed, tailwind handles scrollbars mapped from layout */
</style>
