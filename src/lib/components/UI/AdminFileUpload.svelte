<script>
	import { createEventDispatcher } from 'svelte';
	export let accept = '';
	export let label = 'Upload file';
	export let maxSize = 5 * 1024 * 1024; // 5MB

	const dispatch = createEventDispatcher();
	let dragging = false;
	let fileInput;

	function handleDrop(e) {
		dragging = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) processFile(file);
	}

	function handleSelect(e) {
		const file = e.target?.files?.[0];
		if (file) processFile(file);
	}

	function processFile(file) {
		if (file.size > maxSize) {
			dispatch('error', { message: `File terlalu besar (max ${Math.round(maxSize / 1024 / 1024)}MB)` });
			return;
		}
		dispatch('file', { file });
	}
</script>

<div
	class="w-full flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all cursor-pointer {dragging ? 'border-primary bg-primary/5 text-primary' : 'border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900'}"
	on:dragover|preventDefault={() => dragging = true}
	on:dragleave={() => dragging = false}
	on:drop|preventDefault={handleDrop}
	on:click={() => fileInput.click()}
>
	<input
		bind:this={fileInput}
		type="file"
		{accept}
		on:change={handleSelect}
		class="hidden"
	/>
	<div class="size-16 rounded-full flex items-center justify-center mb-4 transition-colors {dragging ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}">
		<span class="material-symbols-outlined text-3xl">cloud_upload</span>
	</div>
	<p class="font-bold text-slate-900 dark:text-white mb-1 transition-colors {dragging ? 'text-primary' : ''}">{label}</p>
	<p class="text-sm font-medium text-slate-500 dark:text-slate-400">Drag & drop atau klik untuk memuat</p>
</div>
