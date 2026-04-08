<script>
	import { onMount } from "svelte";
	export let data;
	$: user = data?.user;
	import { formatElapsedTime, formatTime } from "$lib/utils/formatters.js";

	let encounters = [];
	let loading = true;
	let filterDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })).toISOString().split('T')[0];
	let filterMonth = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })).toISOString().substring(0, 7); // YYYY-MM
	let filterType = "date"; // 'all', 'date' or 'month'
	
	let tableStatusFilter = "";
	let tableDoctorFilter = "";
	let searchQuery = "";

	let expandedRowId = null;

	function toggleRow(id) {
		if (expandedRowId === id) {
			expandedRowId = null;
		} else {
			expandedRowId = id;
		}
	}

	let currentPage = 1;
	let itemsPerPage = 10;

	$: filteredTableEncounters = encounters.filter((e) => {
		if (tableDoctorFilter && e.doctor_name !== tableDoctorFilter) {
			return false;
		}
		if (tableStatusFilter && e.encounter?.status !== tableStatusFilter) {
			return false;
		}
		if (searchQuery) {
		    const query = searchQuery.toLowerCase();
		    if (!e.patient_name?.toLowerCase().includes(query) && 
		        !e.encounter?.patient_id?.includes(query) &&
		        !e.encounter?.id.toLowerCase().includes(query)) {
		        return false;
		    }
		}
		return true;
	});

	$: {
		// Reset to page 1 when data changes (filter changes)
		if (filteredTableEncounters.length >= 0) currentPage = 1;
	}

	$: totalPages = Math.ceil(filteredTableEncounters.length / itemsPerPage);
	$: paginatedEncounters = filteredTableEncounters.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	async function loadEncounters() {
		loading = true;
		try {
			const params = new URLSearchParams({ limit: 500 });
			if (filterType === 'date') {
			    params.set("date", filterDate);
			} else if (filterType === 'month') {
			    const year = filterMonth.split('-')[0];
			    const month = filterMonth.split('-')[1];
			    const daysInMonth = new Date(year, month, 0).getDate();
			    params.set("date_from", `${filterMonth}-01`);
			    params.set("date_to", `${filterMonth}-${daysInMonth}`);
			}
			const res = await fetch(`/api/encounters?${params}`);
			const data = await res.json();
			encounters = data.data || [];
		} catch (err) {
			console.error("Failed to load encounters:", err);
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		if (user?.name) {
			tableDoctorFilter = user.name;
		}
		await loadEncounters();
	});
</script>

<svelte:head>
	<title>Encounter History — Oratio Clinic</title>
</svelte:head>

<div class="-m-6 flex h-[calc(100vh-73px)] bg-slate-50 overflow-hidden font-sans relative">
	<div class="flex-1 flex flex-col min-h-0 p-6">
		<div class="flex items-center justify-between mb-6 shrink-0">
			<div>
				<h2 class="text-xl font-bold text-blue-900">Encounter History</h2>
				<p class="text-sm text-slate-500">View and filter previous patient visits</p>
			</div>
		</div>

		<!-- Filters Bar -->
		<div class="bg-white p-4 rounded-t-xl border-x border-t border-slate-200 flex flex-wrap items-center gap-4 shrink-0 shadow-sm">
			<div class="flex items-center gap-2">
				<select bind:value={filterType} on:change={loadEncounters} class="text-sm py-1.5 pl-3 pr-8 border border-slate-200 rounded-md bg-slate-50 focus:ring-primary focus:border-primary outline-none font-medium">
				    <option value="all">All</option>
				    <option value="date">Daily</option>
				    <option value="month">Monthly</option>
				</select>
				{#if filterType === 'date'}
				<input
					type="date"
					class="text-sm py-1.5 px-3 border border-slate-200 rounded-md bg-white focus:ring-primary focus:border-primary outline-none"
					bind:value={filterDate}
					on:change={loadEncounters}
				/>
				{:else if filterType === 'month'}
				<input
					type="month"
					class="text-sm py-1.5 px-3 border border-slate-200 rounded-md bg-white focus:ring-primary focus:border-primary outline-none"
					bind:value={filterMonth}
					on:change={loadEncounters}
				/>
				{/if}
			</div>

			<div class="flex items-center gap-2">
				<input
					type="text"
					placeholder="Search by name or ID..."
					class="text-sm py-1.5 px-3 border border-slate-200 rounded-md bg-white focus:ring-primary focus:border-primary outline-none w-64"
					bind:value={searchQuery}
				/>
			</div>

			<div class="flex items-center gap-2">
				<label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor:</label>
				<select
					bind:value={tableDoctorFilter}
					class="text-sm py-1.5 pl-3 pr-8 border border-slate-200 rounded-md bg-white focus:ring-primary focus:border-primary outline-none"
				>
					<option value="">All Doctors</option>
					{#each [...new Set(encounters.map((e) => e.doctor_name).filter(Boolean))] as doc}
						<option value={doc}>Dr. {doc}</option>
					{/each}
				</select>
			</div>

			<div class="flex items-center gap-2">
				<label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</label>
				<select
					bind:value={tableStatusFilter}
					class="text-sm py-1.5 pl-3 pr-8 border border-slate-200 rounded-md bg-white focus:ring-primary focus:border-primary outline-none"
				>
					<option value="">All Status</option>
					<option value="Planned">Planned</option>
					<option value="In Progress">In Progress</option>
					<option value="On Hold">On Hold</option>
					<option value="Discharged">Discharged</option>
					<option value="Completed">Completed</option>
					<option value="Cancelled">Cancelled</option>
					<option value="Discontinued">Discontinued</option>
				</select>
			</div>
			
			<div class="ml-auto">
				<button class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors">
					<span class="material-symbols-outlined text-sm">download</span>
					Export Data
				</button>
			</div>
		</div>

		<!-- Table Content -->
		<div class="bg-white rounded-b-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
		    {#if loading}
				<div class="flex-1 flex flex-col items-center justify-center text-slate-400">
					<span class="material-symbols-outlined text-4xl animate-spin mb-2" style="animation: spin 1s linear infinite;">refresh</span>
					<p>Memuat data...</p>
				</div>
			{:else}
			<div class="overflow-y-auto custom-scrollbar flex-1">
				<table class="w-full text-left text-sm whitespace-nowrap">
					<thead class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
						<tr>
							<th class="px-6 py-4 font-semibold text-slate-700">Encounter ID</th>
							<th class="px-6 py-4 font-semibold text-slate-700">Patient Name</th>
							<th class="px-6 py-4 font-semibold text-slate-700">Patient ID</th>
							<th class="px-6 py-4 font-semibold text-slate-700">Doctor</th>
							<th class="px-6 py-4 font-semibold text-slate-700">Reason</th>
							<th class="px-6 py-4 font-semibold text-slate-700">Status</th>
							<th class="px-6 py-4 font-semibold text-slate-700">Time</th>
							<th class="px-6 py-4 font-semibold text-slate-700">Action</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each paginatedEncounters as row}
							{@const status = row.encounter?.status}
							<tr 
								class="hover:bg-slate-50/50 transition-colors cursor-pointer {expandedRowId === row.encounter?.id ? 'bg-primary/5' : ''}"
								on:click={() => toggleRow(row.encounter?.id)}
							>
								<td class="px-6 py-4 font-bold text-slate-900 font-mono text-xs">
									{row.encounter?.id}
								</td>
								<td class="px-6 py-4 font-medium max-w-[200px] truncate" title={row.patient_name}>
									{row.patient_name || "-"}
								</td>
								<td class="px-6 py-4 text-slate-500 font-mono text-xs">
									{row.encounter?.patient_id || "-"}
								</td>
								<td class="px-6 py-4 text-slate-600">
									{row.doctor_name ? `Dr. ${row.doctor_name}` : "-"}
								</td>
								<td class="px-6 py-4 text-slate-600 max-w-[200px] truncate" title={row.encounter_reason_display}>
									{row.encounter_reason_display || "-"}
								</td>
								<td class="px-6 py-4">
									{#if status === "Planned" || status === "Arrived"}
										<span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[11px] font-bold uppercase tracking-wider">Waiting</span>
									{:else if status === "In Progress"}
										<span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold uppercase tracking-wider">In Progress</span>
									{:else if status === "Discharged"}
										<span class="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[11px] font-bold uppercase tracking-wider">Discharged</span>
									{:else if status === "Completed"}
										<span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold uppercase tracking-wider">Completed</span>
									{:else}
										<span class="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[11px] font-bold uppercase tracking-wider">{status || "-"}</span>
									{/if}
								</td>
								<td class="px-6 py-4 text-slate-500">
									<div class="flex flex-col">
									    <span>{new Date(row.encounter?.created_at).toLocaleDateString()}</span>
									    <span class="text-xs text-slate-400">{formatTime(row.encounter?.created_at)}</span>
									</div>
								</td>
								<td class="px-6 py-4">
								    <a 
								        href="/dokter/{row.encounter?.id}" 
								        class="text-primary hover:text-primary/80 font-semibold text-xs uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded hover:bg-primary/20 transition-colors"
								        on:click|stopPropagation
								    >
								        View Session
								    </a>
								</td>
							</tr>
							{#if expandedRowId === row.encounter?.id}
							<tr class="bg-slate-50/80">
								<td colspan="8" class="px-6 py-6 transition-all duration-300">
									<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										<div class="space-y-4">
											<div>
												<h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subjective (S)</h4>
												<p class="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{row.encounter?.subjective || "-"}</p>
											</div>
											<div>
												<h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Objective (O)</h4>
												<p class="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{row.encounter?.objective || "-"}</p>
											</div>
										</div>
										<div class="space-y-4">
											<div>
												<h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assessment (A)</h4>
												<p class="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{row.encounter?.assessment || "-"}</p>
											</div>
											<div>
												<h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Plan (P)</h4>
												<p class="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{row.encounter?.plan || "-"}</p>
											</div>
										</div>
										<div class="space-y-4 bg-white/50 p-4 rounded-xl border border-slate-100">
											<div>
												<h4 class="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Prescription (Resep)</h4>
												<p class="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{row.encounter?.resep || "-"}</p>
											</div>
											<div>
												<h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Additional Notes (Keterangan)</h4>
												<p class="text-sm text-slate-600 italic whitespace-pre-wrap leading-relaxed">{row.encounter?.keterangan || "-"}</p>
											</div>
										</div>
									</div>
								</td>
							</tr>
							{/if}
						{:else}
							<tr>
								<td colspan="8" class="px-6 py-8 text-center text-slate-400">
									Tidak ada data riwayat kunjungan.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<!-- Pagination Footer -->
			<div class="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
				<div class="text-xs text-slate-500 font-medium">
					Menampilkan <strong class="text-slate-900">{filteredTableEncounters.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> - <strong class="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredTableEncounters.length)}</strong> dari <strong class="text-slate-900">{filteredTableEncounters.length}</strong> kunjungan
				</div>
				<div class="flex items-center gap-2">
					<button
						class="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
						disabled={currentPage === 1}
						on:click={() => currentPage--}
					>
						<span class="material-symbols-outlined text-sm">chevron_left</span>
					</button>
					<div class="text-xs font-bold text-slate-700 w-8 text-center">{currentPage}</div>
					<button
						class="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
						disabled={currentPage >= totalPages || totalPages === 0}
						on:click={() => currentPage++}
					>
						<span class="material-symbols-outlined text-sm">chevron_right</span>
					</button>
				</div>
			</div>
			{/if}
		</div>
	</div>
</div>
