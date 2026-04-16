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
	let tableDoctorFilter = ""; // This will now store doctor_id
	let doctors = [];
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

	let sortKey = "";
	let sortDesc = false;

	function handleSort(key) {
		if (sortKey === key) {
			sortDesc = !sortDesc;
		} else {
			sortKey = key;
			sortDesc = false;
		}
	}

	$: sortedTableEncounters = [...filteredTableEncounters].sort((a, b) => {
		if (!sortKey) return 0;
		let valA, valB;
		if (sortKey === 'id') { valA = a.encounter?.id || ''; valB = b.encounter?.id || ''; }
		else if (sortKey === 'patient') { valA = a.patient_name || ''; valB = b.patient_name || ''; }
		else if (sortKey === 'patient_id') { valA = a.encounter?.patient_id || ''; valB = b.encounter?.patient_id || ''; }
		else if (sortKey === 'doctor') { valA = a.doctor_name || ''; valB = b.doctor_name || ''; }
		else if (sortKey === 'reason') { valA = a.encounter_reason_display || ''; valB = b.encounter_reason_display || ''; }
		else if (sortKey === 'status') { valA = a.encounter?.status || ''; valB = b.encounter?.status || ''; }
		else if (sortKey === 'time') { valA = new Date(a.encounter?.created_at || 0).getTime(); valB = new Date(b.encounter?.created_at || 0).getTime(); }
		
		if (typeof valA === 'string') valA = valA.toLowerCase();
		if (typeof valB === 'string') valB = valB.toLowerCase();
		
		if (valA < valB) return sortDesc ? 1 : -1;
		if (valA > valB) return sortDesc ? -1 : 1;
		return 0;
	});

	$: totalPages = Math.ceil(sortedTableEncounters.length / itemsPerPage);
	$: paginatedEncounters = sortedTableEncounters.slice(
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
			
			if (tableDoctorFilter) {
			    params.set("doctor_id", tableDoctorFilter);
			}
			
			if (tableStatusFilter) {
			    params.set("status", tableStatusFilter);
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

	async function loadDoctors() {
		try {
			const res = await fetch('/api/doctors');
			const data = await res.json();
			doctors = data.doctors || [];
		} catch (err) {
			console.error("Failed to load doctors:", err);
		}
	}

	onMount(async () => {
		await loadDoctors();
		if (user?.role === 'dokter' && user?.id) {
			tableDoctorFilter = user.id;
		}
		await loadEncounters();
	});

	function handleExport() {
		if (encounters.length === 0) return;

		const headers = [
			"Encounter ID",
			"Patient Name",
			"Patient ID",
			"Doctor",
			"Reason",
			"Status",
			"Date",
			"Time",
			"Subjective (S)",
			"Objective (O)",
			"Assessment (A)",
			"Plan (P)",
			"Prescription (Resep)",
			"Additional Notes (Keterangan)"
		];

		const rows = sortedTableEncounters.map(e => [
			e.encounter?.id || "",
			e.patient_name || "",
			e.encounter?.patient_id || "",
			e.doctor_name || "",
			e.encounter_reason_display || "",
			e.encounter?.status || "",
			new Date(e.encounter?.created_at).toLocaleDateString('id-ID'),
			formatTime(e.encounter?.created_at),
			e.encounter?.subjective || "",
			e.encounter?.objective || "",
			e.encounter?.assessment || "",
			e.encounter?.plan || "",
			e.encounter?.resep || "",
			e.encounter?.keterangan || ""
		]);

		const csvContent = [
			headers.join(","),
			...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
		].join("\n");

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		
		const timestamp = new Date().toISOString().split('T')[0];
		link.setAttribute("href", url);
		link.setAttribute("download", `Encounter_History_${timestamp}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
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
					on:change={loadEncounters}
					class="text-sm py-1.5 pl-3 pr-8 border border-slate-200 rounded-md bg-white focus:ring-primary focus:border-primary outline-none"
				>
					<option value="all">All Doctors</option>
					{#each doctors as doc}
						<option value={doc.id}>Dr. {doc.name}</option>
					{/each}
				</select>
			</div>

			<div class="flex items-center gap-2">
				<label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status:</label>
				<select
					bind:value={tableStatusFilter}
					on:change={loadEncounters}
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
				<button 
					class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors disabled:opacity-50"
					on:click={handleExport}
					disabled={encounters.length === 0}
				>
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
							<th class="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:text-primary transition-colors select-none group" on:click={() => handleSort('id')}>
							    <div class="flex items-center gap-1">Encounter ID<span class="material-symbols-outlined text-[14px] {sortKey === 'id' ? 'text-primary' : 'text-slate-300 opacity-0 group-hover:opacity-100'}">{sortKey === 'id' ? (sortDesc ? 'arrow_downward' : 'arrow_upward') : 'unfold_more'}</span></div>
							</th>
							<th class="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:text-primary transition-colors select-none group" on:click={() => handleSort('patient')}>
							    <div class="flex items-center gap-1">Patient Name<span class="material-symbols-outlined text-[14px] {sortKey === 'patient' ? 'text-primary' : 'text-slate-300 opacity-0 group-hover:opacity-100'}">{sortKey === 'patient' ? (sortDesc ? 'arrow_downward' : 'arrow_upward') : 'unfold_more'}</span></div>
							</th>
							<th class="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:text-primary transition-colors select-none group" on:click={() => handleSort('patient_id')}>
							    <div class="flex items-center gap-1">Patient ID<span class="material-symbols-outlined text-[14px] {sortKey === 'patient_id' ? 'text-primary' : 'text-slate-300 opacity-0 group-hover:opacity-100'}">{sortKey === 'patient_id' ? (sortDesc ? 'arrow_downward' : 'arrow_upward') : 'unfold_more'}</span></div>
							</th>
							<th class="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:text-primary transition-colors select-none group" on:click={() => handleSort('doctor')}>
							    <div class="flex items-center gap-1">Doctor<span class="material-symbols-outlined text-[14px] {sortKey === 'doctor' ? 'text-primary' : 'text-slate-300 opacity-0 group-hover:opacity-100'}">{sortKey === 'doctor' ? (sortDesc ? 'arrow_downward' : 'arrow_upward') : 'unfold_more'}</span></div>
							</th>
							<th class="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:text-primary transition-colors select-none group" on:click={() => handleSort('reason')}>
							    <div class="flex items-center gap-1">Reason<span class="material-symbols-outlined text-[14px] {sortKey === 'reason' ? 'text-primary' : 'text-slate-300 opacity-0 group-hover:opacity-100'}">{sortKey === 'reason' ? (sortDesc ? 'arrow_downward' : 'arrow_upward') : 'unfold_more'}</span></div>
							</th>
							<th class="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:text-primary transition-colors select-none group" on:click={() => handleSort('status')}>
							    <div class="flex items-center gap-1">Status<span class="material-symbols-outlined text-[14px] {sortKey === 'status' ? 'text-primary' : 'text-slate-300 opacity-0 group-hover:opacity-100'}">{sortKey === 'status' ? (sortDesc ? 'arrow_downward' : 'arrow_upward') : 'unfold_more'}</span></div>
							</th>
							<th class="px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:text-primary transition-colors select-none group" on:click={() => handleSort('time')}>
							    <div class="flex items-center gap-1">Time<span class="material-symbols-outlined text-[14px] {sortKey === 'time' ? 'text-primary' : 'text-slate-300 opacity-0 group-hover:opacity-100'}">{sortKey === 'time' ? (sortDesc ? 'arrow_downward' : 'arrow_upward') : 'unfold_more'}</span></div>
							</th>
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
								    <div class="flex items-center gap-2">
								        {#if row.encounter?.soap_document_id}
								            <a 
								                href="/api/documents/{row.encounter?.soap_document_id}" 
								                target="_blank"
								                class="text-teal-700 hover:text-teal-800 font-semibold text-xs uppercase tracking-wider bg-teal-50 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-teal-100 transition-colors border border-teal-200 shadow-sm"
								                on:click|stopPropagation
								            >
								                <span class="material-symbols-outlined text-[16px]">description</span>
								                SOAP
								            </a>
								        {/if}
								        <a 
								            href="/dokter/{row.encounter?.id}" 
								            class="text-primary hover:text-primary/80 font-semibold text-xs uppercase tracking-wider bg-primary/10 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-primary/20 transition-colors"
								            on:click|stopPropagation
								        >
								            <span class="material-symbols-outlined text-[16px]">visibility</span>
								            View
								        </a>
								    </div>
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
									
									{#if row.clinical_photos && row.clinical_photos.length > 0}
									<div class="mt-6 border-t border-slate-200 pt-5">
										<h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">photo_library</span> Clinical Photos</h4>
										<div class="flex flex-wrap gap-4">
											{#each row.clinical_photos as photo}
												<a href="/api/documents/{photo.id}" target="_blank" class="block w-28 h-28 rounded-xl border border-slate-200 overflow-hidden hover:border-primary transition-all hover:shadow-md hover:-translate-y-0.5 group relative bg-white">
													{#if photo.mime_type?.startsWith('image/')}
													<img src="/api/documents/{photo.id}" alt={photo.file_name} class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
													<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
														<span class="material-symbols-outlined text-white shadow-sm">open_in_new</span>
													</div>
													{:else}
													<div class="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center group-hover:text-primary transition-colors">
														<span class="material-symbols-outlined mb-1 text-2xl group-hover:scale-110 transition-transform">description</span>
														<span class="text-[10px] truncate w-full font-medium" title={photo.file_name}>{photo.file_name}</span>
													</div>
													{/if}
												</a>
											{/each}
										</div>
									</div>
									{/if}
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
