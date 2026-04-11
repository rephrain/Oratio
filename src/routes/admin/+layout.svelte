<script>
	import Toast from "$lib/components/UI/Toast.svelte";
	import { page } from "$app/stores";
	import { logout } from "$lib/stores/auth.js";
	import { ADMIN_TABLES } from "$lib/utils/constants.js";

	export let data;
	$: user = data?.user;
	$: currentPath = $page.url.pathname;
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
		<div class="p-4 border-t border-slate-800/50">
			<div class="flex items-center gap-3 p-2 rounded-xl bg-slate-900/50 border border-slate-800/50">
				<div class="size-9 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-white/10 text-white font-bold uppercase">
					{user?.name?.[0] || 'U'}
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-xs font-bold text-white truncate">{user?.name || 'Admin User'}</p>
					<p class="text-[10px] text-slate-500 truncate uppercase tracking-wider">{user?.role || 'System Admin'}</p>
				</div>
				<button class="text-slate-500 hover:text-rose-400 transition-colors" on:click={logout} title="Logout">
					<span class="material-symbols-outlined text-lg">logout</span>
				</button>
			</div>
		</div>
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
			<div class="flex items-center gap-3">
				<button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
					<span class="material-symbols-outlined">notifications</span>
					<span class="absolute top-2.5 right-2.5 size-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
				</button>
				<button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
					<span class="material-symbols-outlined">help</span>
				</button>
			</div>
		</header>
		
		<slot />
	</main>
</div>

<Toast />

<style>
	:global(.custom-scrollbar::-webkit-scrollbar) { width: 6px; }
	:global(.custom-scrollbar::-webkit-scrollbar-track) { background: transparent; }
	:global(.custom-scrollbar::-webkit-scrollbar-thumb) { background: #cbd5e1; border-radius: 10px; }
	:global(.dark .custom-scrollbar::-webkit-scrollbar-thumb) { background: #334155; }
	:global(.bg-slate-sidebar) { background-color: #020617; }
</style>
