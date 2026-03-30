<script>
	import Sidebar from './Sidebar.svelte';
	import Header from './Header.svelte';
	import { isSidebarOpen } from '$lib/stores/layout.js';

	export let user;
	export let role;
	export let title = '';
</script>

<div class="app-shell role-{role}" class:sidebar-collapsed={!$isSidebarOpen}>
	<Sidebar {role} {user} />
	<div class="main-content">
		<Header {title} {user} />
		<div class="page-content">
			<slot />
		</div>
	</div>
</div>
