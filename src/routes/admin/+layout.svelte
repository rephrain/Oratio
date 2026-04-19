<script>
	import Toast from "$lib/components/UI/Toast.svelte";
	import { page } from "$app/stores";
	import { logout } from "$lib/stores/auth.js";
	import { ADMIN_TABLES } from "$lib/utils/constants.js";
	import { isProfileModalOpen } from "$lib/stores/layout.js";
	import { isNotificationOpen, unreadNotificationCount } from '$lib/stores/notifications.js';
	import ProfileModal from '$lib/components/Profile/ProfileModal.svelte';
	import NotificationPanel from '$lib/components/Notifications/NotificationPanel.svelte';

	export let data;
	$: user = data?.user;
	$: currentPath = $page.url.pathname;

	let showProfileMenu = false;
</script>

<div class="relative flex min-h-screen w-full overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
	<!-- Sidebar -->
	<aside class="w-64 bg-slate-sidebar text-slate-400 hidden lg:flex flex-col border-r border-slate-800/50">
		<div class="p-6 flex items-center gap-3">
			<div class="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
				<span class="material-symbols-outlined text-2xl">dentistry</span>
			</div>
			<h2 class="text-white text-xl font-bold tracking-tight">Oratio Admin</h2>
		</div>
		<nav class="flex-1 px-4 space-y-1 custom-scrollbar overflow-y-auto">
			<div class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-3 py-4">Main Menu</div>
			<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all {currentPath === '/admin' ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5 hover:text-white'}" href="/admin">
				<span class="material-symbols-outlined">dashboard</span>
				<span class="text-sm {currentPath === '/admin' ? 'font-semibold' : 'font-medium'}">Dashboard</span>
			</a>
			<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all {currentPath.startsWith('/admin/patients') ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5 hover:text-white'}" href="/admin/patients">
				<span class="material-symbols-outlined">groups</span>
				<span class="text-sm {currentPath.startsWith('/admin/patients') ? 'font-semibold' : 'font-medium'}">Patients</span>
			</a>
			<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all {currentPath.startsWith('/admin/users') ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5 hover:text-white'}" href="/admin/users">
				<span class="material-symbols-outlined">stethoscope</span>
				<span class="text-sm {currentPath.startsWith('/admin/users') ? 'font-semibold' : 'font-medium'}">Users / Staff</span>
			</a>
			<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all {currentPath.startsWith('/admin/encounters') ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5 hover:text-white'}" href="/admin/encounters">
				<span class="material-symbols-outlined">calendar_month</span>
				<span class="text-sm {currentPath.startsWith('/admin/encounters') ? 'font-semibold' : 'font-medium'}">Encounters</span>
			</a>
			<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all {currentPath.startsWith('/admin/doctor-shifts') ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5 hover:text-white'}" href="/admin/doctor-shifts">
				<span class="material-symbols-outlined">schedule</span>
				<span class="text-sm {currentPath.startsWith('/admin/doctor-shifts') ? 'font-semibold' : 'font-medium'}">Doctor Shifts</span>
			</a>
			
			<div class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-3 py-4 mt-4">System</div>
			<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all {currentPath.startsWith('/admin/payments') ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5 hover:text-white'}" href="/admin/payments">
				<span class="material-symbols-outlined">payments</span>
				<span class="text-sm {currentPath.startsWith('/admin/payments') ? 'font-semibold' : 'font-medium'}">Payments</span>
			</a>
			<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all {currentPath.startsWith('/admin/items') ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5 hover:text-white'}" href="/admin/items">
				<span class="material-symbols-outlined">inventory</span>
				<span class="text-sm {currentPath.startsWith('/admin/items') ? 'font-semibold' : 'font-medium'}">Items & DB</span>
			</a>
			<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all {currentPath.startsWith('/admin/terminology') ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5 hover:text-white'}" href="/admin/terminology">
				<span class="material-symbols-outlined">dictionary</span>
				<span class="text-sm {currentPath.startsWith('/admin/terminology') ? 'font-semibold' : 'font-medium'}">Terminology</span>
			</a>
			<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all {currentPath.startsWith('/admin/import') ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5 hover:text-white'}" href="/admin/import">
				<span class="material-symbols-outlined">database</span>
				<span class="text-sm {currentPath.startsWith('/admin/import') ? 'font-semibold' : 'font-medium'}">Data Import</span>
			</a>
		</nav>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 flex flex-col min-w-0 overflow-hidden">
		<!-- Top Nav -->
		<header class="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between px-8 sticky top-0 z-20">
			<div class="flex items-center flex-1">
				<div class="relative max-w-md w-full">
					<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
					<input class="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-primary/30 dark:focus:border-primary/30 rounded-lg text-sm transition-all focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-500" placeholder="Search system, patients, or logs..." type="text"/>
				</div>
			</div>
			<div class="flex items-center gap-6">
				<div class="flex items-center gap-4">
					<button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative" on:click={() => ($isNotificationOpen = !$isNotificationOpen)} id="admin-notification-toggle-btn">
						<span class="material-symbols-outlined">notifications</span>
						{#if $unreadNotificationCount > 0}
							<span class="notif-unread-indicator">{$unreadNotificationCount > 99 ? '99+' : $unreadNotificationCount}</span>
						{/if}
					</button>
					<button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
						<span class="material-symbols-outlined">help</span>
					</button>
				</div>
				
				<div class="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>

				<div class="relative">
					<button
						class="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity"
						on:click={() => (showProfileMenu = !showProfileMenu)}
						on:blur={() => setTimeout(() => (showProfileMenu = false), 200)}
					>
						<div class="text-right hidden sm:block">
							<p class="text-sm font-semibold text-slate-900 dark:text-white leading-none">{user?.name || "Admin"}</p>
							<p class="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{user?.role || "System Admin"}</p>
						</div>
						<div class="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase overflow-hidden border border-primary/20">
							{#if user?.profile_image_url}
								<img src={user.profile_image_url} alt={user?.name} class="w-full h-full object-cover"/>
							{:else}
								{user?.name?.[0] || "A"}
							{/if}
						</div>
						<span class="material-symbols-outlined text-slate-400 text-sm {showProfileMenu ? 'rotate-180' : ''} transition-transform">expand_more</span>
					</button>

					{#if showProfileMenu}
						<div class="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-[60] origin-top-right transition-all">
							<div class="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1 sm:hidden">
								<p class="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Admin User'}</p>
								<p class="text-[10px] text-slate-500 uppercase tracking-wider truncate">{user?.role || 'System Admin'}</p>
							</div>
							<button on:click={() => { $isProfileModalOpen = true; showProfileMenu = false; }} class="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors">
								<span class="material-symbols-outlined text-xl text-slate-400">account_circle</span>
								<span class="font-medium text-sm">My Profile</span>
							</button>
							<button class="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors">
								<span class="material-symbols-outlined text-xl text-slate-400">settings</span>
								<span class="font-medium text-sm">Settings</span>
							</button>
							<div class="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
							<button class="w-full flex items-center gap-3 px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 transition-colors" on:click={logout}>
								<span class="material-symbols-outlined text-xl">logout</span>
								<span class="font-medium text-sm">Logout</span>
							</button>
						</div>
					{/if}
				</div>
			</div>
		</header>
		
		<slot />
	</main>
</div>

<Toast />
<ProfileModal {user} />
<NotificationPanel {user} isAdmin={true} />

<style>
	:global(.custom-scrollbar::-webkit-scrollbar) { width: 6px; }
	:global(.custom-scrollbar::-webkit-scrollbar-track) { background: transparent; }
	:global(.custom-scrollbar::-webkit-scrollbar-thumb) { background: #cbd5e1; border-radius: 10px; }
	:global(.dark .custom-scrollbar::-webkit-scrollbar-thumb) { background: #334155; }
	:global(.bg-slate-sidebar) { background-color: #020617; }

	.notif-unread-indicator {
		position: absolute;
		top: 2px;
		right: 2px;
		background: linear-gradient(135deg, #6366f1, #4f46e5);
		color: white;
		font-size: 0.6rem;
		font-weight: 700;
		min-width: 18px;
		height: 18px;
		border-radius: 9px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 4px;
		border: 2px solid white;
		line-height: 1;
		animation: badgePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes badgePop {
		from { transform: scale(0); }
		to { transform: scale(1); }
	}
</style>
