<script>
	import { createEventDispatcher } from 'svelte';

	export let data = [];
	export let columns = []; // { key, label, sortable?, format? }
	export let loading = false;
	export let page = 1;
	export let total = 0;
	export let limit = 20;
	export let searchable = true;
	export let searchPlaceholder = 'Cari...';

	const dispatch = createEventDispatcher();
	let searchTerm = '';
	let sortKey = '';
	let sortDir = 'asc';

	$: totalPages = Math.ceil(total / limit) || 1;

	function handleSearch() {
		dispatch('search', { term: searchTerm });
	}

	function handleSort(key) {
		if (sortKey === key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDir = 'asc';
		}
		dispatch('sort', { key: sortKey, dir: sortDir });
	}

	function handlePage(p) {
		page = p;
		dispatch('page', { page: p });
	}

	function handleRowClick(row) {
		dispatch('rowclick', { row });
	}

	function getCellValue(row, col) {
		const val = row[col.key];
		if (col.format) return col.format(val, row);
		if (val === null || val === undefined) return '-';
		return val;
	}
</script>

<div class="card" style="padding: 0;">
	{#if searchable}
		<div style="padding: var(--space-4); border-bottom: 1px solid var(--border-color);">
			<div class="search-wrapper">
				<span class="search-icon">🔍</span>
				<input
					type="text"
					class="form-input search-input"
					placeholder={searchPlaceholder}
					bind:value={searchTerm}
					on:input={handleSearch}
				/>
			</div>
		</div>
	{/if}

	<div class="table-container" style="border: none; border-radius: 0;">
		{#if loading}
			<div style="padding: var(--space-8); text-align: center;">
				<div class="spinner spinner-lg" style="margin: 0 auto;"></div>
				<p class="text-sm text-muted mt-4">Memuat data...</p>
			</div>
		{:else if data.length === 0}
			<div class="empty-state">
				<div class="empty-state-icon">📭</div>
				<div class="empty-state-title">Tidak ada data</div>
				<p class="text-sm text-muted">Data yang Anda cari tidak ditemukan</p>
			</div>
		{:else}
			<table>
				<thead>
					<tr>
						{#each columns as col}
							<th
								class:sortable={col.sortable}
								on:click={() => col.sortable && handleSort(col.key)}
							>
								{col.label}
								{#if sortKey === col.key}
									<span>{sortDir === 'asc' ? '↑' : '↓'}</span>
								{/if}
							</th>
						{/each}
						<slot name="header-extra" />
					</tr>
				</thead>
				<tbody>
					{#each data as row, i}
						<tr on:click={() => handleRowClick(row)} style="cursor: pointer;">
							{#each columns as col}
								<td>{getCellValue(row, col)}</td>
							{/each}
							<slot name="row-extra" {row} {i} />
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	{#if total > limit}
		<div class="pagination" style="padding: var(--space-4); border-top: 1px solid var(--border-color);">
			<button class="pagination-btn" disabled={page <= 1} on:click={() => handlePage(page - 1)}>←</button>
			{#each Array(Math.min(totalPages, 7)) as _, i}
			<button class="pagination-btn" class:active={page === i + 1} on:click={() => handlePage(i + 1)}>{i + 1}</button>
		{/each}
			{#if totalPages > 7}
				<span class="text-muted">…</span>
				<button class="pagination-btn" class:active={page === totalPages} on:click={() => handlePage(totalPages)}>{totalPages}</button>
			{/if}
			<button class="pagination-btn" disabled={page >= totalPages} on:click={() => handlePage(page + 1)}>→</button>
		</div>
	{/if}
</div>

<style>
	th.sortable { cursor: pointer; user-select: none; }
	th.sortable:hover { color: var(--primary); }
</style>
