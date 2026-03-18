<script>
	export let title = '';
	export let user = null;
</script>

<header class="top-header">
	<div class="flex items-center gap-4">
		<h2 style="font-size: var(--font-size-lg); font-weight: 600;">{title}</h2>
	</div>
	<div class="flex items-center gap-3">
		<span class="text-sm text-muted">{user?.name || ''}</span>
		<div class="badge badge-primary" style="text-transform: capitalize;">{user?.role || ''}</div>
	</div>
</header>
