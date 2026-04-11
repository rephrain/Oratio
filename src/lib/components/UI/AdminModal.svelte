<script>
	import { createEventDispatcher } from 'svelte';
	export let show = false;
	export let title = '';
	export let size = 'md'; // '', 'lg', 'xl'

	const dispatch = createEventDispatcher();

	function close() {
		show = false;
		dispatch('close');
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity" on:click|self={close}>
		<div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full flex flex-col max-h-[90vh] overflow-hidden 
			{size === 'lg' ? 'max-w-3xl' : size === 'xl' ? 'max-w-5xl' : 'max-w-md'} animate-fadeInUp" style="animation-duration: 0.2s;">
			
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
				<h2 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
				<button class="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus:outline-none" on:click={close}>
					<span class="material-symbols-outlined text-[20px]">close</span>
				</button>
			</div>
			
			<div class="p-6 overflow-y-auto custom-scrollbar">
				<slot />
			</div>
			
			{#if $$slots.footer}
				<div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-3 rounded-b-2xl">
					<slot name="footer" />
				</div>
			{/if}
		</div>
	</div>
{/if}
