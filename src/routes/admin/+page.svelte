<script>
	import { onMount, onDestroy } from "svelte";
	import { ADMIN_TABLES } from "$lib/utils/constants.js";
	import { createRealtimeDetail } from "$lib/stores/realtimeStore.js";

	let stats = {};
	let recentActivity = [];
	let onShiftNow = [];
	let loading = true;
	let dashboardStore;

	const importantTables = [
		"users",
		"patients",
		"encounters",
		"payments",
		"items",
	];

	async function setupDashboardRealtime() {
		if (dashboardStore) dashboardStore.destroy();

		dashboardStore = createRealtimeDetail('/api/admin/dashboard', {
			rooms: ['dashboard'],
			events: {
				dashboard_updated: (data, payload) => {
					// Full refresh on general update
					loadStats(true);
					return data;
				},
				queue_created: (data, payload) => {
					loadStats(true); // Increment counts
					return data;
				},
				payment_completed: (data, payload) => {
					loadStats(true);
					return data;
				}
			}
		});

		dashboardStore.subscribe(val => {
			if (val) {
				recentActivity = val.recentActivity || [];
				onShiftNow = val.onShiftNow || [];
			}
		});

		await dashboardStore.load();
		await loadKPIs();
		loading = false;
	}

	async function loadKPIs() {
		try {
			for (const key of importantTables) {
				const res = await fetch(`/api/admin/${key}?limit=1`);
				const data = await res.json();
				stats[key] = data.total || 0;
			}
		} catch (err) {
			console.error(err);
		}
	}

	async function loadStats(isBg = false) {
		await loadKPIs();
		if (dashboardStore) await dashboardStore.load();
	}

	onMount(() => {
		setupDashboardRealtime();
	});

	onDestroy(() => {
		if (dashboardStore) dashboardStore.destroy();
	});

	function timeAgo(dateString) {
		if (!dateString) return '';
		const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' });
		const date = new Date(dateString);
		const daysDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
		if (daysDifference === 0) {
			const hoursDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
			if (hoursDifference === 0) {
				const minsDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60));
				return rtf.format(minsDifference, 'minute');
			}
			return rtf.format(hoursDifference, 'hour');
		}
		return rtf.format(daysDifference, 'day');
	}
</script>

<svelte:head>
	<title>Admin Dashboard — Oratio Clinic</title>
</svelte:head>

<div class="p-8 space-y-8 overflow-y-auto custom-scrollbar">
	<!-- Hero Header -->
	<div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
		<div>
			<h1
				class="text-3xl font-black text-slate-900 dark:text-white tracking-tight"
			>
				Admin Control Center
			</h1>
			<p class="text-slate-500 dark:text-slate-400 font-medium mt-1">
				Real-time infrastructure and medical personnel overview.
			</p>
		</div>
		<div class="flex items-center gap-3">
			<button
				class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all shadow-sm focus:outline-none"
			>
				<span class="material-symbols-outlined text-lg">download</span> Export
			</button>
			<button
				class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all focus:outline-none"
			>
				<span class="material-symbols-outlined text-lg">add</span> New Entry
			</button>
		</div>
	</div>

	<!-- KPI Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
		<div
			class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/20 transition-all"
		>
			<div class="flex items-center justify-between mb-4">
				<div
					class="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-110 transition-transform"
				>
					<span class="material-symbols-outlined">group</span>
				</div>
				{#if loading}
					<div
						class="h-4 w-12 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"
					></div>
				{:else}
					<span
						class="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full"
						>+8%</span
					>
				{/if}
			</div>
			<p class="text-sm font-semibold text-slate-500 dark:text-slate-400">
				Total Users
			</p>
			{#if loading}
				<div
					class="h-8 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mt-1"
				></div>
			{:else}
				<p
					class="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight"
				>
					{stats.users || 0}
				</p>
			{/if}
		</div>

		<div
			class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/20 transition-all"
		>
			<div class="flex items-center justify-between mb-4">
				<div
					class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform"
				>
					<span class="material-symbols-outlined"
						>medical_services</span
					>
				</div>
				{#if loading}
					<div
						class="h-4 w-12 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"
					></div>
				{:else}
					<span
						class="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full"
						>+2%</span
					>
				{/if}
			</div>
			<p class="text-sm font-semibold text-slate-500 dark:text-slate-400">
				Total Encounters
			</p>
			{#if loading}
				<div
					class="h-8 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mt-1"
				></div>
			{:else}
				<p
					class="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight"
				>
					{stats.encounters || 0}
				</p>
			{/if}
		</div>

		<div
			class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/20 transition-all"
		>
			<div class="flex items-center justify-between mb-4">
				<div
					class="p-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg group-hover:scale-110 transition-transform"
				>
					<span class="material-symbols-outlined">person</span>
				</div>
				{#if loading}
					<div
						class="h-4 w-12 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"
					></div>
				{:else}
					<span
						class="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full"
						>+12%</span
					>
				{/if}
			</div>
			<p class="text-sm font-semibold text-slate-500 dark:text-slate-400">
				Total Patients
			</p>
			{#if loading}
				<div
					class="h-8 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mt-1"
				></div>
			{:else}
				<p
					class="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight"
				>
					{stats.patients || 0}
				</p>
			{/if}
		</div>

		<div
			class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/20 transition-all"
		>
			<div class="flex items-center justify-between mb-4">
				<div
					class="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-110 transition-transform"
				>
					<span class="material-symbols-outlined">payments</span>
				</div>
				{#if loading}
					<div
						class="h-4 w-12 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"
					></div>
				{:else}
					<span
						class="text-rose-500 text-xs font-bold bg-rose-500/10 px-2 py-1 rounded-full"
						>-5%</span
					>
				{/if}
			</div>
			<p class="text-sm font-semibold text-slate-500 dark:text-slate-400">
				Total Payments
			</p>
			{#if loading}
				<div
					class="h-8 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mt-1"
				></div>
			{:else}
				<p
					class="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight"
				>
					{stats.payments || 0}
				</p>
			{/if}
		</div>
	</div>

	<!-- Main Grid Section -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Recent Activity Section -->
		<div class="lg:col-span-2 space-y-4">
			<div class="flex items-center justify-between">
				<h3
					class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"
				>
					<span class="material-symbols-outlined text-primary"
						>history</span
					> Recent Activity
				</h3>
				<a
					class="text-primary text-sm font-bold hover:underline"
					href="/admin/encounters">View Details</a
				>
			</div>
			<div
				class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
			>
				<table class="w-full text-left text-sm border-collapse">
					<thead>
						<tr
							class="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800"
						>
							<th
								class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300"
								>User / Staff</th
							>
							<th
								class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300"
								>Action / Role</th
							>
							<th
								class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300"
								>Timestamp</th
							>
							<th
								class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300"
								>Status</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
						{#each recentActivity as activity}
						<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div class="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-xs text-slate-600">
										{activity.user_initials}
									</div>
									<span class="font-bold text-slate-900 dark:text-white">{activity.user_name}</span>
								</div>
							</td>
							<td class="px-6 py-4">
								<p class="font-medium text-slate-700 dark:text-slate-300">{activity.role}</p>
								<p class="text-[10px] text-slate-500 uppercase">{activity.action}</p>
							</td>
							<td class="px-6 py-4 text-slate-500 dark:text-slate-400">{timeAgo(activity.timestamp)}</td>
							<td class="px-6 py-4">
								{#if activity.active}
								<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
									<span class="size-1.5 rounded-full bg-emerald-500"></span> In Progress
								</span>
								{:else}
								<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
									<span class="size-1.5 rounded-full bg-slate-400"></span> {activity.status}
								</span>
								{/if}
							</td>
						</tr>
						{:else}
						<tr>
							<td colspan="4" class="px-6 py-8 text-center text-slate-500">No recent activity</td>
						</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Side Panel: Quick Actions & Doctor Status -->
		<div class="space-y-8">
			<!-- Quick Actions -->
			<div class="space-y-4">
				<h3 class="text-lg font-bold text-slate-900 dark:text-white">
					Quick Actions
				</h3>
				<div class="grid grid-cols-1 gap-3">
					<a
						href="/admin/users"
						class="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left hover:border-primary/50 hover:shadow-md transition-all group"
					>
						<div
							class="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all"
						>
							<span class="material-symbols-outlined"
								>manage_accounts</span
							>
						</div>
						<div>
							<p
								class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors"
							>
								Manage Users
							</p>
							<p class="text-[11px] text-slate-500">
								Permissions & Access Controls
							</p>
						</div>
					</a>
					<a
						href="/admin/doctor-shifts"
						class="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left hover:border-primary/50 hover:shadow-md transition-all group"
					>
						<div
							class="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all"
						>
							<span class="material-symbols-outlined"
								>event_available</span
							>
						</div>
						<div>
							<p
								class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors"
							>
								Doctor Shifts
							</p>
							<p class="text-[11px] text-slate-500">
								Manage Weekly Rotations
							</p>
						</div>
					</a>
					<a
						href="/admin/import"
						class="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left hover:border-primary/50 hover:shadow-md transition-all group"
					>
						<div
							class="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all"
						>
							<span class="material-symbols-outlined"
								>upload_file</span
							>
						</div>
						<div>
							<p
								class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors"
							>
								Import Data
							</p>
							<p class="text-[11px] text-slate-500">
								Bulk Upload Records
							</p>
						</div>
					</a>
				</div>
			</div>

			<!-- Doctor Status Overview -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-bold text-slate-900 dark:text-white">
						On Shift Now
					</h3>
					<span class="text-xs font-bold text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded-md">
						{onShiftNow.length} Online
					</span>
				</div>
				<div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-sm">
					{#each onShiftNow as doc}
					<div class="flex items-center gap-3">
						<div class="relative">
							<div class="size-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-white dark:border-slate-800 flex items-center justify-center font-bold text-xs text-slate-600">
								{doc.initials}
							</div>
							<span class="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-bold text-slate-900 dark:text-white truncate">
								{doc.name}
							</p>
							<p class="text-[10px] text-slate-500 uppercase font-semibold">
								{doc.room}
							</p>
						</div>
					</div>
					{:else}
					<p class="text-sm text-slate-500 text-center py-4">No doctors on shift at the moment.</p>
					{/each}
					<a
						href="/admin/doctor-shifts"
						class="block text-center w-full py-2 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					>
						View Full Roster
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
