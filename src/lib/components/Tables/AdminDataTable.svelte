<script>
	import { createEventDispatcher } from 'svelte';

	export let data = [];
	export let columns = []; // { key, label, sortable?, format? }
	export let loading = false;
	export let page = 1;
	export let total = 0;
	export let limit = 20;
	export let searchable = true;
	export let searchPlaceholder = 'Search...';

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

<div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
	{#if searchable}
		<div class="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
			<div class="relative max-w-md">
				<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
				<input
					type="text"
					class="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary/50 dark:focus:border-primary/50 rounded-lg text-sm transition-all focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-500 shadow-sm"
					placeholder={searchPlaceholder}
					bind:value={searchTerm}
					on:input={handleSearch}
				/>
			</div>
		</div>
	{/if}

	<div class="overflow-x-auto w-full">
		{#if loading}
			<div class="p-8 text-center flex flex-col items-center justify-center">
				<span class="material-symbols-outlined animate-spin text-primary text-4xl mb-4">progress_activity</span>
				<p class="text-sm font-medium text-slate-500 dark:text-slate-400">Loading data...</p>
			</div>
		{:else if data.length === 0}
			<div class="p-12 pl-12 text-center flex flex-col items-center justify-center border-t border-slate-200 dark:border-slate-800">
				<div class="size-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4 text-2xl">
					<span class="material-symbols-outlined text-3xl">inbox</span>
				</div>
				<h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No Records Found</h3>
				<p class="text-sm text-slate-500 dark:text-slate-400">There are no entries to display right now.</p>
			</div>
		{:else}
			<table class="w-full text-left text-sm border-collapse whitespace-nowrap min-w-max">
				<thead>
					<tr class="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
						{#each columns as col}
							<th
								class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 {col.sortable ? 'cursor-pointer hover:text-primary transition-colors group select-none' : ''}"
								on:click={() => col.sortable && handleSort(col.key)}
							>
								<div class="flex items-center gap-2">
									{col.label}
									{#if col.sortable}
										<div class="flex flex-col opacity-30 group-hover:opacity-100 transition-opacity {sortKey === col.key ? '!opacity-100' : ''}">
											<span class="material-symbols-outlined text-[12px] leading-none {sortKey === col.key && sortDir === 'asc' ? 'text-primary font-black' : ''}">arrow_drop_up</span>
											<span class="material-symbols-outlined text-[12px] leading-none -mt-1 {sortKey === col.key && sortDir === 'desc' ? 'text-primary font-black' : ''}">arrow_drop_down</span>
										</div>
									{/if}
								</div>
							</th>
						{/each}
						<slot name="header-extra" />
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
					{#each data as row, i}
						<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group" on:click={() => handleRowClick(row)}>
							{#each columns as col}
								<td class="px-6 py-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
									{getCellValue(row, col)}
								</td>
							{/each}
							<slot name="row-extra" {row} {i} />
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	{#if total > limit}
		<div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
			<div class="text-sm font-medium text-slate-500 dark:text-slate-400">
				Showing <span class="font-bold text-slate-900 dark:text-white">{(page - 1) * limit + 1}</span> to <span class="font-bold text-slate-900 dark:text-white">{Math.min(page * limit, total)}</span> of <span class="font-bold text-slate-900 dark:text-white">{total}</span>
			</div>
			<div class="flex gap-1">
				<button 
					class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center justify-center" 
					disabled={page <= 1} 
					on:click={() => handlePage(page - 1)}
				>
					<span class="material-symbols-outlined text-[18px]">chevron_left</span>
				</button>
				
				{#each Array(Math.min(totalPages, 5)) as _, i}
					{@const displayPage = page > 3 && totalPages > 5 ? 
						(page + i - 2 > totalPages - 5 ? totalPages - 4 + i : page + i - 2) : 
						i + 1}
					
					<button 
						class="px-3 min-w-[36px] py-1.5 rounded-lg border text-sm font-bold transition-all {page === displayPage ? 'border-primary bg-primary text-white shadow-md shadow-primary/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'}" 
						on:click={() => handlePage(displayPage)}
					>
						{displayPage}
					</button>
				{/each}
				
				{#if totalPages > 5 && page < totalPages - 2}
					<span class="px-2 py-1.5 text-slate-400">...</span>
					<button 
						class="px-3 min-w-[36px] py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 text-sm font-bold transition-all" 
						on:click={() => handlePage(totalPages)}
					>
						{totalPages}
					</button>
				{/if}

				<button 
					class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center justify-center" 
					disabled={page >= totalPages} 
					on:click={() => handlePage(page + 1)}
				>
					<span class="material-symbols-outlined text-[18px]">chevron_right</span>
				</button>
			</div>
		</div>
	{/if}
</div>
