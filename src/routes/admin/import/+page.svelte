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

	// FK lookups
	let fkLookups = {};
	let fkLoading = {};
	let selectedFks = {};

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

	$: if (selectedTable) {
		selectedFks = {};
		const fields = ADMIN_TABLES[selectedTable]?.fields || [];
		fields.forEach(field => {
			if (field.type === 'fk') {
				loadFkLookup(field.fkTable, field.fkFilter);
			}
		});
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
			Object.entries(selectedFks).forEach(([fkKey, fkValue]) => {
				if (fkValue) {
					obj[fkKey] = fkValue;
				}
			});
			return obj;
		});

		Object.entries(selectedFks).forEach(([fkKey, fkValue]) => {
			if (fkValue && !previewFields.includes(fkKey)) {
				previewFields.push(fkKey);
			}
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

			Object.entries(selectedFks).forEach(([fkKey, fkValue]) => {
				if (fkValue) {
					obj[fkKey] = fkValue;
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
			
			{#if selectedTable && ADMIN_TABLES[selectedTable]?.fields.some(f => f.type === 'fk')}
				<div class="mb-8 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl transition-all duration-300">
					<h4 class="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
						<span class="material-symbols-outlined text-[18px] text-primary">link</span>
						Relasi Record Induk (Optional)
					</h4>
					<p class="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
						Pilih record induk jika data tersebut ingin diset sama untuk seluruh baris yang diimpor dari CSV. Jika dibiarkan kosong, sistem akan menggunakan nilai kolom dari file CSV.
					</p>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{#each ADMIN_TABLES[selectedTable].fields.filter(f => f.type === 'fk') as field}
							{@const cacheKey = getCacheKey(field)}
							<div class="flex flex-col gap-1.5">
								<label class="text-xs font-bold text-slate-600 dark:text-slate-400" for="fk-{field.key}">
									{field.label}
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
				<div class="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-bold">
					{previewFields.length} Kolom Ditemukan
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
						Mengimpor...
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
