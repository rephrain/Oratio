<script>
	import { page } from "$app/stores";
	import { onMount, onDestroy } from "svelte";
	import AdminDataTable from "$lib/components/Tables/AdminDataTable.svelte";
	import AdminModal from "$lib/components/UI/AdminModal.svelte";
	import FileUpload from "$lib/components/UI/FileUpload.svelte";
	import { ADMIN_TABLES } from "$lib/utils/constants.js";
	import { addToast } from "$lib/stores/toast.js";
	import Papa from "papaparse";

	// Child table relationships — parent slug → list of child descriptors
	const CHILD_TABLE_MAP = {
		'users': [
			{ childTable: 'doctor-shifts', fkKey: 'user_id', label: 'Shift Dokter' }
		],
		'patients': [
			{ childTable: 'patient-disease-history', fkKey: 'patient_id', label: 'Riwayat Penyakit' },
			{ childTable: 'patient-allergy',          fkKey: 'patient_id', label: 'Alergi' },
			{ childTable: 'patient-medication',       fkKey: 'patient_id', label: 'Pengobatan' }
		],
		'encounters': [
			{ childTable: 'status-history',           fkKey: 'encounter_id', label: 'Status History' },
			{ childTable: 'encounter-prescriptions',  fkKey: 'encounter_id', label: 'Resep' },
			{ childTable: 'encounter-items',          fkKey: 'encounter_id', label: 'Item Tagihan' },
			{ childTable: 'encounter-referrals',      fkKey: 'encounter_id', label: 'Rujukan' }
		]
	};

	$: childDefs = CHILD_TABLE_MAP[tableName] || [];

	$: tableName = $page.params.table;
	$: tableConfig = ADMIN_TABLES[tableName];
	$: formFields = tableConfig?.fields || [];

	let data = [];
	let total = 0;
	let currentPage = 1;
	let searchTerm = "";
	let loading = true;
	let columns = [];

	// Modal
	let showModal = false;
	let modalMode = "create"; // 'create' | 'edit'
	let editRecord = {};
	let saving = false;
	let uploadingField = null;

	// FK lookup data cache
	let fkLookups = {};
	let fkLoading = {};

	// Child table state
	let activeTab = 'main';
	let childRecords = {};         // { childTableSlug: [rows] }
	let childOriginalRecords = {}; // snapshot for diffing on save

	// Delete confirmation
	let showDeleteConfirm = false;
	let showDeleteAllConfirm = false;
	let deleteId = null;
	let deletingAll = false;
	let exporting = false;

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
			if (field.type === 'm2m') {
				record[field.key] = [];
			} else if (field.defaultValue !== undefined) {
				record[field.key] = field.defaultValue;
			}
		}
		return record;
	}

	// Load FK lookup data for a given fkTable with optional filters
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

	// Load all FK lookups needed for this table
	async function loadAllFkLookups() {
		const lookups = formFields
			.filter((f) => f.type === "fk" || f.type === "m2m")
			.map((f) => ({ table: f.fkTable, filter: f.fkFilter }));

		await Promise.all(lookups.map((l) => loadFkLookup(l.table, l.filter)));
	}

	async function loadData(isBg = false) {
		if (!isBg) loading = true;
		try {
			await loadAllFkLookups();
			const params = new URLSearchParams({
				page: String(currentPage),
				limit: "20",
			});
			if (searchTerm.trim()) {
				params.set("q", searchTerm.trim());
			}

			const res = await fetch(
				`/api/admin/${tableName}?${params.toString()}`,
			);
			const resp = await res.json();
			data = resp.data || [];
			total = resp.total || 0;

			// Build columns from field definitions
			if (formFields.length > 0) {
				columns = formFields
					.filter((f) => !f.createOnly && f.type !== "password" && f.type !== "textarea" && f.type !== "m2m")
					.map((f) => ({
						key: f.key,
						label: f.label,
						sortable: true,
						format: (val) => {
							if (val === null || val === undefined) return "-";
							if (typeof val === "boolean") return val ? "✅" : "❌";
							
							// Format datetime
							if (f.type === "datetime" && typeof val === "string") {
								try {
									return new Date(val).toLocaleString("id-ID");
								} catch {
									return val;
								}
							}
							// Format foreign key
							if (f.type === "fk") {
								const lookup = fkLookups[getCacheKey(f)] || [];
								const found = lookup.find((l) => l.id === val);
								return found ? (found[f.fkLabel] || String(val)) : String(val);
							}
							return String(val);
						},
					}));

				// Add M2M columns with custom formatters to show labels in the table
				const m2mFields = formFields.filter(f => f.type === 'm2m');
				for (const f of m2mFields) {
					columns.push({
						key: f.key,
						label: f.label,
						sortable: false,
						format: (val) => {
							if (!val || !Array.isArray(val)) return '-';
							const lookup = fkLookups[getCacheKey(f)] || [];
							const labels = val.map(id => {
								const found = lookup.find(l => l.id === id);
								return found ? found[f.fkLabel] : id;
							});
							return labels.join(', ');
						}
					});
				}
				columns = columns; // for reactivity
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

	function handleSearch(event) {
		searchTerm = event.detail.term || "";
		currentPage = 1;
		loadData();
	}

	function openCreate() {
		editRecord = initDefaults();
		modalMode = "create";
		activeTab = 'main';
		childRecords = {};
		childOriginalRecords = {};
		showModal = true;
		loadAllFkLookups();
		loadAllChildFkLookups();
	}

	function openEdit(row) {
		editRecord = { ...row };
		// Clear sensitive fields
		formFields.forEach(f => {
			if (f.type === 'password') editRecord[f.key] = '';
		});
		modalMode = "edit";
		activeTab = 'main';
		childRecords = {};
		childOriginalRecords = {};
		showModal = true;
		loadAllFkLookups();
		loadAllChildFkLookups();
		loadChildRecords(row.id);
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

	async function handleImageUpload(fieldKey, event) {
		const file = event.detail.file;
		if (!file) return;

		uploadingField = fieldKey;
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("document_type", "profile_image");

			const res = await fetch("/api/documents", {
				method: "POST",
				body: formData,
			});

			if (res.ok) {
				const result = await res.json();
				editRecord[fieldKey] = `/api/documents/${result.id}`;
				addToast("Gambar berhasil diunggah", "success");
			} else {
				const err = await res.json();
				addToast(err.error || "Gagal mengunggah gambar", "error");
			}
		} catch (err) {
			console.error("Upload error:", err);
			addToast("Terjadi kesalahan saat mengunggah", "error");
		} finally {
			uploadingField = null;
		}
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
					activeTab = 'main';
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
				const saved = await res.json();
				const parentId = saved?.record?.id ?? editRecord.id;
				if (parentId && childDefs.length > 0) {
					await syncChildRecords(parentId);
				}
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
		} catch (e) {
			console.error(e);
			addToast("Terjadi kesalahan", "error");
		} finally {
			saving = false;
		}
	}

	// ── Child table helpers ──────────────────────────────────────────────────

	// Pre-load all FK lookups referenced by any child table of this parent
	async function loadAllChildFkLookups() {
		for (const def of CHILD_TABLE_MAP[tableName] || []) {
			const fields = ADMIN_TABLES[def.childTable]?.fields || [];
			for (const f of fields) {
				if (f.type === 'fk') await loadFkLookup(f.fkTable, f.fkFilter);
			}
		}
	}

	// Fetch existing child rows for every child table of the given parent ID
	async function loadChildRecords(parentId) {
		for (const def of CHILD_TABLE_MAP[tableName] || []) {
			try {
				const res = await fetch(`/api/admin/${def.childTable}?${def.fkKey}=${encodeURIComponent(parentId)}&limit=200`);
				const resp = await res.json();
				const rows = resp.data || [];
				childRecords[def.childTable] = rows.map(r => ({ ...r }));
				childOriginalRecords[def.childTable] = rows.map(r => ({ ...r }));
			} catch (err) {
				console.error(`Failed to load child records for ${def.childTable}:`, err);
				childRecords[def.childTable] = [];
				childOriginalRecords[def.childTable] = [];
			}
		}
		childRecords = childRecords;
	}

	// Diff and sync child records against the API after parent is saved
	async function syncChildRecords(parentId) {
		for (const def of CHILD_TABLE_MAP[tableName] || []) {
			const current  = childRecords[def.childTable]         || [];
			const original = childOriginalRecords[def.childTable] || [];

			// Delete rows removed by user
			const toDelete = original.filter(o => o.id && !current.find(c => c.id === o.id));
			for (const row of toDelete) {
				await fetch(`/api/admin/${def.childTable}?id=${row.id}`, { method: 'DELETE' });
			}

			// Create / update remaining rows
			for (const row of current) {
				const isExisting = row.id && original.find(o => o.id === row.id);
				const childFields = ADMIN_TABLES[def.childTable]?.fields || [];
				const payload = {};
				for (const f of childFields) {
					if (f.readOnly || f.autoGenerate) continue;
					if (f.key === def.fkKey) { payload[f.key] = parentId; continue; }
					const v = row[f.key];
					if (v !== undefined && v !== '') {
						if (f.type === 'number') payload[f.key] = Number(v);
						else if (f.type === 'boolean') payload[f.key] = v === true || v === 'true';
						else payload[f.key] = v;
					} else if (v === '' && !f.required) {
						payload[f.key] = null;
					}
				}
				payload[def.fkKey] = parentId;
				if (isExisting) payload.id = row.id;

				await fetch(`/api/admin/${def.childTable}`, {
					method: isExisting ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				});
			}
		}
	}

	// Return child table fields that are editable in the inline editor
	function getChildModalFields(childTableSlug, fkKey) {
		return (ADMIN_TABLES[childTableSlug]?.fields || []).filter(f =>
			f.key !== fkKey &&
			!f.readOnly &&
			!f.autoGenerate &&
			f.key !== 'id' &&
			f.key !== 'created_at' &&
			f.key !== 'updated_at'
		);
	}

	function addChildRow(childTableSlug) {
		const fields = ADMIN_TABLES[childTableSlug]?.fields || [];
		const defaults = {};
		for (const f of fields) {
			if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue;
		}
		childRecords[childTableSlug] = [...(childRecords[childTableSlug] || []), defaults];
		childRecords = childRecords;
	}

	function deleteChildRow(childTableSlug, idx) {
		const arr = [...(childRecords[childTableSlug] || [])];
		arr.splice(idx, 1);
		childRecords[childTableSlug] = arr;
		childRecords = childRecords;
	}

	function handleChildSelectChange(childTableSlug, rowIdx, field, event) {
		const rawVal = event.target.value;
		const arr = [...(childRecords[childTableSlug] || [])];
		if (field.options?.length > 0) {
			const firstOpt = field.options[0];
			if (typeof firstOpt === 'object' && typeof firstOpt.value === 'number') {
				arr[rowIdx] = { ...arr[rowIdx], [field.key]: rawVal === '' ? null : parseInt(rawVal, 10) };
				childRecords[childTableSlug] = arr;
				childRecords = childRecords;
				return;
			}
		}
		arr[rowIdx] = { ...arr[rowIdx], [field.key]: rawVal === '' ? null : rawVal };
		childRecords[childTableSlug] = arr;
		childRecords = childRecords;
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

	async function handleDeleteAll() {
		deletingAll = true;
		try {
			const res = await fetch(`/api/admin/${tableName}?all=true`, {
				method: "DELETE",
			});
			if (res.ok) {
				addToast(`Semua data ${tableConfig?.label || tableName} berhasil dihapus`, "success");
				showDeleteAllConfirm = false;
				loadData();
			} else {
				const err = await res.json();
				addToast(err.error || "Gagal menghapus semua data", "error");
			}
		} catch {
			addToast("Terjadi kesalahan", "error");
		} finally {
			deletingAll = false;
		}
	}

	async function exportToExcel() {
		if (exporting) return;
		exporting = true;
		try {
			// 1. Fetch all data
			const res = await fetch(`/api/admin/${tableName}?all=true`);
			if (!res.ok) throw new Error("Gagal mengambil data untuk export");
			const resp = await res.json();
			const allData = resp.data || [];

			if (allData.length === 0) {
				addToast("Tidak ada data untuk diexport", "info");
				return;
			}

			// 2. Map data to export format using column definitions
			const exportRows = allData.map(row => {
				const mapped = {};
				for (const col of columns) {
					// Use the existing column formatters (which handle dates, booleans, and FKs)
					let val = row[col.key];
					if (col.format) {
						val = col.format(val);
					}
					mapped[col.label] = val;
				}
				return mapped;
			});

			// 3. Generate CSV
			const csv = Papa.unparse(exportRows);
			
			// 4. Download file with Excel BOM for UTF-8 compatibility
			const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
			const link = document.createElement("a");
			const url = URL.createObjectURL(blob);
			const timestamp = new Date().toISOString().split('T')[0];
			
			link.setAttribute("href", url);
			link.setAttribute("download", `${tableName}-export-${timestamp}.csv`);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			
			addToast("Export berhasil diunduh", "success");
		} catch (err) {
			console.error(err);
			addToast("Gagal melakukan export", "error");
		} finally {
			exporting = false;
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
		searchTerm = "";
		fkLookups = {};
		loadData();
	}

	onMount(() => {
		refreshInterval = setInterval(() => {
			if (!showModal && !showDeleteConfirm && !showDeleteAllConfirm) {
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
			{#if total > 0}
				<button 
					class="px-4 py-2 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
					on:click={() => showDeleteAllConfirm = true}
				>
					<span class="material-symbols-outlined text-[18px]">delete_sweep</span>
					Hapus Semua
				</button>
			{/if}
			<button 
				class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" 
				on:click={exportToExcel}
				disabled={exporting || total === 0}
			>
				{#if exporting}
					<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
				{:else}
					<span class="material-symbols-outlined text-[18px]">download</span>
				{/if}
				Export
			</button>
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
		on:search={handleSearch}
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
	title="{modalMode === 'create' ? 'Tambah' : 'Edit'} {tableConfig?.label || ''}"
	size="lg"
>
	<!-- Tab navigation (shown only for tables that have child relations) -->
	{#if childDefs.length > 0}
		<div class="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-px">
			<button
				class="px-4 py-2 text-sm font-bold rounded-t-lg whitespace-nowrap transition-colors
					{activeTab === 'main'
						? 'bg-primary text-white shadow-sm'
						: 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}"
				on:click={() => (activeTab = 'main')}
			>
				<span class="material-symbols-outlined text-[15px] align-middle mr-1">edit_note</span>
				Detail Utama
			</button>
			{#each childDefs as def}
				<button
					class="px-4 py-2 text-sm font-bold rounded-t-lg whitespace-nowrap transition-colors flex items-center gap-1.5
						{activeTab === def.childTable
							? 'bg-primary text-white shadow-sm'
							: 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}
						{modalMode === 'create' ? 'opacity-50 cursor-not-allowed' : ''}"
					on:click={() => { if (modalMode !== 'create') activeTab = def.childTable; }}
					disabled={modalMode === 'create'}
					title={modalMode === 'create' ? 'Simpan record induk terlebih dahulu' : ''}
				>
					<span class="material-symbols-outlined text-[15px]">table_rows</span>
					{def.label}
					{#if (childRecords[def.childTable] || []).length > 0}
						<span class="text-[10px] font-black px-1.5 py-0.5 rounded-full
							{activeTab === def.childTable ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}">
							{childRecords[def.childTable].length}
						</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	<!-- ── MAIN TAB: parent record fields ─────────────────────────────── -->
	{#if activeTab === 'main'}
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
			{#each getModalFields(modalMode) as field (field.key)}
				{@const isDisabled =
					field.readOnly ||
					(field.editReadOnly && modalMode === "edit")}
				<div class="flex flex-col gap-1.5 {field.type === 'textarea' ? 'sm:col-span-2' : ''}">
					<label class="text-sm font-bold text-slate-700 dark:text-slate-300" for="inp-{field.key}">
						{field.label}
						{#if field.required && !isDisabled}<span class="text-red-500">*</span>{/if}
					</label>

					{#if isDisabled}
						<input id="inp-{field.key}" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 cursor-not-allowed w-full" value={editRecord[field.key] ?? ""} disabled />
					{:else if field.type === "select"}
						<select id="inp-{field.key}" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white" value={editRecord[field.key] ?? ""} on:change={(e) => handleSelectChange(field, e)}>
							<option value="">-- Pilih --</option>
							{#each field.options || [] as opt}<option value={getOptionValue(opt)}>{getOptionLabel(opt)}</option>{/each}
						</select>
					{:else if field.type === "boolean"}
						<div class="py-2 flex items-center pr-4">
							<label class="relative inline-flex items-center cursor-pointer">
								<input type="checkbox" id="inp-{field.key}" bind:checked={editRecord[field.key]} class="sr-only peer" />
								<div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/10 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
								<span class="ml-3 text-sm font-medium text-slate-600 dark:text-slate-400">{editRecord[field.key] ? "Ya" : "Tidak"}</span>
							</label>
						</div>
					{:else if field.type === "textarea"}
						<textarea id="inp-{field.key}" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white resize-none" rows="3" bind:value={editRecord[field.key]} placeholder={field.placeholder || ""}></textarea>
					{:else if field.type === "password"}
						<div class="space-y-1.5">
							<input id="inp-{field.key}" type="password" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white" bind:value={editRecord[field.key]} placeholder={field.placeholder || "Enter password"} />
							{#if modalMode === 'edit'}
								<p class="text-[10px] text-slate-500 ml-1">Kosongkan jika tidak ingin mengubah password.</p>
							{/if}
						</div>
					{:else if field.type === "date"}
						<input id="inp-{field.key}" type="date" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white" bind:value={editRecord[field.key]} />
					{:else if field.type === "time"}
						<input id="inp-{field.key}" type="time" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white" bind:value={editRecord[field.key]} />
					{:else if field.type === "datetime"}
						<input id="inp-{field.key}" type="datetime-local" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white" bind:value={editRecord[field.key]} />
					{:else if field.type === "number"}
						<input id="inp-{field.key}" type="number" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white" bind:value={editRecord[field.key]} step="any" />
					{:else if field.type === "email"}
						<input id="inp-{field.key}" type="email" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white" bind:value={editRecord[field.key]} placeholder={field.placeholder || "email@example.com"} />
					{:else if field.type === "fk"}
						<select id="inp-{field.key}" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white" value={editRecord[field.key] ?? ""} on:change={(e) => { editRecord[field.key] = e.target.value === '' ? null : e.target.value; }}>
							<option value="">-- Pilih --</option>
							{#if fkLookups[getCacheKey(field)]}
								{#each fkLookups[getCacheKey(field)] as fkRow}<option value={fkRow.id}>{fkRow[field.fkLabel] || fkRow.id}</option>{/each}
							{:else}<option value="" disabled>Loading...</option>{/if}
						</select>
					{:else if field.type === "m2m"}
						<div class="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[100px]">
							{#if fkLookups[getCacheKey(field)]}
								{#each fkLookups[getCacheKey(field)] as fkRow}
									{@const isSelected = (editRecord[field.key] || []).includes(fkRow.id)}
									<button type="button" class="px-3 py-1.5 rounded-full text-xs font-bold transition-all border {isSelected ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50'}" on:click={() => { const cur = editRecord[field.key] || []; editRecord[field.key] = isSelected ? cur.filter(id => id !== fkRow.id) : [...cur, fkRow.id]; }}>
										<div class="flex items-center gap-1.5">{#if isSelected}<span class="material-symbols-outlined text-[14px]">check_circle</span>{/if}{fkRow[field.fkLabel] || fkRow.id}</div>
									</button>
								{/each}
								{#if fkLookups[getCacheKey(field)].length === 0}<div class="w-full flex flex-col items-center justify-center text-slate-400 py-4"><span class="material-symbols-outlined text-4xl mb-2 opacity-20">group_off</span><p class="text-xs font-medium">No results found.</p></div>{/if}
							{:else}<div class="w-full flex items-center justify-center py-4"><span class="material-symbols-outlined animate-spin text-primary">progress_activity</span></div>{/if}
						</div>
					{:else if field.type === "image"}
						<div class="space-y-3">
							{#if editRecord[field.key]}
								<div class="relative w-32 h-32 rounded-xl border border-slate-200 overflow-hidden group bg-slate-50">
									<img src={editRecord[field.key]} alt="Preview" class="w-full h-full object-cover" />
									<button type="button" class="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1" on:click={() => (editRecord[field.key] = null)}>
										<span class="material-symbols-outlined">delete</span><span class="text-[10px] font-bold uppercase">Hapus</span>
									</button>
								</div>
							{:else if uploadingField === field.key}
								<div class="w-full h-32 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-2">
									<span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
									<span class="text-xs font-bold text-primary uppercase">Mengunggah...</span>
								</div>
							{:else}
								<FileUpload label="Pilih Foto Profil" accept="image/*" on:file={(e) => handleImageUpload(field.key, e)} />
							{/if}
							<p class="text-[10px] text-slate-400 font-medium">Format: JPG, PNG. Max 5MB.</p>
						</div>
					{:else}
						<input id="inp-{field.key}" type="text" class="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-lg text-sm transition-all focus:outline-none w-full text-slate-900 dark:text-white" bind:value={editRecord[field.key]} maxlength={field.maxLength || undefined} placeholder={field.placeholder || ""} />
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- ── CHILD TABLE TABS ────────────────────────────────────────────── -->
	{#each childDefs as def}
		{#if activeTab === def.childTable}
			{@const childFields = getChildModalFields(def.childTable, def.fkKey)}
			{@const rows = childRecords[def.childTable] || []}
			<div class="space-y-4">
				<!-- Header row -->
				<div class="flex items-center justify-between">
					<p class="text-sm font-bold text-slate-700 dark:text-slate-300">
						{rows.length} record{rows.length !== 1 ? 's' : ''}
					</p>
					<button
						type="button"
						class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
						on:click={() => addChildRow(def.childTable)}
					>
						<span class="material-symbols-outlined text-[15px]">add</span>
						Tambah Baris
					</button>
				</div>

				{#if rows.length === 0}
					<div class="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
						<span class="material-symbols-outlined text-4xl mb-2 opacity-30">table_rows</span>
						<p class="text-sm font-bold">Belum ada data {def.label}</p>
						<p class="text-xs mt-1">Klik "Tambah Baris" untuk menambahkan record baru</p>
					</div>
				{:else}
					<!-- Scrollable table of child rows -->
					<div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
						<table class="w-full text-sm">
							<thead>
								<tr class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
									{#each childFields as cf}
										<th class="px-4 py-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
											{cf.label}{#if cf.required}<span class="text-red-500 ml-0.5">*</span>{/if}
										</th>
									{/each}
									<th class="px-4 py-3 w-12"></th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
								{#each rows as row, rowIdx}
									<tr class="bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
										{#each childFields as cf}
											<td class="px-3 py-2">
												{#if cf.type === 'select'}
													<select
														class="w-full min-w-[120px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"
														value={row[cf.key] ?? ''}
														on:change={(e) => handleChildSelectChange(def.childTable, rowIdx, cf, e)}
													>
														<option value="">-- Pilih --</option>
														{#each cf.options || [] as opt}
															<option value={getOptionValue(opt)}>{getOptionLabel(opt)}</option>
														{/each}
													</select>
												{:else if cf.type === 'fk'}
													<select
														class="w-full min-w-[160px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"
														value={row[cf.key] ?? ''}
														on:change={(e) => {
															const arr = [...(childRecords[def.childTable] || [])];
															arr[rowIdx] = { ...arr[rowIdx], [cf.key]: e.target.value || null };
															childRecords[def.childTable] = arr;
															childRecords = childRecords;
														}}
													>
														<option value="">-- Pilih --</option>
														{#if fkLookups[getCacheKey(cf)]}
															{#each fkLookups[getCacheKey(cf)] as fkRow}
																<option value={fkRow.id}>{fkRow[cf.fkLabel] || fkRow.id}</option>
															{/each}
														{:else}
															<option disabled>Loading…</option>
														{/if}
													</select>
												{:else if cf.type === 'boolean'}
													<label class="flex items-center gap-2 cursor-pointer">
														<input
															type="checkbox"
															checked={row[cf.key] === true || row[cf.key] === 'true'}
															on:change={(e) => {
																const arr = [...(childRecords[def.childTable] || [])];
																arr[rowIdx] = { ...arr[rowIdx], [cf.key]: e.target.checked };
																childRecords[def.childTable] = arr;
																childRecords = childRecords;
															}}
															class="w-4 h-4 accent-primary"
														/>
														<span class="text-xs text-slate-600 dark:text-slate-400">{row[cf.key] ? 'Ya' : 'Tidak'}</span>
													</label>
												{:else if cf.type === 'number'}
													<input
														type="number"
														class="w-full min-w-[100px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"
														value={row[cf.key] ?? ''}
														step="any"
														on:input={(e) => {
															const arr = [...(childRecords[def.childTable] || [])];
															arr[rowIdx] = { ...arr[rowIdx], [cf.key]: e.target.value };
															childRecords[def.childTable] = arr;
															childRecords = childRecords;
														}}
													/>
												{:else if cf.type === 'date'}
													<input
														type="date"
														class="w-full min-w-[140px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"
														value={row[cf.key] ?? ''}
														on:change={(e) => {
															const arr = [...(childRecords[def.childTable] || [])];
															arr[rowIdx] = { ...arr[rowIdx], [cf.key]: e.target.value };
															childRecords[def.childTable] = arr;
															childRecords = childRecords;
														}}
													/>
												{:else if cf.type === 'time'}
													<input
														type="time"
														class="w-full min-w-[120px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"
														value={row[cf.key] ?? ''}
														on:change={(e) => {
															const arr = [...(childRecords[def.childTable] || [])];
															arr[rowIdx] = { ...arr[rowIdx], [cf.key]: e.target.value };
															childRecords[def.childTable] = arr;
															childRecords = childRecords;
														}}
													/>
												{:else if cf.type === 'datetime'}
													<input
														type="datetime-local"
														class="w-full min-w-[180px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"
														value={row[cf.key] ?? ''}
														on:change={(e) => {
															const arr = [...(childRecords[def.childTable] || [])];
															arr[rowIdx] = { ...arr[rowIdx], [cf.key]: e.target.value };
															childRecords[def.childTable] = arr;
															childRecords = childRecords;
														}}
													/>
												{:else}
													<input
														type="text"
														class="w-full min-w-[120px] px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none"
														value={row[cf.key] ?? ''}
														maxlength={cf.maxLength || undefined}
														on:input={(e) => {
															const arr = [...(childRecords[def.childTable] || [])];
															arr[rowIdx] = { ...arr[rowIdx], [cf.key]: e.target.value };
															childRecords[def.childTable] = arr;
															childRecords = childRecords;
														}}
													/>
												{/if}
											</td>
										{/each}
										<!-- Delete row button -->
										<td class="px-3 py-2 text-center">
											<button
												type="button"
												class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
												on:click={() => deleteChildRow(def.childTable, rowIdx)}
											>
												<span class="material-symbols-outlined text-[18px]">delete</span>
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}
	{/each}

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

<!-- Delete All Confirmation -->
<AdminModal bind:show={showDeleteAllConfirm} title="Konfirmasi Hapus Semua">
	<div class="flex items-start gap-4">
		<div class="size-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
			<span class="material-symbols-outlined text-red-600 dark:text-red-400">delete_sweep</span>
		</div>
		<div>
			<h4 class="text-lg font-bold text-slate-900 dark:text-white mb-1">Hapus Semua Data?</h4>
			<p class="text-slate-500 dark:text-slate-400 text-sm">
				Anda akan menghapus **seluruh** data pada tabel <span class="font-bold text-slate-900 dark:text-white">{tableConfig?.label || tableName}</span> ({total} record).
				Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
			</p>
		</div>
	</div>
	
	<div slot="footer">
		<button class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-bold text-sm transition-colors" on:click={() => (showDeleteAllConfirm = false)}>
			Batal
		</button>
		<button class="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50" on:click={handleDeleteAll} disabled={deletingAll}>
			{#if deletingAll}
				<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
				Menghapus...
			{:else}
				<span class="material-symbols-outlined text-[18px]">delete_forever</span>
				Ya, Hapus Semua
			{/if}
		</button>
	</div>
</AdminModal>

<!-- Delete Confirmation -->
<AdminModal bind:show={showDeleteConfirm} title="Konfirmasi Hapus">
	<div class="flex items-start gap-4">
		<div class="size-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
			<span class="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
		</div>
		<div>
			<h4 class="text-lg font-bold text-slate-900 dark:text-white mb-1">Hapus Data?</h4>
			<p class="text-slate-500 dark:text-slate-400 text-sm">
				Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat
				dibatalkan dan semua data yang terhubung dapat ikut terhapus atau kehilangan relasi.
			</p>
		</div>
	</div>
	
	<div slot="footer">
		<button class="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-bold text-sm transition-colors" on:click={() => (showDeleteConfirm = false)}>
			Batal
		</button>
		<button class="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-red-600/30 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2" on:click={handleDelete}>
			<span class="material-symbols-outlined text-[18px]">delete</span>
			Ya, Hapus
		</button>
	</div>
</AdminModal>
