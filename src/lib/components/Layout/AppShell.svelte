<script>
	import Sidebar from './Sidebar.svelte';
	import Header from './Header.svelte';

	export let user;
	export let role;
	export let title = '';
</script>

<div class="app-shell role-{role}">
	<div class="main-content">
		<Header {title} {user} />
		<div class="page-content">
			<slot />
		</div>
	</div>
</div>
