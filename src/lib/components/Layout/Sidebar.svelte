<script>
	import { page } from "$app/stores";
	import { logout } from "$lib/stores/auth.js";

	export let user;
	export let role;

	const menuItems = {
		admin: [
			{ href: "/admin", icon: "📊", label: "Dashboard" },
			{ href: "/admin/users", icon: "👥", label: "Users" },
			{
				href: "/admin/doctor-shifts",
				icon: "🕐",
				label: "Doctor Shifts",
			},
			{ href: "/admin/patients", icon: "🏥", label: "Patients" },
			{ href: "/admin/encounters", icon: "📋", label: "Encounters" },
			{ href: "/admin/terminology", icon: "📖", label: "Terminology" },
			{ href: "/admin/items", icon: "💊", label: "Items" },
			{ href: "/admin/payments", icon: "💳", label: "Payments" },
			{ href: "/admin/import", icon: "📤", label: "CSV Import" },
		],
		kasir: [
			{ href: "/kasir", icon: "📋", label: "Antrian" },
			{ href: "/kasir/new-patient", icon: "➕", label: "Pasien Baru" },
			{
				href: "/kasir/existing-patient",
				icon: "🔍",
				label: "Pasien Lama",
			},
			{ href: "/kasir/payment", icon: "💳", label: "Pembayaran" },
		],
		dokter: [
			{ href: "/dokter", icon: "📋", label: "Dashboard" },
			{ href: "/dokter/analytics", icon: "📊", label: "Analytics" },
		],
	};

	$: items = menuItems[role] || [];
	$: currentPath = $page.url.pathname;
</script>

{#if role === 'kasir'}
	<aside class="w-64 bg-forest flex flex-col h-full text-white shrink-0 shadow-lg z-20 font-display">
		<div class="p-6 flex items-center gap-3">
			<div class="size-10 bg-primary rounded-lg flex items-center justify-center">
				<span class="material-symbols-outlined text-white">dentistry</span>
			</div>
			<div>
				<h1 class="font-bold text-lg leading-none">Oratio Dental</h1>
				<p class="text-[10px] text-primary uppercase tracking-widest mt-1 text-emerald-400">Kasir Access</p>
			</div>
		</div>
		<nav class="flex-1 px-4 space-y-2 mt-4">
			<a class="flex items-center gap-3 px-4 py-3 {currentPath === '/kasir' ? 'bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300' : 'hover:bg-white/10 !text-white/70 hover:!text-white'} rounded-lg transition-colors" href="/kasir">
				<span class="material-symbols-outlined {currentPath === '/kasir' ? '' : 'opacity-70'}">dashboard</span>
				<span class="font-medium text-sm">Dashboard</span>
			</a>
			<a class="flex items-center gap-3 px-4 py-3 {currentPath === '/kasir/new-patient' ? 'bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300' : 'hover:bg-white/10 !text-white/70 hover:!text-white'} rounded-lg transition-colors" href="/kasir/new-patient">
				<span class="material-symbols-outlined {currentPath === '/kasir/new-patient' ? '' : 'opacity-70'}">person_add</span>
				<span class="font-medium text-sm">New Patient</span>
			</a>
			<a class="flex items-center gap-3 px-4 py-3 {currentPath === '/kasir/existing-patient' ? 'bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300' : 'hover:bg-white/10 !text-white/70 hover:!text-white'} rounded-lg transition-colors" href="/kasir/existing-patient">
				<span class="material-symbols-outlined {currentPath === '/kasir/existing-patient' ? '' : 'opacity-70'}">group</span>
				<span class="font-medium text-sm">Existing Patient</span>
			</a>
			<a class="flex items-center gap-3 px-4 py-3 {currentPath === '/kasir/payment' ? 'bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300' : 'hover:bg-white/10 !text-white/70 hover:!text-white'} rounded-lg transition-colors" href="/kasir/payment">
				<span class="material-symbols-outlined {currentPath === '/kasir/payment' ? '' : 'opacity-70'}">payments</span>
				<span class="font-medium text-sm">Payment</span>
			</a>
			
			<div class="pt-10 pb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500/50">System</div>
			
			<div class="space-y-2">
				<button class="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
					<span class="material-symbols-outlined opacity-70">settings</span>
					<span class="font-medium text-sm">Settings</span>
				</button>
				<button class="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-lg text-red-500/80 hover:text-red-400 transition-colors" on:click={logout}>
					<span class="material-symbols-outlined opacity-70">logout</span>
					<span class="font-medium text-sm">Logout</span>
				</button>
			</div>
		</nav>
		<div class="p-6 border-t border-white/10">
			<!-- Minimal User profile area -->
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center border border-emerald-600/30 overflow-hidden text-white font-bold text-lg">
					{user?.name?.[0] || 'U'}
				</div>
				<div class="overflow-hidden">
					<p class="text-sm font-semibold truncate text-white">{user?.name || "Kasir User"}</p>
					<p class="text-xs text-emerald-400/70 truncate capitalize">{user?.role || "Kasir"}</p>
				</div>
			</div>
		</div>
	</aside>
{:else}
	<aside class="sidebar">
		<div class="sidebar-header">
			<img
				src="/logo.png"
				alt="Klinik Utama Oratio"
				style="
					max-width: 100%;
					height: 52px;
					width: auto;
					object-fit: contain;
				"
			/>
		</div>

		<nav class="sidebar-nav">
			<div class="sidebar-section">Menu</div>
			{#each items as item}
				<a
					href={item.href}
					class="sidebar-link"
					class:active={currentPath === item.href ||
						(item.href !== "/" + role &&
							currentPath.startsWith(item.href))}
				>
					<span class="icon">{item.icon}</span>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="sidebar-footer">
			<div
				style="font-size: var(--font-size-sm); margin-bottom: var(--space-2);"
			>
				<div class="font-semibold" style="color: white;">
					{user?.name || "User"}
				</div>
				<div
					style="font-size: var(--font-size-xs); opacity: 0.6; text-transform: capitalize;"
				>
					{user?.role}
				</div>
			</div>
			<button
				class="btn btn-ghost"
				style="color: var(--sidebar-text); width: 100%; justify-content: flex-start;"
				on:click={logout}
			>
				🚪 Logout
			</button>
		</div>
	</aside>
{/if}
