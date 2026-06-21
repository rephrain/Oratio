<script>
	import Sidebar from './Sidebar.svelte';
	import Header from './Header.svelte';
	import { isSidebarOpen, isSidebarHidden } from '$lib/stores/layout.js';
	import { connect } from '$lib/stores/realtimeConnection.js';
	import ChatPanel from '../Chat/ChatPanel.svelte';
	import NotificationPanel from '../Notifications/NotificationPanel.svelte';
	import { onMount } from 'svelte';

	export let user;
	export let role;
	export let title = '';

	onMount(() => {
		connect();
	});
</script>

<div class="app-shell role-{role}" 
	class:sidebar-collapsed={!$isSidebarOpen} 
	class:sidebar-hidden={$isSidebarHidden}>
	<Sidebar {role} {user} />
	<Header {title} {user} />
	<div class="main-content">
		<div class="page-content">
			<slot />
		</div>
	</div>
</div>

<ChatPanel {user} />
<NotificationPanel {user} isAdmin={role === 'admin'} />
