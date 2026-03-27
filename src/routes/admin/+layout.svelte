<script>
	import AppShell from "$lib/components/Layout/AppShell.svelte";
	import Toast from "$lib/components/UI/Toast.svelte";

	export let data;
	$: user = data?.user;
</script>

<AppShell {user} role="admin" title="Admin">
	<slot />
</AppShell>
<Toast />
