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
	on:dragover|preventDefault={() => (dragging = true)}
	on:dragleave={() => (dragging = false)}
	on:drop|preventDefault={handleDrop}
	on:click={() => fileInput.click()}
	role="button"
	tabindex="0"
	on:keydown={(e) => e.key === 'Enter' && fileInput.click()}
>
	<input
		bind:this={fileInput}
		type="file"
		{accept}
		on:change={handleSelect}
		style="display: none;"
	/>
	<div class="upload-icon">
		<span class="material-symbols-outlined">cloud_upload</span>
	</div>
	<div class="upload-text">
		<p class="font-bold text-slate-700">{label}</p>
		<p class="text-[11px] text-slate-400 uppercase tracking-widest font-black mt-1">
			Drag & drop or click to browse
		</p>
	</div>
</div>

<style>
	.file-upload {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		border: 2px dashed #e2e8f0;
		border-radius: 1rem;
		background: #f8fafc;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		gap: 1rem;
		text-align: center;
	}

	.file-upload:hover {
		border-color: var(--primary);
		background: var(--primary-light);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
		transform: translateY(-2px);
	}

	.file-upload.dragging {
		border-color: var(--primary);
		background: var(--primary-light);
		transform: scale(1.02);
	}

	.upload-icon {
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: white;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #94a3b8;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}

	.file-upload:hover .upload-icon {
		color: var(--primary);
		transform: scale(1.1) rotate(5deg);
	}

	.upload-icon span {
		font-size: 1.5rem;
	}

	.upload-text p {
		margin: 0;
	}
</style>
