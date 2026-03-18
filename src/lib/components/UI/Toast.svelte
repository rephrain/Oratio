<script>
	import { toasts, removeToast } from '$lib/stores/toast.js';
</script>

<div class="toast-container">
	{#each $toasts as toast (toast.id)}
		<div class="toast toast-{toast.type}">
			<span style="flex: 1;">{toast.message}</span>
			<button class="btn btn-ghost btn-icon btn-sm" on:click={() => removeToast(toast.id)}>✕</button>
		</div>
	{/each}
</div>

