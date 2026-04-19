<script>
	import Toast from "$lib/components/UI/Toast.svelte";
	import Sidebar from "$lib/components/Layout/Sidebar.svelte";
	import { page } from "$app/stores";
	import { logout } from "$lib/stores/auth.js";
	import { isSidebarOpen, isProfileModalOpen } from "$lib/stores/layout.js";
	import { isChatOpen, unreadCount } from '$lib/stores/chat.js';
	import { isNotificationOpen, unreadNotificationCount } from '$lib/stores/notifications.js';
	import ProfileModal from '$lib/components/Profile/ProfileModal.svelte';
	import ChatPanel from '$lib/components/Chat/ChatPanel.svelte';
	import NotificationPanel from '$lib/components/Notifications/NotificationPanel.svelte';

	export let data;
	$: user = data?.user;
	$: currentPath = $page.url.pathname;

	let showProfileMenu = false;
</script>

<svelte:head>
	<title>Oratio Clinic - Kasir</title>
</svelte:head>

<div
	class="font-display text-slate-900 bg-background-light flex h-screen overflow-hidden w-full"
>
	<!-- Sidebar -->
	<Sidebar {user} role="kasir" />

	<!-- Main Content -->
	<main class="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
		<!-- Header -->
		<header
			class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0"
		>
			<div class="flex-1 max-w-xl">
				<div class="relative group">
					<span
						class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
						>search</span
					>
					<input
						class="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm outline-none"
						placeholder="Search by Patient ID, or Patient Name..."
						type="text"
					/>
				</div>
			</div>
			<div class="flex items-center gap-6">
				<div class="flex items-center gap-4">
					<button
						class="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
						on:click={() => ($isNotificationOpen = !$isNotificationOpen)}
						id="kasir-notification-toggle-btn"
					>
						<span class="material-symbols-outlined"
							>notifications</span
						>
						{#if $unreadNotificationCount > 0}
							<span class="notif-unread-indicator">{$unreadNotificationCount > 99 ? '99+' : $unreadNotificationCount}</span>
						{/if}
					</button>
					<button
						class="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
						on:click={() => ($isChatOpen = !$isChatOpen)}
						id="kasir-chat-toggle-btn"
					>
						<span class="material-symbols-outlined"
							>chat_bubble</span
						>
						{#if $unreadCount > 0}
							<span class="chat-unread-indicator">{$unreadCount > 99 ? '99+' : $unreadCount}</span>
						{/if}
					</button>
				</div>
				<div class="h-8 w-px bg-slate-200"></div>
				<div class="relative">
					<button
						class="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity"
						on:click={() => (showProfileMenu = !showProfileMenu)}
						on:blur={() =>
							setTimeout(() => (showProfileMenu = false), 200)}
					>
						<div class="text-right">
							<p
								class="text-sm font-semibold text-slate-900 leading-none"
							>
								{user?.name || "Receptionist"}
							</p>
							<p class="text-xs text-slate-500 mt-1 capitalize">
								{user?.role || "kasir"}
							</p>
						</div>
						<div
							class="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase overflow-hidden border border-slate-100"
						>
							{#if user?.profile_image_url}
								<img src={user.profile_image_url} alt={user?.name} class="w-full h-full object-cover"/>
							{:else}
								{user?.name?.[0] || "R"}
							{/if}
						</div>
						<span
							class="material-symbols-outlined text-slate-400 text-sm {showProfileMenu
								? 'rotate-180'
								: ''} transition-transform">expand_more</span
						>
					</button>

					{#if showProfileMenu}
						<div
							class="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 origin-top-right transition-all"
						>
							<button
								on:click={() => { $isProfileModalOpen = true; showProfileMenu = false; }}
								class="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
							>
								<span
									class="material-symbols-outlined text-[20px] text-slate-400"
									>account_circle</span
								>
								<span class="font-medium text-sm">My Profile</span
								>
							</button>
							<button
								class="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
							>
								<span
									class="material-symbols-outlined text-[20px] text-slate-400"
									>settings</span
								>
								<span class="font-medium text-sm">Settings</span
								>
							</button>
							<div class="h-px bg-slate-100 my-1"></div>
							<button
								class="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-500 transition-colors"
								on:click={logout}
							>
								<span
									class="material-symbols-outlined text-[20px]"
									>logout</span
								>
								<span class="font-medium text-sm">Logout</span>
							</button>
						</div>
					{/if}
				</div>
			</div>
		</header>

		<div
			class="flex-1 overflow-y-auto custom-scrollbar bg-secondary/30 p-8"
		>
			<slot />
		</div>
	</main>
</div>
<Toast />
<ProfileModal {user} />
<ChatPanel {user} />
<NotificationPanel {user} />

<style>
	:global(:root) {
		--tw-primary: #10b981;
		--tw-secondary: #e0e0e0;
		--tw-accent: #14b8a6;
		--tw-forest: #064e3b;
		--tw-bg-light: #f9fafb;
		--tw-bg-dark: #064e3b;
	}
	:global(body) {
		margin: 0;
		padding: 0;
	}
	:global(.custom-scrollbar::-webkit-scrollbar) {
		width: 6px;
		height: 6px;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-track) {
		background: transparent;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-thumb) {
		background: #cbd5e1;
		border-radius: 10px;
	}
	:global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
		background: #94a3b8;
	}
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	.chat-unread-indicator {
		position: absolute;
		top: 0;
		right: 0;
		background: #ef4444;
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

	.notif-unread-indicator {
		position: absolute;
		top: 0;
		right: 0;
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
</style>
