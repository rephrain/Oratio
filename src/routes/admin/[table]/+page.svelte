<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import DataTable from '$lib/components/Tables/DataTable.svelte';
	import Modal from '$lib/components/UI/Modal.svelte';
	import { ADMIN_TABLES } from '$lib/utils/constants.js';
	import { addToast } from '$lib/stores/toast.js';

	$: tableName = $page.params.table;
	$: tableConfig = ADMIN_TABLES[tableName];

	let data = [];
	let total = 0;
	let currentPage = 1;
	let loading = true;
	let columns = [];

	// Modal
	let showModal = false;
	let modalMode = 'create'; // 'create' | 'edit'
	let editRecord = {};
	let saving = false;

	// Delete confirmation
	let showDeleteConfirm = false;
	let deleteId = null;

	async function loadData() {
		loading = true;
		try {
			const res = await fetch(`/api/admin/${tableName}?page=${currentPage}&limit=20`);
			const resp = await res.json();
			data = resp.data || [];
			total = resp.total || 0;

			// Auto-detect columns from first record
			if (data.length > 0) {
				columns = Object.keys(data[0])
					.filter(k => !['password_hash'].includes(k))
					.map(k => ({
						key: k,
						label: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
						sortable: true,
						format: (val) => {
							if (val === null || val === undefined) return '-';
							if (typeof val === 'boolean') return val ? '✅' : '❌';
							if (typeof val === 'string' && val.length > 50) return val.substring(0, 50) + '...';
							return String(val);
						}
					}));
			}
		} catch (err) {
			console.error(err);
			addToast('Gagal memuat data', 'error');
		} finally {
			loading = false;
		}
	}

	function openCreate() {
		editRecord = {};
		modalMode = 'create';
		showModal = true;
	}

	function openEdit(row) {
		editRecord = { ...row };
		modalMode = 'edit';
		showModal = true;
	}

	async function handleSave() {
		saving = true;
		try {
			const method = modalMode === 'create' ? 'POST' : 'PUT';
			const res = await fetch(`/api/admin/${tableName}`, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editRecord)
			});

			if (res.ok) {
				addToast(modalMode === 'create' ? 'Data berhasil ditambahkan' : 'Data berhasil diubah', 'success');
				showModal = false;
				loadData();
			} else {
				const err = await res.json();
				addToast(err.error || 'Gagal menyimpan', 'error');
			}
		} catch {
			addToast('Terjadi kesalahan', 'error');
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
			const res = await fetch(`/api/admin/${tableName}?id=${deleteId}`, { method: 'DELETE' });
			if (res.ok) {
				addToast('Data berhasil dihapus', 'success');
				showDeleteConfirm = false;
				loadData();
			} else {
				const err = await res.json();
				addToast(err.error || 'Gagal menghapus', 'error');
			}
		} catch {
			addToast('Terjadi kesalahan', 'error');
		}
	}

	$: if (tableName) {
		currentPage = 1;
		loadData();
	}
</script>

<svelte:head>
	<title>{tableConfig?.label || tableName} — Admin — Oratio Dental</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="page-title" style="margin: 0;">{tableConfig?.label || tableName}</h1>
			<p class="text-sm text-muted">{total} total records</p>
		</div>
		<div class="flex gap-3">
			<a href="/admin" class="btn btn-secondary">← Dashboard</a>
			<button class="btn btn-primary" on:click={openCreate}>+ Tambah</button>
		</div>
	</div>

	<DataTable
		{data}
		{columns}
		{total}
		page={currentPage}
		limit={20}
		{loading}
		on:page={(e) => { currentPage = e.detail.page; loadData(); }}
		on:search={(e) => loadData()}
		on:rowclick={(e) => openEdit(e.detail.row)}
	>
		<tr slot="row-extra" let:row>
			<td>
				<div class="flex gap-1">
					<button class="btn btn-ghost btn-sm" on:click|stopPropagation={() => openEdit(row)}>✏️</button>
					<button class="btn btn-ghost btn-sm" on:click|stopPropagation={() => confirmDelete(row.id)}>🗑️</button>
				</div>
			</td>
		</tr>
	</DataTable>
</div>

<!-- Create/Edit Modal -->
<Modal bind:show={showModal} title="{modalMode === 'create' ? 'Tambah' : 'Edit'} {tableConfig?.label || ''}" size="lg">
	<div style="display: flex; flex-direction: column; gap: var(--space-4);">
		{#each columns as col}
			{#if col.key !== 'id' || modalMode === 'edit'}
				<div class="form-group">
					<label class="form-label">{col.label}</label>
					{#if col.key === 'id'}
						<input class="form-input" value={editRecord[col.key] || ''} disabled />
					{:else if col.key === 'password'}
						<input type="password" class="form-input" bind:value={editRecord[col.key]} placeholder="Enter password" />
					{:else if typeof editRecord[col.key] === 'boolean'}
						<select class="form-select" bind:value={editRecord[col.key]}>
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
					{:else}
						<input class="form-input" bind:value={editRecord[col.key]} />
					{/if}
				</div>
			{/if}
		{/each}

		{#if tableName === 'users' && modalMode === 'create'}
			<div class="form-group">
				<label class="form-label">Password</label>
				<input type="password" class="form-input" bind:value={editRecord.password} placeholder="Set password" />
			</div>
		{/if}
	</div>

	<div slot="footer">
		<button class="btn btn-secondary" on:click={() => showModal = false}>Batal</button>
		<button class="btn btn-primary" on:click={handleSave} disabled={saving}>
			{#if saving}<span class="spinner"></span>{/if}
			{modalMode === 'create' ? 'Tambah' : 'Simpan'}
		</button>
	</div>
</Modal>

<!-- Delete Confirmation -->
<Modal bind:show={showDeleteConfirm} title="Konfirmasi Hapus">
	<p>Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
	<div slot="footer">
		<button class="btn btn-secondary" on:click={() => showDeleteConfirm = false}>Batal</button>
		<button class="btn btn-danger" on:click={handleDelete}>🗑️ Hapus</button>
	</div>
</Modal>
