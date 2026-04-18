<script>
	import { page } from "$app/stores";
	import { logout } from "$lib/stores/auth.js";
	import { isSidebarOpen } from "$lib/stores/layout.js";
	import ShiftTimer from "./ShiftTimer.svelte";

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
			{ href: "/kasir/patients", icon: "🏥", label: "Data Pasien" },
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
			{ href: "/dokter/history", icon: "🕒", label: "History" },
		],
	};

	$: items = menuItems[role] || [];
	$: currentPath = $page.url.pathname;
</script>

{#if role === "kasir"}
	<aside
		class="bg-forest flex flex-col h-full text-white shrink-0 shadow-lg z-20 font-display transition-all duration-300 {$isSidebarOpen ? 'w-64' : 'w-20'} relative"
	>
		<!-- Toggle Button -->
		<button
			class="absolute -right-3 top-8 bg-white text-forest rounded-full shadow-md border border-slate-200 size-6 flex items-center justify-center hover:bg-slate-50 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-primary"
			on:click={() => ($isSidebarOpen = !$isSidebarOpen)}
			title="Toggle Sidebar"
		>
			<span class="material-symbols-outlined text-[16px]">
				{$isSidebarOpen ? 'menu_open' : 'menu'}
			</span>
		</button>
		<div class="p-6 flex items-center gap-3 { $isSidebarOpen ? '' : 'justify-center p-4' }">
			<div
				class="size-10 bg-primary rounded-lg flex items-center justify-center shrink-0"
			>
				<span class="material-symbols-outlined text-white"
					>dentistry</span
				>
			</div>
			{#if $isSidebarOpen}
			<div class="overflow-hidden whitespace-nowrap">
				<h1 class="font-bold text-lg leading-none">Oratio Clinic</h1>
				<p
					class="text-[10px] text-primary uppercase tracking-widest mt-1 text-emerald-400"
				>
					Kasir Access
				</p>
			</div>
			{/if}
		</div>
		<nav class="flex-1 px-4 space-y-2 mt-4 { $isSidebarOpen ? '' : '!px-2' }">
			<a
				class="flex items-center { $isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3' } {currentPath ===
				'/kasir'
					? 'bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300'
					: 'hover:bg-white/10 !text-white/70 hover:!text-white'} rounded-lg transition-colors"
				href="/kasir"
				title="Dashboard"
			>
				<span
					class="material-symbols-outlined {currentPath === '/kasir'
						? ''
						: 'opacity-70'}">dashboard</span
				>
				{#if $isSidebarOpen}
				<span class="font-medium text-sm whitespace-nowrap">Dashboard</span>
				{/if}
			</a>
			<a
				class="flex items-center { $isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3' } {currentPath ===
				'/kasir/new-patient'
					? 'bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300'
					: 'hover:bg-white/10 !text-white/70 hover:!text-white'} rounded-lg transition-colors"
				href="/kasir/new-patient"
				title="New Patient"
			>
				<span
					class="material-symbols-outlined {currentPath ===
					'/kasir/new-patient'
						? ''
						: 'opacity-70'}">person_add</span
				>
				{#if $isSidebarOpen}
				<span class="font-medium text-sm whitespace-nowrap">New Patient</span>
				{/if}
			</a>
			<a
				class="flex items-center { $isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3' } {currentPath ===
				'/kasir/existing-patient'
					? 'bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300'
					: 'hover:bg-white/10 !text-white/70 hover:!text-white'} rounded-lg transition-colors"
				href="/kasir/existing-patient"
				title="Existing Patient"
			>
				<span
					class="material-symbols-outlined {currentPath ===
					'/kasir/existing-patient'
						? ''
						: 'opacity-70'}">group</span
				>
				{#if $isSidebarOpen}
				<span class="font-medium text-sm whitespace-nowrap">Existing Patient</span>
				{/if}
			</a>
			<a
				class="flex items-center { $isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3' } {currentPath ===
				'/kasir/payment'
					? 'bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300'
					: 'hover:bg-white/10 !text-white/70 hover:!text-white'} rounded-lg transition-colors"
				href="/kasir/payment"
				title="Payment"
			>
				<span
					class="material-symbols-outlined {currentPath ===
					'/kasir/payment'
						? ''
						: 'opacity-70'}">payments</span
				>
				{#if $isSidebarOpen}
				<span class="font-medium text-sm whitespace-nowrap">Payment</span>
				{/if}
			</a>
			<a
				class="flex items-center { $isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3' } {currentPath.startsWith('/kasir/patients')
					? 'bg-primary/20 border-l-4 border-primary !text-emerald-400 hover:!text-emerald-300'
					: 'hover:bg-white/10 !text-white/70 hover:!text-white'} rounded-lg transition-colors"
				href="/kasir/patients"
				title="Data Pasien"
			>
				<span
					class="material-symbols-outlined {currentPath.startsWith('/kasir/patients')
						? ''
						: 'opacity-70'}">database</span
				>
				{#if $isSidebarOpen}
				<span class="font-medium text-sm whitespace-nowrap">Data Pasien</span>
				{/if}
			</a>
		</nav>
		<div class="mt-auto p-4 border-t border-white/10">
			<ShiftTimer />
		</div>
	</aside>
{:else if role === "dokter"}
	<aside
		class="sidebar bg-[#1E3A5F] flex flex-col text-white shadow-lg font-display"
	>
		<!-- Toggle Button -->
		<button
			class="absolute -right-3 top-8 bg-white text-[#1E3A5F] rounded-full shadow-md border border-slate-200 size-6 flex items-center justify-center hover:bg-slate-50 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
			on:click={() => ($isSidebarOpen = !$isSidebarOpen)}
			title="Toggle Sidebar"
		>
			<span class="material-symbols-outlined text-[16px]">
				{$isSidebarOpen ? 'menu_open' : 'menu'}
			</span>
		</button>
		<div class="p-6 flex items-center gap-3 { $isSidebarOpen ? '' : 'justify-center p-4' }">
			<div
				class="size-10 bg-[#3B82F6] rounded-lg flex items-center justify-center shrink-0"
			>
				<span class="material-symbols-outlined text-white"
					>medical_services</span
				>
			</div>
			{#if $isSidebarOpen}
			<div class="overflow-hidden whitespace-nowrap">
				<h1 class="font-bold text-lg leading-none">Oratio Clinic</h1>
				<p
					class="text-[10px] text-[#38BDF8] uppercase tracking-widest mt-1"
				>
					Dokter Access
				</p>
			</div>
			{/if}
		</div>
		<nav class="flex-1 px-4 space-y-2 mt-4 { $isSidebarOpen ? '' : '!px-2' }">
			<a
				class="flex items-center { $isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3' } {currentPath === '/dokter'
					? 'bg-[#3B82F6]/20 border-l-4 border-[#3B82F6] !text-[#38BDF8] hover:!text-[#E0F2FE]'
					: 'hover:bg-white/10 !text-white/70 hover:!text-white'} rounded-lg transition-colors"
				href="/dokter"
				title="Dashboard"
			>
				<span
					class="material-symbols-outlined {currentPath === '/dokter'
						? ''
						: 'opacity-70'}">dashboard</span
				>
				{#if $isSidebarOpen}
				<span class="font-medium text-sm whitespace-nowrap">Dashboard</span>
				{/if}
			</a>
			<a
				class="flex items-center { $isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3' } {currentPath.startsWith('/dokter/analytics')
					? 'bg-[#3B82F6]/20 border-l-4 border-[#3B82F6] !text-[#38BDF8] hover:!text-[#E0F2FE]'
					: 'hover:bg-white/10 !text-white/70 hover:!text-white'} rounded-lg transition-colors"
				href="/dokter/analytics"
				title="Analytics"
			>
				<span
					class="material-symbols-outlined {currentPath.startsWith('/dokter/analytics')
						? ''
						: 'opacity-70'}">analytics</span
				>
				{#if $isSidebarOpen}
				<span class="font-medium text-sm whitespace-nowrap">Analytics</span>
				{/if}
			</a>
			<a
				class="flex items-center { $isSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3' } {currentPath.startsWith('/dokter/history')
					? 'bg-[#3B82F6]/20 border-l-4 border-[#3B82F6] !text-[#38BDF8] hover:!text-[#E0F2FE]'
					: 'hover:bg-white/10 !text-white/70 hover:!text-white'} rounded-lg transition-colors"
				href="/dokter/history"
				title="History"
			>
				<span
					class="material-symbols-outlined {currentPath.startsWith('/dokter/history')
						? ''
						: 'opacity-70'}">history</span
				>
				{#if $isSidebarOpen}
				<span class="font-medium text-sm whitespace-nowrap">History</span>
				{/if}
			</a>
		</nav>
		<div class="mt-auto p-4 border-t border-white/10">
			<ShiftTimer />
		</div>
	</aside>
{:else}
	<aside class="sidebar">
		<!-- Toggle Button -->
		<button
			class="sidebar-toggle-btn absolute -right-3 top-8 bg-white text-gray-700 rounded-full shadow-md border border-gray-200 size-6 flex items-center justify-center hover:bg-gray-50 transition-colors z-50 focus:outline-none focus:ring-2 focus:ring-primary"
			style="width: 24px; height: 24px; top: 32px; right: -12px; cursor: pointer;"
			on:click={() => ($isSidebarOpen = !$isSidebarOpen)}
			title="Toggle Sidebar"
		>
			<span class="material-symbols-outlined" style="font-size: 16px;">
				{$isSidebarOpen ? 'menu_open' : 'menu'}
			</span>
		</button>
		
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
					title={item.label}
				>
					<span class="icon">{item.icon}</span>
					<span class="sidebar-link-text">{item.label}</span>
				</a>
			{/each}
		</nav>
	</aside>
{/if}
