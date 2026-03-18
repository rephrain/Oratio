<script>
	import { createEventDispatcher } from 'svelte';
	export let show = false;
	export let title = '';
	export let size = ''; // '', 'lg', 'xl'

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
	<div class="modal-overlay" on:click|self={close}>
		<div class="modal-content {size ? 'modal-' + size : ''}">
			<div class="modal-header">
				<h2>{title}</h2>
				<button class="btn btn-ghost btn-icon" on:click={close}>✕</button>
			</div>
			<div class="modal-body">
				<slot />
			</div>
			{#if $$slots.footer}
				<div class="modal-footer">
					<slot name="footer" />
				</div>
			{/if}
		</div>
	</div>
{/if}
