<script>
	import { createEventDispatcher } from 'svelte';

	export let value = null;
	export let options = []; // { value, label, sublabel? }
	export let placeholder = 'Ketik untuk mencari...';
	export let label = '';
	export let required = false;
	export let disabled = false;
	export let searchFn = null; // async function for remote search
	export let minChars = 2;
	export let inputClass = "form-input";
	export let wrapperClass = "form-group";

	const dispatch = createEventDispatcher();
	let searchTerm = '';
	let showDropdown = false;
	let loading = false;
	let filteredOptions = [];
	let inputEl;
	let debounceTimer;

	let prevValue = value;
	$: if (value !== prevValue) {
		if (!value) {
			searchTerm = '';
			filteredOptions = [];
		}
		prevValue = value;
	}

	$: displayValue = value ? (options.find(o => o.value === value)?.label || value) : '';

	async function handleInput() {
		if (searchTerm.length < minChars) {
			filteredOptions = [];
			showDropdown = false;
			return;
		}

		showDropdown = true;

		if (searchFn) {
			loading = true;
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(async () => {
				try {
					filteredOptions = await searchFn(searchTerm);
				} catch {
					filteredOptions = [];
				}
				loading = false;
			}, 300);
		} else {
			const term = searchTerm.toLowerCase();
			filteredOptions = options.filter(o =>
				o.label.toLowerCase().includes(term) ||
				(o.sublabel && o.sublabel.toLowerCase().includes(term))
			);
		}
	}

	function selectOption(option) {
		value = option.value;
		searchTerm = option.label;
		showDropdown = false;
		dispatch('select', option);
	}

	function handleFocus() {
		if (searchTerm.length >= minChars) {
			showDropdown = true;
		}
	}

	function handleBlur() {
		setTimeout(() => { showDropdown = false; }, 200);
	}

	function clear() {
		value = null;
		searchTerm = '';
		filteredOptions = [];
		dispatch('clear');
	}
</script>

<div class={wrapperClass}>
	{#if label}
		<label class="form-label">
			{label}
			{#if required}<span class="required">*</span>{/if}
		</label>
	{/if}

	<div class="search-wrapper">
		<input
			bind:this={inputEl}
			type="text"
			class={inputClass}
			{placeholder}
			{disabled}
			bind:value={searchTerm}
			on:input={handleInput}
			on:focus={handleFocus}
			on:blur={handleBlur}
		/>
		{#if value}
			<button
				class="btn btn-ghost btn-icon btn-sm"
				style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%);"
				on:click={clear}
			>✕</button>
		{/if}

		{#if showDropdown}
			<div class="search-results">
				{#if loading}
					<div style="padding: var(--space-4); text-align: center;">
						<div class="spinner" style="margin: 0 auto;"></div>
					</div>
				{:else if filteredOptions.length === 0}
					<div class="search-result-item" style="color: var(--text-secondary); cursor: default;">
						Tidak ditemukan
					</div>
				{:else}
					{#each filteredOptions as option}
						<div class="search-result-item" on:click={() => selectOption(option)}>
							<div class="font-medium">{option.label}</div>
							{#if option.sublabel}
								<div class="text-xs text-muted">{option.sublabel}</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>
