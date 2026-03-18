<script>
	import { page } from '$app/stores';
	import { logout } from '$lib/stores/auth.js';

	export let user;
	export let role;

	const menuItems = {
		admin: [
			{ href: '/admin', icon: '📊', label: 'Dashboard' },
			{ href: '/admin/users', icon: '👥', label: 'Users' },
			{ href: '/admin/doctor-shifts', icon: '🕐', label: 'Doctor Shifts' },
			{ href: '/admin/patients', icon: '🏥', label: 'Patients' },
			{ href: '/admin/encounters', icon: '📋', label: 'Encounters' },
			{ href: '/admin/terminology', icon: '📖', label: 'Terminology' },
			{ href: '/admin/items', icon: '💊', label: 'Items' },
			{ href: '/admin/payments', icon: '💳', label: 'Payments' },
			{ href: '/admin/import', icon: '📤', label: 'CSV Import' }
		],
		kasir: [
			{ href: '/kasir', icon: '📋', label: 'Antrian' },
			{ href: '/kasir/new-patient', icon: '➕', label: 'Pasien Baru' },
			{ href: '/kasir/existing-patient', icon: '🔍', label: 'Pasien Lama' },
			{ href: '/kasir/payment', icon: '💳', label: 'Pembayaran' }
		],
		dokter: [
			{ href: '/dokter', icon: '📋', label: 'Dashboard' },
			{ href: '/dokter/analytics', icon: '📊', label: 'Analytics' }
		]
	};

	$: items = menuItems[role] || [];
	$: currentPath = $page.url.pathname;
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<div class="sidebar-logo">O</div>
		<div>
			<div class="sidebar-brand">Oratio</div>
			<div style="font-size: var(--font-size-xs); opacity: 0.7; text-transform: capitalize;">{role}</div>
		</div>
	</div>

	<nav class="sidebar-nav">
		<div class="sidebar-section">Menu</div>
		{#each items as item}
			<a
				href={item.href}
				class="sidebar-link"
				class:active={currentPath === item.href || (item.href !== '/' + role && currentPath.startsWith(item.href))}
			>
				<span class="icon">{item.icon}</span>
				{item.label}
			</a>
		{/each}
	</nav>

	<div class="sidebar-footer">
		<div style="font-size: var(--font-size-sm); margin-bottom: var(--space-2);">
			<div class="font-semibold" style="color: white;">{user?.name || 'User'}</div>
			<div style="font-size: var(--font-size-xs); opacity: 0.6; text-transform: capitalize;">{user?.role}</div>
		</div>
		<button class="btn btn-ghost" style="color: var(--sidebar-text); width: 100%; justify-content: flex-start;" on:click={logout}>
			🚪 Logout
		</button>
	</div>
</aside>
