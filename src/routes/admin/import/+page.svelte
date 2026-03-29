<script>
	import { ADMIN_TABLES } from "$lib/utils/constants.js";
	import FileUpload from "$lib/components/UI/FileUpload.svelte";
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

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="page-title" style="margin: 0;">📤 CSV Import</h1>
		<a href="/admin" class="btn btn-secondary">← Dashboard</a>
	</div>

	{#if step === 1}
		<div class="card mb-6">
			<h3 class="card-title mb-4">1. Pilih Tabel & Upload File</h3>
			<div class="form-group mb-4">
				<label class="form-label">Tabel Tujuan</label>
				<select class="form-select" bind:value={selectedTable}>
					<option value="">-- Pilih Tabel --</option>
					{#each Object.entries(ADMIN_TABLES) as [slug, config]}
						<option value={slug}>{config.label}</option>
					{/each}
				</select>
			</div>
			<FileUpload
				accept=".csv"
				label="Upload file CSV"
				on:file={handleFile}
			/>
		</div>
	{:else if step === 2}
		<div class="card mb-6">
			<h3 class="card-title mb-4">
				2. Preview Data ({previewData.length} rows shown)
			</h3>
			<div class="table-container">
				<table>
					<thead>
						<tr>
							{#each previewFields as field}
								<th>{field}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each previewData as row}
							<tr>
								{#each previewFields as field}
									<td>{row[field] || "-"}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="flex justify-between mt-6">
				<button class="btn btn-secondary" on:click={reset}
					>← Kembali</button
				>
				<button
					class="btn btn-primary btn-lg"
					on:click={doImport}
					disabled={importing || !selectedTable}
				>
					{#if importing}
						<span class="spinner"></span> Mengimpor...
					{:else}
						📥 Import ke {ADMIN_TABLES[selectedTable]?.label ||
							selectedTable}
					{/if}
				</button>
			</div>
		</div>
	{:else}
		<div class="card mb-6">
			<h3 class="card-title mb-4">3. Hasil Import</h3>
			{#if importErrors.length > 0}
				<div class="table-container mt-4">
					<table>
						<thead>
							<tr><th>Baris</th><th>Error</th></tr>
						</thead>
						<tbody>
							{#each importErrors as err}
								<tr
									><td>{err.row}</td><td
										class="text-sm"
										style="color: var(--danger);"
										>{err.error}</td
									></tr
								>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="text-sm" style="color: var(--success);">
					✅ Semua data berhasil diimpor!
				</p>
			{/if}
			<button class="btn btn-primary mt-6" on:click={reset}
				>Import File Lain</button
			>
		</div>
	{/if}
</div>
