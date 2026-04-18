<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	export let value = null;
	export let options = []; // { value, label, sublabel?, meta: { profile_image_url, has_active_shift, is_doctor, icon, iconColor } }
	export let placeholder = 'Pilih...';
	export let label = '';
	export let required = false;
	export let disabled = false;
	export let loading = false;
	export let wrapperClass = "form-group";

	const dispatch = createEventDispatcher();
	let showDropdown = false;
	let wrapper;

	$: selectedOption = options.find(o => o.value === value) || null;

	function toggleDropdown() {
		if (disabled || loading) return;
		showDropdown = !showDropdown;
	}

	function selectOption(option) {
		value = option.value;
		showDropdown = false;
		dispatch('select', option);
	}

	function handleClickOutside(event) {
		if (wrapper && !wrapper.contains(event.target)) {
			showDropdown = false;
		}
	}

	onMount(() => {
		window.addEventListener('click', handleClickOutside);
		return () => window.removeEventListener('click', handleClickOutside);
	});
</script>

<div class={wrapperClass} bind:this={wrapper}>
	{#if label}
		<label class="form-label font-bold text-slate-700 text-xs mb-2 block uppercase tracking-wider">
			{label}
			{#if required}<span class="text-red-500 ml-1">*</span>{/if}
		</label>
	{/if}

	<div class="relative">
		<button
			type="button"
			class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border {showDropdown ? 'border-primary ring-4 ring-primary/10' : 'border-slate-200'} bg-white text-left transition-all hover:border-primary/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed h-[50px]"
			on:click={toggleDropdown}
			disabled={disabled || loading}
		>
			<div class="flex items-center gap-3 overflow-hidden">
				{#if loading}
					<div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
						<span class="material-symbols-outlined text-primary text-sm animate-spin" style="animation: spin 1s linear infinite;">refresh</span>
					</div>
				{:else if selectedOption?.meta?.profile_image_url || selectedOption?.meta?.is_doctor || selectedOption?.meta?.icon}
					<div class="relative shrink-0">
						{#if selectedOption?.meta?.profile_image_url}
							<img src={selectedOption.meta.profile_image_url} alt={selectedOption.label} class="w-8 h-8 rounded-full object-cover border border-slate-100" />
						{:else if selectedOption?.meta?.icon}
							<div class="w-8 h-8 rounded-full {selectedOption.meta.iconColor || 'bg-slate-100 text-slate-500'} flex items-center justify-center">
								<span class="material-symbols-outlined text-[18px]">{selectedOption.meta.icon}</span>
							</div>
						{:else if selectedOption}
							<div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
								{selectedOption.label.substring(0, 2).toUpperCase()}
							</div>
						{:else}
							<div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
								<span class="material-symbols-outlined text-slate-400 text-sm">person</span>
							</div>
						{/if}
					</div>
				{/if}
				<div class="flex flex-col min-w-0">
					<span class="truncate text-sm {selectedOption ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'}">
						{loading ? 'Memuat...' : (selectedOption ? selectedOption.label : placeholder)}
					</span>
					{#if selectedOption?.sublabel}
						<span class="text-[10px] text-slate-400 font-medium truncate leading-none mt-0.5">{selectedOption.sublabel}</span>
					{/if}
				</div>
			</div>
			<div class="flex items-center justify-center w-6 h-6 rounded-full {showDropdown ? 'bg-primary/10 text-primary' : 'text-slate-400'} transition-colors shrink-0">
				<span class="material-symbols-outlined text-[20px] transition-transform duration-300 {showDropdown ? 'rotate-180' : ''}">expand_more</span>
			</div>
		</button>

		{#if showDropdown}
			<div 
				transition:fly={{ y: -10, duration: 200, opacity: 0 }}
				class="absolute z-[100] top-[calc(100%+8px)] left-0 right-0 p-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl shadow-slate-200/50 max-h-72 overflow-y-auto custom-scrollbar ring-1 ring-black/5"
			>
				{#if options.length === 0}
					<div class="px-4 py-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
						<span class="material-symbols-outlined text-3xl text-slate-200">inbox</span>
						<p>Tidak ada pilihan</p>
					</div>
				{:else}
					{#each options as option}
						<button
							type="button"
							class="w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 relative overflow-hidden group 
							{value === option.value ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50 text-slate-700'}"
							on:click={() => selectOption(option)}
						>
							<!-- Highlight bar for selected items -->
							{#if value === option.value}
								<div class="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full"></div>
							{/if}
							
							<div class="flex items-center gap-3 w-full pl-1">
								{#if option.meta && (option.meta.profile_image_url !== undefined || option.meta.is_doctor || option.meta.icon)}
									<div class="relative shrink-0">
										{#if option.meta.profile_image_url}
											<img src={option.meta.profile_image_url} alt={option.label} class="w-10 h-10 rounded-full object-cover border-2 {value === option.value ? 'border-primary/20' : 'border-slate-100'} shadow-sm transition-colors" />
										{:else if option.meta.icon}
											<div class="w-10 h-10 rounded-full {option.meta.iconColor || 'bg-slate-100 text-slate-500'} flex items-center justify-center transition-transform group-hover:scale-105">
												<span class="material-symbols-outlined text-[20px]">{option.meta.icon}</span>
											</div>
										{:else}
											<div class="w-10 h-10 rounded-full {value === option.value ? 'bg-primary text-white' : 'bg-primary/10 text-primary'} flex items-center justify-center font-black text-[10px] transition-colors">
												{option.label.substring(0, 2).toUpperCase()}
											</div>
										{/if}
										{#if option.meta.has_active_shift !== undefined}
											<div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white {option.meta.has_active_shift ? 'bg-emerald-500' : 'bg-slate-300'} shadow-sm"></div>
										{/if}
									</div>
								{/if}
								<div class="flex-1 min-w-0">
									<div class="font-bold truncate transition-colors {option.meta?.has_active_shift === false ? 'opacity-50' : ''} {value === option.value ? 'text-primary' : 'text-slate-800'}">{option.label}</div>
									{#if option.sublabel}
										<div class="text-[10px] font-bold {value === option.value ? 'text-primary/60' : 'text-slate-400'} uppercase tracking-tight truncate mt-0.5 transition-colors">{option.sublabel}</div>
									{/if}
								</div>
								{#if option.meta?.has_active_shift !== undefined}
									<div class="shrink-0 text-[9px] font-black uppercase px-2 py-1 rounded-md transition-colors {option.meta.has_active_shift ? (value === option.value ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' : 'text-emerald-600 bg-emerald-50 border border-emerald-100') : 'text-slate-400 bg-slate-50 border border-slate-100'}">
										{option.meta.has_active_shift ? 'ON SHIFT' : 'OFF SHIFT'}
									</div>
								{/if}
								{#if value === option.value}
									<span class="material-symbols-outlined text-[18px] text-primary ml-auto shrink-0 animate-in zoom-in duration-200">check</span>
								{/if}
							</div>
						</button>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 5px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
</style>
