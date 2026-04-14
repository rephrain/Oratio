<script>
	import { page } from "$app/stores";
	import { onMount, onDestroy } from "svelte";
	import AdminDataTable from "$lib/components/Tables/AdminDataTable.svelte";
	import AdminModal from "$lib/components/UI/AdminModal.svelte";
	import { ADMIN_TABLES } from "$lib/utils/constants.js";
	import { addToast } from "$lib/stores/toast.js";

	$: tableName = $page.params.table;
	$: tableConfig = ADMIN_TABLES[tableName];
	$: formFields = tableConfig?.fields || [];

	let data = [];
	let total = 0;
	let currentPage = 1;
	let loading = true;
	let columns = [];

	// Modal
	let showModal = false;
	let modalMode = "create"; // 'create' | 'edit'
	let editRecord = {};
	let saving = false;

	// FK lookup data cache
	let fkLookups = {};
	let fkLoading = {};

	// Delete confirmation
	let showDeleteConfirm = false;
	let deleteId = null;

	// Get fields visible in modal
	function getModalFields(mode) {
		return formFields.filter((f) => {
			if (f.readOnly && mode === "create") return false;
			if (f.createOnly && mode === "edit") return false;
			return true;
		});
	}

	// Initialize default values for create mode
	function initDefaults() {
		const record = {};
		for (const field of formFields) {
			if (field.defaultValue !== undefined) {
				record[field.key] = field.defaultValue;
			}
		}
		return record;
	}

	// Load FK lookup data for a given fkTable
	async function loadFkLookup(fkTable) {
		if (fkLookups[fkTable] || fkLoading[fkTable]) return;
		fkLoading[fkTable] = true;
		try {
			const res = await fetch(`/api/admin/${fkTable}?limit=500`);
			const resp = await res.json();
			fkLookups[fkTable] = resp.data || [];
			fkLookups = fkLookups; // trigger reactivity
		} catch (err) {
			console.error(`Failed to load FK data for ${fkTable}:`, err);
			fkLookups[fkTable] = [];
		} finally {
			fkLoading[fkTable] = false;
		}
	}

	// Load all FK lookups needed for this table
	async function loadAllFkLookups() {
		const fkTables = [
			...new Set(
				formFields.filter((f) => f.type === "fk").map((f) => f.fkTable),
			),
		];
		await Promise.all(fkTables.map((t) => loadFkLookup(t)));
	}

	async function loadData(isBg = false) {
		if (!isBg) loading = true;
		try {
			const res = await fetch(
				`/api/admin/${tableName}?page=${currentPage}&limit=20`,
			);
			const resp = await res.json();
			data = resp.data || [];
			total = resp.total || 0;

			// Build columns from field definitions
			if (formFields.length > 0) {
				columns = formFields
					.filter(
						(f) =>
							!f.createOnly &&
							f.type !== "password" &&
							f.type !== "textarea",
					)
					.map((f) => ({
						key: f.key,
						label: f.label,
						sortable: true,
						format: (val) => {
							if (val === null || val === undefined) return "-";
							if (typeof val === "boolean")
								return val ? "✅" : "❌";
							if (typeof val === "string" && val.length > 50)
								return val.substring(0, 50) + "...";
							// Format datetime
							if (
								f.type === "datetime" &&
								typeof val === "string"
							) {
								try {
									return new Date(val).toLocaleString(
										"id-ID",
									);
								} catch {
									return val;
								}
							}
							return String(val);
						},
					}));
			} else if (data.length > 0) {
				// Fallback: auto-detect columns like before
				columns = Object.keys(data[0])
					.filter((k) => !["password_hash"].includes(k))
					.map((k) => ({
						key: k,
						label: k
							.replace(/_/g, " ")
							.replace(/\b\w/g, (l) => l.toUpperCase()),
						sortable: true,
						format: (val) => {
							if (val === null || val === undefined) return "-";
							if (typeof val === "boolean")
								return val ? "✅" : "❌";
							if (typeof val === "string" && val.length > 50)
								return val.substring(0, 50) + "...";
							return String(val);
						},
					}));
			}
		} catch (err) {
			console.error(err);
			addToast("Gagal memuat data", "error");
		} finally {
			if (!isBg) loading = false;
		}
	}

	function openCreate() {
		editRecord = initDefaults();
		modalMode = "create";
		showModal = true;
		loadAllFkLookups();
	}

	function openEdit(row) {
		editRecord = { ...row };
		modalMode = "edit";
		showModal = true;
		loadAllFkLookups();
	}

	// Clean payload: remove readOnly fields and empty strings
	function buildPayload(mode) {
		const payload = {};
		const visibleFields = getModalFields(mode);
		for (const field of visibleFields) {
			if (field.readOnly) {
				// For edit mode, include the ID
				if (field.key === "id" && mode === "edit") {
					payload.id = editRecord.id;
				}
				continue;
			}
			if (field.editReadOnly && mode === "edit") {
				continue; // skip fields that are read-only in edit mode (like patient id)
			}
			const val = editRecord[field.key];
			// Include the value (even if empty string for optional fields)
			if (val !== undefined && val !== "") {
				// Type coercion
				if (field.type === "number" && val !== null) {
					payload[field.key] = Number(val);
				} else if (field.type === "boolean") {
					payload[field.key] =
						val === true || val === "true" ? true : false;
				} else {
					payload[field.key] = val;
				}
			} else if (val === "" && !field.required) {
				payload[field.key] = null; // Convert empty strings to null for optional fields
			}
		}
		// For edit mode, always include id
		if (mode === "edit" && editRecord.id) {
			payload.id = editRecord.id;
		}
		return payload;
	}

	async function handleSave() {
		// Validate required fields
		const visibleFields = getModalFields(modalMode);
		for (const field of visibleFields) {
			if (
				field.required &&
				!field.readOnly &&
				!(field.editReadOnly && modalMode === "edit")
			) {
				const val = editRecord[field.key];
				if (val === undefined || val === null || val === "") {
					addToast(`${field.label} wajib diisi`, "error");
					return;
				}
			}
		}

		saving = true;
		try {
			const method = modalMode === "create" ? "POST" : "PUT";
			const payload = buildPayload(modalMode);
			const res = await fetch(`/api/admin/${tableName}`, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				addToast(
					modalMode === "create"
						? "Data berhasil ditambahkan"
						: "Data berhasil diubah",
					"success",
				);
				showModal = false;
				loadData();
			} else {
				const err = await res.json();
				addToast(err.error || "Gagal menyimpan", "error");
			}
		} catch {
			addToast("Terjadi kesalahan", "error");
		} finally {
			saving = false;
		}
	}

	function confirmDelete(id) {
		deleteId = id;
		showDeleteConfirm = true;
	}

	async function handleDelete() {
		try {
			const res = await fetch(`/api/admin/${tableName}?id=${deleteId}`, {
				method: "DELETE",
			});
			if (res.ok) {
				addToast("Data berhasil dihapus", "success");
				showDeleteConfirm = false;
				loadData();
			} else {
				const err = await res.json();
				addToast(err.error || "Gagal menghapus", "error");
			}
		} catch {
			addToast("Terjadi kesalahan", "error");
		}
	}

	// Get option label/value for select fields
	function getOptionValue(opt) {
		if (typeof opt === "object" && opt !== null) return opt.value;
		return opt;
	}
	function getOptionLabel(opt) {
		if (typeof opt === "object" && opt !== null) return opt.label;
		return opt;
	}

	function handleSelectChange(field, event) {
		const rawVal = event.target.value;
		// Handle numeric values (like day_of_week)
		if (field.options?.length > 0) {
			const firstOpt = field.options[0];
			if (
				typeof firstOpt === "object" &&
				typeof firstOpt.value === "number"
			) {
				editRecord[field.key] =
					rawVal === "" ? null : parseInt(rawVal, 10);
				return;
			}
		}
		editRecord[field.key] = rawVal === "" ? null : rawVal;
	}

	let refreshInterval;

	$: if (tableName) {
		currentPage = 1;
		fkLookups = {};
		loadData();
	}

	onMount(() => {
		refreshInterval = setInterval(() => {
			if (!showModal && !showDeleteConfirm) {
				loadData(true);
			}
		}, 30000);
	});

	onDestroy(() => {
		if (refreshInterval) clearInterval(refreshInterval);
	});
</script>

<svelte:head>
	<title>{tableConfig?.label || tableName} — Admin — Oratio Clinic</title>
</svelte:head>

<div class="p-8 space-y-8 overflow-y-auto custom-scrollbar">
	<div class="flex items-end justify-between">
		<div>
			<h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
				{tableConfig?.label || tableName}
			</h1>
			<p class="text-slate-500 font-medium">{total} total records in database</p>
		</div>
		<div class="flex gap-3">
			<a href="/admin" class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
				<span class="material-symbols-outlined text-[18px]">arrow_back</span>
				Dashboard
			</a>
			<button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all" on:click={openCreate}>
				<span class="material-symbols-outlined text-[18px]">add</span>
				Tambah
			</button>
		</div>
	</div>

	<AdminDataTable
		{data}
		{columns}
		{total}
		page={currentPage}
		limit={20}
		{loading}
		on:page={(e) => {
			currentPage = e.detail.page;
			loadData();
		}}
		on:search={(e) => loadData()}
		on:rowclick={(e) => openEdit(e.detail.row)}
	>
		<tr slot="row-extra" let:row>
			<td class="px-6 py-4">
				<div class="flex items-center gap-2 justify-end">
					<button
						class="p-2 text-slate-400 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors flex items-center focus:outline-none"
						on:click|stopPropagation={() => openEdit(row)}
						title="Edit"
					>
						<span class="material-symbols-outlined text-[20px]">edit</span>
					</button>
					<button
						class="p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors flex items-center focus:outline-none"
						on:click|stopPropagation={() => confirmDelete(row.id)}
						title="Hapus"
					>
						<span class="material-symbols-outlined text-[20px]">delete</span>
					</button>
				</div>
			</td>
		</tr>
	</AdminDataTable>
</div>

<!-- Create/Edit Modal -->
<AdminModal
	bind:show={showModal}
	title="{modalMode === 'create' ? 'Tambah' : 'Edit'} {tableConfig?.label ||
		''}"
	size="lg"
>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
		{#each getModalFields(modalMode) as field (field.key)}
			{@const isDisabled =
				field.readOnly ||
				(field.editReadOnly && modalMode === "edit")}
			<div class="flex flex-col gap-1.5 {field.type === 'textarea' ? 'sm:col-span-2' : ''}">
				<label class="text-sm font-bold text-slate-700 dark:text-slate-300" for="inp-{field.key}">
					{field.label}
					{#if field.required && !isDisabled}
						<span class="text-red-500">*</span>
					{/if}
				</label>

				{#if isDisabled}
					<!-- Read-only fields -->
					<input
						id="inp-{field.key}"
						class="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 cursor-not-allowed w-full"
						value={editRecord[field.key] ?? ""}
						disabled
					/>
				{:else if field.type === "select"}
					<!-- Select / Enum fields -->
					<select
						id="inp-{field.key}"
						class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"
						value={editRecord[field.key] ?? ""}
						on:change={(e) => handleSelectChange(field, e)}
					>
						<option value="">-- Pilih --</option>
						{#each field.options || [] as opt}
							<option value={getOptionValue(opt)}
								>{getOptionLabel(opt)}</option
							>
						{/each}
					</select>
				{:else if field.type === "boolean"}
					<!-- Boolean toggle -->
					<div class="py-2 flex items-center pr-4">
						<label class="relative inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								id="inp-{field.key}"
								bind:checked={editRecord[field.key]}
								class="sr-only peer"
							/>
							<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/10 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
							<span class="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400">
								{editRecord[field.key] ? "Ya" : "Tidak"}
							</span>
						</label>
					</div>
				{:else if field.type === "textarea"}
					<!-- Textarea -->
					<textarea
						id="inp-{field.key}"
						class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white resize-none"
						rows="3"
						bind:value={editRecord[field.key]}
						placeholder={field.placeholder || ""}
					></textarea>
				{:else if field.type === "password"}
					<!-- Password -->
					<input
						id="inp-{field.key}"
						type="password"
						class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"
						bind:value={editRecord[field.key]}
						placeholder="Enter password"
					/>
				{:else if field.type === "date"}
					<!-- Date picker -->
					<input
						id="inp-{field.key}"
						type="date"
						class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"
						bind:value={editRecord[field.key]}
					/>
				{:else if field.type === "time"}
					<!-- Time picker -->
					<input
						id="inp-{field.key}"
						type="time"
						class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"
						bind:value={editRecord[field.key]}
					/>
				{:else if field.type === "datetime"}
					<!-- Datetime picker -->
					<input
						id="inp-{field.key}"
						type="datetime-local"
						class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"
						bind:value={editRecord[field.key]}
					/>
				{:else if field.type === "number"}
					<!-- Number input -->
					<input
						id="inp-{field.key}"
						type="number"
						class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"
						bind:value={editRecord[field.key]}
						step="any"
					/>
				{:else if field.type === "email"}
					<!-- Email input -->
					<input
						id="inp-{field.key}"
						type="email"
						class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"
						bind:value={editRecord[field.key]}
						placeholder={field.placeholder || "email@example.com"}
					/>
				{:else if field.type === "fk"}
					<!-- Foreign key lookup select -->
					<select
						id="inp-{field.key}"
						class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"
						value={editRecord[field.key] ?? ""}
						on:change={(e) => {
							editRecord[field.key] =
								e.target.value === "" ? null : e.target.value;
						}}
					>
						<option value="">-- Pilih --</option>
						{#if fkLookups[field.fkTable]}
							{#each fkLookups[field.fkTable] as fkRow}
								<option value={fkRow.id}>
									{fkRow[field.fkLabel] || fkRow.id}
								</option>
							{/each}
						{:else}
							<option value="" disabled>Loading...</option>
						{/if}
					</select>
				{:else}
					<!-- Default text input -->
					<input
						id="inp-{field.key}"
						type="text"
						class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white"
						bind:value={editRecord[field.key]}
						maxlength={field.maxLength || undefined}
						placeholder={field.placeholder || ""}
					/>
				{/if}
			</div>
		{/each}
	</div>

	<div slot="footer">
		<button class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-bold text-sm transition-colors" on:click={() => (showModal = false)}>
			Batal
		</button>
		<button class="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" on:click={handleSave} disabled={saving}>
			{#if saving}
				<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
			{/if}
			{modalMode === "create" ? "Tambah" : "Simpan"}
		</button>
	</div>
</AdminModal>

<!-- Delete Confirmation -->
<AdminModal bind:show={showDeleteConfirm} title="Konfirmasi Hapus">
	<div class="flex items-start gap-4">
		<div class="size-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
			<span class="material-symbols-outlined text-red-600">warning</span>
		</div>
		<div>
			<h4 class="text-lg font-bold text-slate-900 mb-1">Hapus Data?</h4>
			<p class="text-slate-500 text-sm">
				Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat
				dibatalkan dan semua data yang terhubung dapat ikut terhapus atau kehilangan relasi.
			</p>
		</div>
	</div>
	
	<div slot="footer">
		<button class="px-4 py-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-bold text-sm transition-colors" on:click={() => (showDeleteConfirm = false)}>
			Batal
		</button>
		<button class="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2" on:click={handleDelete}>
			<span class="material-symbols-outlined text-[18px]">delete</span>
			Ya, Hapus
		</button>
	</div>
</AdminModal>
