<script>
	import { ADMIN_TABLES } from "$lib/utils/constants.js";
	import AdminFileUpload from "$lib/components/UI/AdminFileUpload.svelte";
	import { addToast } from "$lib/stores/toast.js";
	import Papa from "papaparse";

	let selectedTable = "";
	let csvFile = null;
	let csvText = "";
	let previewData = [];
	let previewFields = [];
	let importing = false;
	let importErrors = [];
	let step = 1; // 1=select, 2=preview, 3=result
	let importProgress = { current: 0, total: 0 };

	// FK lookups (single-select)
	let fkLookups = {};
	let fkLoading = {};
	let selectedFks = {};

	// M2M lookups (multi-select)
	let selectedM2ms = {}; // { fieldKey: [id1, id2, ...] }

	async function loadFkLookup(fkTable, filter = null) {
		const cacheKey = filter 
			? `${fkTable}?${new URLSearchParams(filter).toString()}`
			: fkTable;

		if (fkLookups[cacheKey] || fkLoading[cacheKey]) return;
		fkLoading[cacheKey] = true;
		try {
			let url = `/api/admin/${fkTable}?limit=500`;
			if (filter) {
				const params = new URLSearchParams(filter);
				url += `&${params.toString()}`;
			}
			const res = await fetch(url);
			const resp = await res.json();
			fkLookups[cacheKey] = resp.data || [];
			fkLookups = fkLookups; // trigger reactivity
		} catch (err) {
			console.error(`Failed to load FK data for ${fkTable}:`, err);
			fkLookups[cacheKey] = [];
		} finally {
			fkLoading[cacheKey] = false;
		}
	}

	function getCacheKey(field) {
		if (!field.fkFilter) return field.fkTable;
		return `${field.fkTable}?${new URLSearchParams(field.fkFilter).toString()}`;
	}

	// Reactive: when selectedTable changes, reset selections and load FK/M2M lookups
	$: if (selectedTable) {
		selectedFks = {};
		selectedM2ms = {};
		const fields = ADMIN_TABLES[selectedTable]?.fields || [];
		fields.forEach(field => {
			if (field.type === 'fk') {
				loadFkLookup(field.fkTable, field.fkFilter);
			}
			if (field.type === 'm2m') {
				loadFkLookup(field.fkTable, field.fkFilter);
				selectedM2ms[field.key] = [];
			}
		});
	}

	// Computed: does the selected table have any relationship fields?
	$: fkFields = selectedTable
		? (ADMIN_TABLES[selectedTable]?.fields || []).filter(f => f.type === 'fk')
		: [];
	$: m2mFields = selectedTable
		? (ADMIN_TABLES[selectedTable]?.fields || []).filter(f => f.type === 'm2m')
		: [];
	$: hasRelationships = fkFields.length > 0 || m2mFields.length > 0;

	// Toggle M2M selection
	function toggleM2m(fieldKey, id) {
		const current = selectedM2ms[fieldKey] || [];
		if (current.includes(id)) {
			selectedM2ms[fieldKey] = current.filter(x => x !== id);
		} else {
			selectedM2ms[fieldKey] = [...current, id];
		}
		selectedM2ms = selectedM2ms;
	}

	// Get display label for an FK value
	function getFkDisplayLabel(field, value) {
		if (!value) return null;
		const cacheKey = getCacheKey(field);
		const rows = fkLookups[cacheKey] || [];
		const found = rows.find(r => r.id === value);
		return found ? (found[field.fkLabel] || found.id) : value;
	}

	// Get display labels for M2M values
	function getM2mDisplayLabels(field) {
		const ids = selectedM2ms[field.key] || [];
		if (ids.length === 0) return '';
		const cacheKey = getCacheKey(field);
		const rows = fkLookups[cacheKey] || [];
		return ids.map(id => {
			const found = rows.find(r => r.id === id);
			return found ? (found[field.fkLabel] || found.id) : id;
		}).join(', ');
	}

	async function handleFile(e) {
		csvFile = e.detail.file;
		const reader = new FileReader();
		reader.onload = () => {
			csvText = reader.result;
			parsePreview();
		};
		reader.readAsText(csvFile);
	}

	function parsePreview() {
		if (!csvText) return;

		const parsed = Papa.parse(csvText, {
			header: true,
			skipEmptyLines: 'greedy',
		});

		if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
			addToast("Gagal memparsing file CSV", "error");
			return;
		}

		if (parsed.data.length === 0) {
			addToast("File CSV kosong atau tidak valid", "error");
			return;
		}

		previewFields = parsed.meta.fields || [];
		
		previewData = parsed.data.slice(0, 10).map((row) => {
			const obj = { ...row };
			// Inject FK overrides
			Object.entries(selectedFks).forEach(([fkKey, fkValue]) => {
				if (fkValue) {
					obj[fkKey] = fkValue;
				}
			});
			return obj;
		});

		// Add FK override columns to preview
		Object.entries(selectedFks).forEach(([fkKey, fkValue]) => {
			if (fkValue && !previewFields.includes(fkKey)) {
				previewFields.push(fkKey);
			}
		});

		// Add M2M columns to preview
		Object.entries(selectedM2ms).forEach(([m2mKey, m2mValues]) => {
			if (m2mValues.length > 0 && !previewFields.includes(m2mKey)) {
				previewFields.push(m2mKey);
			}
		});

		// Inject M2M display values into preview rows
		const m2mDisplayMap = {};
		m2mFields.forEach(field => {
			const labels = getM2mDisplayLabels(field);
			if (labels) {
				m2mDisplayMap[field.key] = labels;
			}
		});
		previewData = previewData.map(row => {
			const obj = { ...row };
			Object.entries(m2mDisplayMap).forEach(([key, label]) => {
				obj[key] = label;
			});
			return obj;
		});

		previewFields = previewFields;
		step = 2;
	}

	async function doImport() {
		if (!selectedTable) {
			addToast("Pilih tabel tujuan", "error");
			return;
		}

		importing = true;
		importErrors = [];

		const parsed = Papa.parse(csvText, {
			header: true,
			skipEmptyLines: 'greedy',
		});

		const rows = parsed.data;
		let success = 0;
		let failed = 0;
		importProgress = { current: 0, total: rows.length };

		const tableConfig = ADMIN_TABLES[selectedTable];
		const allowedFields = tableConfig.fields.map(f => f.key);

		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			const obj = {};

			allowedFields.forEach(field => {
				if (row[field] !== undefined) {
					obj[field] = row[field];
				}
			});

			// Apply FK overrides
			Object.entries(selectedFks).forEach(([fkKey, fkValue]) => {
				if (fkValue) {
					obj[fkKey] = fkValue;
				}
			});

			// Apply M2M selections — send as arrays
			Object.entries(selectedM2ms).forEach(([m2mKey, m2mValues]) => {
				if (m2mValues.length > 0) {
					obj[m2mKey] = m2mValues;
				}
			});

			try {
				const res = await fetch(`/api/admin/${selectedTable}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(obj),
				});

				if (res.ok) {
					success++;
				} else {
					const err = await res.json();
					failed++;
					importErrors.push({
						row: i + 2,
						error: err.error || "Unknown error",
					});
				}
			} catch {
				failed++;
				importErrors.push({ row: i + 2, error: "Network error" });
			}

			importProgress = { current: i + 1, total: rows.length };
		}

		importing = false;
		step = 3;
		addToast(
			`Import selesai: ${success} berhasil, ${failed} gagal`,
			success > 0 ? "success" : "error",
		);
	}

	function reset() {
		csvFile = null;
		csvText = "";
		previewData = [];
		previewFields = [];
		importErrors = [];
		selectedFks = {};
		selectedM2ms = {};
		importProgress = { current: 0, total: 0 };
		step = 1;
	}
</script>

<svelte:head>
	<title>CSV Import — Admin — Oratio Clinic</title>
</svelte:head>

<div class="p-8 space-y-8 overflow-y-auto custom-scrollbar">
	<div class="flex items-end justify-between">
		<div>
			<h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
				📤 CSV Import
			</h1>
			<p class="text-slate-500 font-medium">Migrasi data massal ke dalam database sistem</p>
		</div>
		<a href="/admin" class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
			<span class="material-symbols-outlined text-[18px]">arrow_back</span>
			Dashboard
		</a>
	</div>

	{#if step === 1}
		<div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
			<h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6">1. Pilih Tabel & Upload File</h3>
			
			<div class="mb-8 max-w-lg">
				<label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tabel Tujuan</label>
				<select class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-slate-900 dark:text-white" bind:value={selectedTable}>
					<option value="">-- Pilih Tabel --</option>
					{#each Object.entries(ADMIN_TABLES) as [slug, config]}
						<option value={slug}>{config.label}</option>
					{/each}
				</select>
			</div>
			
			<!-- Relationship Selectors: FK + M2M -->
			{#if selectedTable && hasRelationships}
				<div class="mb-8 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-3xl transition-all duration-300">
					<h4 class="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
						<span class="material-symbols-outlined text-[18px] text-primary">link</span>
						Relasi Record (Optional)
					</h4>
					<p class="text-xs text-slate-500 dark:text-slate-400 mb-5 font-medium">
						Pilih record relasi jika data tersebut ingin diset sama untuk seluruh baris yang diimpor dari CSV. Jika dibiarkan kosong, sistem akan menggunakan nilai kolom dari file CSV.
					</p>

					<!-- FK fields (single-select dropdowns) -->
					{#if fkFields.length > 0}
						<div class="mb-5">
							<p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
								<span class="material-symbols-outlined text-[14px]">arrow_forward</span>
								Foreign Key (Pilih Satu)
							</p>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{#each fkFields as field}
									{@const cacheKey = getCacheKey(field)}
									<div class="flex flex-col gap-1.5">
										<label class="text-xs font-bold text-slate-600 dark:text-slate-400" for="fk-{field.key}">
											{field.label}
											{#if field.required}<span class="text-red-500">*</span>{/if}
										</label>
										<select
											id="fk-{field.key}"
											class="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white font-medium"
											bind:value={selectedFks[field.key]}
										>
											<option value="">-- Gunakan nilai dari CSV --</option>
											{#if fkLookups[cacheKey]}
												{#each fkLookups[cacheKey] as fkRow}
													<option value={fkRow.id}>
														{fkRow[field.fkLabel] || fkRow.id}
													</option>
												{/each}
											{:else}
												<option value="" disabled>Loading...</option>
											{/if}
										</select>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- M2M fields (multi-select chip pickers) -->
					{#if m2mFields.length > 0}
						<div>
							<p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
								<span class="material-symbols-outlined text-[14px]">hub</span>
								Many-to-Many (Pilih Beberapa)
							</p>
							{#each m2mFields as field}
								{@const cacheKey = getCacheKey(field)}
								{@const selectedIds = selectedM2ms[field.key] || []}
								<div class="mb-4">
									<label class="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
										{field.label}
										{#if selectedIds.length > 0}
											<span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary">
												{selectedIds.length} dipilih
											</span>
										{/if}
									</label>
									<div class="flex flex-wrap gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[56px] max-h-[200px] overflow-y-auto custom-scrollbar">
										{#if fkLookups[cacheKey]}
											{#if fkLookups[cacheKey].length === 0}
												<div class="w-full flex flex-col items-center justify-center text-slate-400 py-3">
													<span class="material-symbols-outlined text-3xl mb-1 opacity-20">group_off</span>
													<p class="text-xs font-medium">Tidak ada data ditemukan</p>
												</div>
											{:else}
												{#each fkLookups[cacheKey] as fkRow}
													{@const isSelected = selectedIds.includes(fkRow.id)}
													<button
														type="button"
														class="px-3 py-1.5 rounded-full text-xs font-bold transition-all border
															{isSelected
																? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
																: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary'}"
														on:click={() => toggleM2m(field.key, fkRow.id)}
													>
														<div class="flex items-center gap-1.5">
															{#if isSelected}
																<span class="material-symbols-outlined text-[14px]">check_circle</span>
															{:else}
																<span class="material-symbols-outlined text-[14px] opacity-40">radio_button_unchecked</span>
															{/if}
															{fkRow[field.fkLabel] || fkRow.id}
														</div>
													</button>
												{/each}
											{/if}
										{:else}
											<div class="w-full flex items-center justify-center py-3">
												<span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
											</div>
										{/if}
									</div>
									<p class="text-[10px] text-slate-400 mt-1.5 font-medium">
										Klik untuk memilih/membatalkan. Relasi M2M ini akan diterapkan ke semua baris yang diimpor.
									</p>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
			
			<div class="max-w-2xl">
				<label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">File CSV</label>
				<AdminFileUpload
					accept=".csv"
					label="Upload file CSV"
					on:file={handleFile}
				/>
			</div>
		</div>
	{:else if step === 2}
		<div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
			<div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
				<div>
					<h3 class="text-xl font-bold text-slate-900 dark:text-white">2. Preview Data</h3>
					<p class="text-slate-500 text-sm mt-1">Me-review {previewData.length} baris pertama dari data.</p>
				</div>
				<div class="flex items-center gap-3">
					<!-- Show relationship summary badges -->
					{#each fkFields as field}
						{#if selectedFks[field.key]}
							<div class="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
								<span class="material-symbols-outlined text-[14px]">arrow_forward</span>
								{field.label}: {getFkDisplayLabel(field, selectedFks[field.key])}
							</div>
						{/if}
					{/each}
					{#each m2mFields as field}
						{#if (selectedM2ms[field.key] || []).length > 0}
							<div class="px-3 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
								<span class="material-symbols-outlined text-[14px]">hub</span>
								{field.label}: {(selectedM2ms[field.key] || []).length} records
							</div>
						{/if}
					{/each}
					<div class="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-bold">
						{previewFields.length} Kolom
					</div>
				</div>
			</div>
			
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm whitespace-nowrap">
					<thead>
						<tr class="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
							<th class="px-6 py-3 font-black text-slate-400 text-center w-12">#</th>
							{#each previewFields as field}
								<th class="px-6 py-3 font-bold text-slate-700 dark:text-slate-300">{field}</th>
							{/each}
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
						{#each previewData as row, i}
							<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
								<td class="px-6 py-3 text-slate-400 font-medium text-center">{i + 1}</td>
								{#each previewFields as field}
									<td class="px-6 py-3 text-slate-600 dark:text-slate-400">{row[field] || "-"}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			
			<div class="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
				<button class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg font-bold text-sm" on:click={reset}>
					← Batal
				</button>
				<button
					class="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					on:click={doImport}
					disabled={importing || !selectedTable}
				>
					{#if importing}
						<span class="material-symbols-outlined animation-spin">progress_activity</span>
						Mengimpor... ({importProgress.current}/{importProgress.total})
					{:else}
						<span class="material-symbols-outlined">upload</span>
						Konfirmasi & Import ke {ADMIN_TABLES[selectedTable]?.label || selectedTable}
					{/if}
				</button>
			</div>
		</div>
	{:else}
		<div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center">
			
			{#if importErrors.length > 0}
				<div class="size-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
					<span class="material-symbols-outlined text-4xl">warning</span>
				</div>
				<h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">Import Selesai dengan Catatan</h3>
				<p class="text-slate-500 mb-8 max-w-lg mx-auto">Beberapa baris data gagal diimpor. Silahkan cek log error di bawah untuk detail lebih lanjut.</p>
				
				<div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-w-2xl mx-auto text-left">
					<table class="w-full text-sm">
						<thead>
							<tr class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
								<th class="px-6 py-3 font-bold text-slate-700 dark:text-slate-300 w-24">Baris CSV</th>
								<th class="px-6 py-3 font-bold text-slate-700 dark:text-slate-300">Pesan Error</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
							{#each importErrors as err}
								<tr class="bg-white dark:bg-slate-900">
									<td class="px-6 py-3 font-bold text-slate-500">{err.row}</td>
									<td class="px-6 py-3 text-red-600 font-medium">{err.error}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
					<span class="material-symbols-outlined text-4xl">check_circle</span>
				</div>
				<h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">Import Sukses</h3>
				<p class="text-slate-500 mb-8">Seluruh data yang diupload berhasil diproses ke dalam database.</p>
			{/if}
			
			<div class="mt-8 flex items-center justify-center gap-4">
				<a href="/admin" class="px-6 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors">
					Kembali ke Dashboard
				</a>
				<button class="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all" on:click={reset}>
					Import File Lain
				</button>
			</div>
		</div>
	{/if}
</div>
