<script>
	import { ADMIN_TABLES } from "$lib/utils/constants.js";
	import AdminFileUpload from "$lib/components/UI/AdminFileUpload.svelte";
	import { addToast } from "$lib/stores/toast.js";

	let selectedTable = "";
	let csvFile = null;
	let csvText = "";
	let previewData = [];
	let previewFields = [];
	let importing = false;
	let importErrors = [];
	let step = 1; // 1=select, 2=preview, 3=result

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
		const lines = csvText.split("\n").filter((l) => l.trim());
		if (lines.length < 2) {
			addToast("File CSV kosong atau tidak valid", "error");
			return;
		}

		previewFields = lines[0]
			.split(",")
			.map((f) => f.trim().replace(/"/g, ""));
		previewData = lines.slice(1, 11).map((line) => {
			const values = line
				.split(",")
				.map((v) => v.trim().replace(/"/g, ""));
			const obj = {};
			previewFields.forEach((f, i) => (obj[f] = values[i] || ""));
			return obj;
		});

		step = 2;
	}

	async function doImport() {
		if (!selectedTable) {
			addToast("Pilih tabel tujuan", "error");
			return;
		}

		importing = true;
		importErrors = [];

		const allLines = csvText.split("\n").filter((l) => l.trim());
		const fields = allLines[0]
			.split(",")
			.map((f) => f.trim().replace(/"/g, ""));
		const rows = allLines.slice(1);

		let success = 0;
		let failed = 0;

		for (let i = 0; i < rows.length; i++) {
			const values = rows[i]
				.split(",")
				.map((v) => v.trim().replace(/"/g, ""));
			const obj = {};
			fields.forEach((f, j) => {
				if (values[j]) obj[f] = values[j];
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
