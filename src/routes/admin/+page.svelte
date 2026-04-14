<script>
	import { onMount, onDestroy } from "svelte";
	import { ADMIN_TABLES } from "$lib/utils/constants.js";

	let stats = {};
	let loading = true;
	let refreshInterval;

	const importantTables = [
		"users",
		"patients",
		"encounters",
		"payments",
		"items",
	];

	async function loadStats(isBg = false) {
		if (!isBg) loading = true;
		try {
			for (const key of importantTables) {
				const res = await fetch(`/api/admin/${key}?limit=1`);
				const data = await res.json();
				stats[key] = data.total || 0;
			}
		} catch (err) {
			console.error(err);
		} finally {
			if (!isBg) loading = false;
		}
	}

	onMount(() => {
		loadStats();
		refreshInterval = setInterval(() => loadStats(true), 30000);
	});

	onDestroy(() => {
		if (refreshInterval) clearInterval(refreshInterval);
	});
</script>

<svelte:head>
	<title>Admin Dashboard — Oratio Clinic</title>
</svelte:head>

<div class="p-8 space-y-8 overflow-y-auto custom-scrollbar">
	<!-- Hero Header -->
	<div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
		<div>
			<h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admin Control Center</h1>
			<p class="text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time infrastructure and medical personnel overview.</p>
		</div>
		<div class="flex items-center gap-3">
			<button class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all shadow-sm focus:outline-none">
				<span class="material-symbols-outlined text-lg">download</span> Export
			</button>
			<button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all focus:outline-none">
				<span class="material-symbols-outlined text-lg">add</span> New Entry
			</button>
		</div>
	</div>

	<!-- KPI Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
		<div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/20 transition-all">
			<div class="flex items-center justify-between mb-4">
				<div class="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
					<span class="material-symbols-outlined">group</span>
				</div>
                {#if loading}
                    <div class="h-4 w-12 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                {:else}
				    <span class="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">+8%</span>
                {/if}
			</div>
			<p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Users</p>
            {#if loading}
                <div class="h-8 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mt-1"></div>
            {:else}
			    <p class="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{stats.users || 0}</p>
            {/if}
		</div>

		<div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/20 transition-all">
			<div class="flex items-center justify-between mb-4">
				<div class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
					<span class="material-symbols-outlined">medical_services</span>
				</div>
                {#if loading}
                    <div class="h-4 w-12 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                {:else}
				    <span class="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">+2%</span>
                {/if}
			</div>
			<p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Encounters</p>
            {#if loading}
                <div class="h-8 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mt-1"></div>
            {:else}
			    <p class="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{stats.encounters || 0}</p>
            {/if}
		</div>

		<div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/20 transition-all">
			<div class="flex items-center justify-between mb-4">
				<div class="p-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg group-hover:scale-110 transition-transform">
					<span class="material-symbols-outlined">person</span>
				</div>
                {#if loading}
                    <div class="h-4 w-12 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                {:else}
				    <span class="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">+12%</span>
                {/if}
			</div>
			<p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Patients</p>
            {#if loading}
                <div class="h-8 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mt-1"></div>
            {:else}
			    <p class="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{stats.patients || 0}</p>
            {/if}
		</div>

		<div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/20 transition-all">
			<div class="flex items-center justify-between mb-4">
				<div class="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
					<span class="material-symbols-outlined">payments</span>
				</div>
                {#if loading}
                    <div class="h-4 w-12 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                {:else}
				    <span class="text-rose-500 text-xs font-bold bg-rose-500/10 px-2 py-1 rounded-full">-5%</span>
                {/if}
			</div>
			<p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Payments</p>
            {#if loading}
                <div class="h-8 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mt-1"></div>
            {:else}
			    <p class="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{stats.payments || 0}</p>
            {/if}
		</div>
	</div>

	<!-- Main Grid Section -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Recent Activity Section -->
		<div class="lg:col-span-2 space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
					<span class="material-symbols-outlined text-primary">history</span> Recent Activity
				</h3>
				<a class="text-primary text-sm font-bold hover:underline" href="/admin/encounters">View Details</a>
			</div>
			<div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
				<table class="w-full text-left text-sm border-collapse">
					<thead>
						<tr class="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
							<th class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">User / Staff</th>
							<th class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Action / Role</th>
							<th class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Timestamp</th>
							<th class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
						<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div class="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-xs text-slate-600">
										SC
									</div>
									<span class="font-bold text-slate-900 dark:text-white">Dr. Sarah Chen</span>
								</div>
							</td>
							<td class="px-6 py-4">
								<p class="font-medium text-slate-700 dark:text-slate-300">Clinical Lead</p>
								<p class="text-[10px] text-slate-500 uppercase">Logged in</p>
							</td>
							<td class="px-6 py-4 text-slate-500 dark:text-slate-400">2 mins ago</td>
							<td class="px-6 py-4">
								<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
									<span class="size-1.5 rounded-full bg-emerald-500"></span> Active
								</span>
							</td>
						</tr>
						<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div class="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-xs text-slate-600">
										MW
									</div>
									<span class="font-bold text-slate-900 dark:text-white">Marcus Wright</span>
								</div>
							</td>
							<td class="px-6 py-4">
								<p class="font-medium text-slate-700 dark:text-slate-300">Receptionist</p>
								<p class="text-[10px] text-slate-500 uppercase">Patient Checked In</p>
							</td>
							<td class="px-6 py-4 text-slate-500 dark:text-slate-400">14 mins ago</td>
							<td class="px-6 py-4">
								<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
									<span class="size-1.5 rounded-full bg-emerald-500"></span> Active
								</span>
							</td>
						</tr>
						<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div class="size-8 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs">
										<span class="text-xs font-bold text-slate-500">JD</span>
									</div>
									<span class="font-bold text-slate-900 dark:text-white">Janet Doe</span>
								</div>
							</td>
							<td class="px-6 py-4">
								<p class="font-medium text-slate-700 dark:text-slate-300">Billing Admin</p>
								<p class="text-[10px] text-slate-500 uppercase">Invoice Generated</p>
							</td>
							<td class="px-6 py-4 text-slate-500 dark:text-slate-400">1 hour ago</td>
							<td class="px-6 py-4">
								<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
									<span class="size-1.5 rounded-full bg-slate-400"></span> Offline
								</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- Side Panel: Quick Actions & Doctor Status -->
		<div class="space-y-8">
			<!-- Quick Actions -->
			<div class="space-y-4">
				<h3 class="text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h3>
				<div class="grid grid-cols-1 gap-3">
					<a href="/admin/users" class="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left hover:border-primary/50 hover:shadow-md transition-all group">
						<div class="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
							<span class="material-symbols-outlined">manage_accounts</span>
						</div>
						<div>
							<p class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">Manage Users</p>
							<p class="text-[11px] text-slate-500">Permissions & Access Controls</p>
						</div>
					</a>
					<a href="/admin/doctor-shifts" class="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left hover:border-primary/50 hover:shadow-md transition-all group">
						<div class="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
							<span class="material-symbols-outlined">event_available</span>
						</div>
						<div>
							<p class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">Doctor Shifts</p>
							<p class="text-[11px] text-slate-500">Manage Weekly Rotations</p>
						</div>
					</a>
					<a href="/admin/import" class="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-left hover:border-primary/50 hover:shadow-md transition-all group">
						<div class="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
							<span class="material-symbols-outlined">upload_file</span>
						</div>
						<div>
							<p class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">Import Data</p>
							<p class="text-[11px] text-slate-500">Bulk Upload Records</p>
						</div>
					</a>
				</div>
			</div>

			<!-- Doctor Status Overview -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-bold text-slate-900 dark:text-white">On Shift Now</h3>
					<span class="text-xs font-bold text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded-md">2 Online</span>
				</div>
				<div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-sm">
					<div class="flex items-center gap-3">
						<div class="relative">
							<div class="size-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-white dark:border-slate-800 flex items-center justify-center font-bold text-xs text-slate-600">
								SC
							</div>
							<span class="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-bold text-slate-900 dark:text-white truncate">Dr. Sarah Chen</p>
							<p class="text-[10px] text-slate-500 uppercase font-semibold">Surgery • Rm 302</p>
						</div>
					</div>
					<div class="flex items-center gap-3">
						<div class="relative">
							<div class="size-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-white dark:border-slate-800 flex items-center justify-center font-bold text-xs text-slate-600">
								AT
							</div>
							<span class="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-bold text-slate-900 dark:text-white truncate">Dr. Aris Thorne</p>
							<p class="text-[10px] text-slate-500 uppercase font-semibold">General • Rm 101</p>
						</div>
					</div>
					<a href="/admin/doctor-shifts" class="block text-center w-full py-2 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
						View Full Roster
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- System Infrastructure Log -->
	<div class="space-y-4 pb-8">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
				<span class="material-symbols-outlined text-primary">dns</span> System Infrastructure Log
			</h3>
			<div class="flex gap-4">
				<span class="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider"><span class="size-2 rounded-full bg-primary"></span> Database</span>
				<span class="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider"><span class="size-2 rounded-full bg-slate-300 dark:bg-slate-600"></span> API Call</span>
			</div>
		</div>
		<div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
			<div class="divide-y divide-slate-100 dark:divide-slate-800">
				<!-- Activity Entry -->
				<div class="flex items-center gap-6 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-l-4 border-primary">
					<div class="text-[11px] font-mono font-bold text-slate-400 w-16">09:42:12</div>
					<div class="size-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
						<span class="material-symbols-outlined">database</span>
					</div>
					<div class="flex-1">
						<p class="text-sm font-bold text-slate-900 dark:text-white">Patient Index Sync</p>
						<p class="text-xs text-slate-500">Re-indexed 1,200 records across regional clusters</p>
					</div>
					<div class="text-right">
						<span class="text-[10px] font-black bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-800">OK 200</span>
					</div>
				</div>

				<!-- Activity Entry -->
				<div class="flex items-center gap-6 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-l-4 border-slate-300 dark:border-slate-600">
					<div class="text-[11px] font-mono font-bold text-slate-400 w-16">09:38:45</div>
					<div class="size-10 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg flex items-center justify-center">
						<span class="material-symbols-outlined">api</span>
					</div>
					<div class="flex-1">
						<p class="text-sm font-bold text-slate-900 dark:text-white">Terminology Verification API</p>
						<p class="text-xs text-slate-500">POST Request to SNOMED CT Services</p>
					</div>
					<div class="text-right">
						<span class="text-[10px] font-black bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-2.5 py-1 rounded-md border border-amber-100 dark:border-amber-800">PENDING</span>
					</div>
				</div>

				<!-- Activity Entry -->
				<div class="flex items-center gap-6 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-l-4 border-primary">
					<div class="text-[11px] font-mono font-bold text-slate-400 w-16">09:15:02</div>
					<div class="size-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
						<span class="material-symbols-outlined">security</span>
					</div>
					<div class="flex-1">
						<p class="text-sm font-bold text-slate-900 dark:text-white">SSL Certificate Renewal</p>
						<p class="text-xs text-slate-500">Main portal SSL automatically renewed via Let's Encrypt</p>
					</div>
					<div class="text-right">
						<span class="text-[10px] font-black bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20 uppercase">Secured</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
