<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import DataTable from "$lib/components/Tables/DataTable.svelte";
	import Modal from "$lib/components/UI/Modal.svelte";
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

	async function loadData() {
		loading = true;
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
			loading = false;
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

	$: if (tableName) {
		currentPage = 1;
		fkLookups = {};
		loadData();
	}
</script>

<svelte:head>
	<title>{tableConfig?.label || tableName} — Admin — Oratio Clinic</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="page-title" style="margin: 0;">
				{tableConfig?.label || tableName}
			</h1>
			<p class="text-sm text-muted">{total} total records</p>
		</div>
		<div class="flex gap-3">
			<a href="/admin" class="btn btn-secondary">← Dashboard</a>
			<button class="btn btn-primary" on:click={openCreate}
				>+ Tambah</button
			>
		</div>
	</div>

	<DataTable
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
			<td>
				<div class="flex gap-1">
					<button
						class="btn btn-ghost btn-sm"
						on:click|stopPropagation={() => openEdit(row)}
						>✏️</button
					>
					<button
						class="btn btn-ghost btn-sm"
						on:click|stopPropagation={() => confirmDelete(row.id)}
						>🗑️</button
					>
				</div>
			</td>
		</tr>
	</DataTable>
</div>

<!-- Create/Edit Modal -->
<Modal
	bind:show={showModal}
	title="{modalMode === 'create' ? 'Tambah' : 'Edit'} {tableConfig?.label ||
		''}"
	size="lg"
>
	<div class="admin-form">
		{#each getModalFields(modalMode) as field (field.key)}
			{@const isDisabled =
				field.readOnly ||
				(field.editReadOnly && modalMode === "edit")}
			<div
				class="form-group"
				class:form-group-full={field.type === "textarea"}
			>
				<label class="form-label" for="inp-{field.key}">
					{field.label}
					{#if field.required && !isDisabled}
						<span class="required-mark">*</span>
					{/if}
				</label>

				{#if isDisabled}
					<!-- Read-only fields -->
					<input
						id="inp-{field.key}"
						class="form-input"
						value={editRecord[field.key] ?? ""}
						disabled
					/>
				{:else if field.type === "select"}
					<!-- Select / Enum fields -->
					<select
						id="inp-{field.key}"
						class="form-select"
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
					<div class="toggle-container">
						<label class="toggle-label">
							<input
								type="checkbox"
								id="inp-{field.key}"
								bind:checked={editRecord[field.key]}
								class="toggle-checkbox"
							/>
							<span class="toggle-switch"></span>
							<span class="toggle-text">
								{editRecord[field.key] ? "Ya" : "Tidak"}
							</span>
						</label>
					</div>
				{:else if field.type === "textarea"}
					<!-- Textarea -->
					<textarea
						id="inp-{field.key}"
						class="form-input"
						rows="3"
						bind:value={editRecord[field.key]}
						placeholder={field.placeholder || ""}
					></textarea>
				{:else if field.type === "password"}
					<!-- Password -->
					<input
						id="inp-{field.key}"
						type="password"
						class="form-input"
						bind:value={editRecord[field.key]}
						placeholder="Enter password"
					/>
				{:else if field.type === "date"}
					<!-- Date picker -->
					<input
						id="inp-{field.key}"
						type="date"
						class="form-input"
						bind:value={editRecord[field.key]}
					/>
				{:else if field.type === "time"}
					<!-- Time picker -->
					<input
						id="inp-{field.key}"
						type="time"
						class="form-input"
						bind:value={editRecord[field.key]}
					/>
				{:else if field.type === "datetime"}
					<!-- Datetime picker -->
					<input
						id="inp-{field.key}"
						type="datetime-local"
						class="form-input"
						bind:value={editRecord[field.key]}
					/>
				{:else if field.type === "number"}
					<!-- Number input -->
					<input
						id="inp-{field.key}"
						type="number"
						class="form-input"
						bind:value={editRecord[field.key]}
						step="any"
					/>
				{:else if field.type === "email"}
					<!-- Email input -->
					<input
						id="inp-{field.key}"
						type="email"
						class="form-input"
						bind:value={editRecord[field.key]}
						placeholder={field.placeholder || "email@example.com"}
					/>
				{:else if field.type === "fk"}
					<!-- Foreign key lookup select -->
					<select
						id="inp-{field.key}"
						class="form-select"
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
						class="form-input"
						bind:value={editRecord[field.key]}
						maxlength={field.maxLength || undefined}
						placeholder={field.placeholder || ""}
					/>
				{/if}
			</div>
		{/each}
	</div>

	<div slot="footer">
		<button class="btn btn-secondary" on:click={() => (showModal = false)}
			>Batal</button
		>
		<button class="btn btn-primary" on:click={handleSave} disabled={saving}>
			{#if saving}<span class="spinner"></span>{/if}
			{modalMode === "create" ? "Tambah" : "Simpan"}
		</button>
	</div>
</Modal>

<!-- Delete Confirmation -->
<Modal bind:show={showDeleteConfirm} title="Konfirmasi Hapus">
	<p>
		Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat
		dibatalkan.
	</p>
	<div slot="footer">
		<button
			class="btn btn-secondary"
			on:click={() => (showDeleteConfirm = false)}>Batal</button
		>
		<button class="btn btn-danger" on:click={handleDelete}
			>🗑️ Hapus</button
		>
	</div>
</Modal>

<style>
	.admin-form {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	.admin-form .form-group-full {
		grid-column: 1 / -1;
	}
	.required-mark {
		color: var(--danger, #e53e3e);
		font-weight: 700;
	}
	.toggle-container {
		padding: var(--space-2) 0;
	}
	.toggle-label {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		cursor: pointer;
		user-select: none;
	}
	.toggle-checkbox {
		display: none;
	}
	.toggle-switch {
		position: relative;
		width: 44px;
		height: 24px;
		background: var(--border-color, #cbd5e0);
		border-radius: 12px;
		transition: background var(--transition-fast, 0.2s);
		flex-shrink: 0;
	}
	.toggle-switch::after {
		content: "";
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		background: white;
		border-radius: 50%;
		transition: transform var(--transition-fast, 0.2s);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
	}
	.toggle-checkbox:checked + .toggle-switch {
		background: var(--primary, #4299e1);
	}
	.toggle-checkbox:checked + .toggle-switch::after {
		transform: translateX(20px);
	}
	.toggle-text {
		font-size: var(--text-sm, 0.875rem);
		color: var(--text-secondary, #718096);
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.admin-form {
			grid-template-columns: 1fr;
		}
	}
</style>
