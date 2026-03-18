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
	class="file-upload"
	class:dragging
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
		style="display: none;"
	/>
	<div class="empty-state-icon">📎</div>
	<p class="font-medium">{label}</p>
	<p class="text-sm text-muted">Drag & drop atau klik untuk memilih</p>
</div>
