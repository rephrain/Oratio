<script>
	import { isSidebarOpen, isSidebarHidden, headerTitle, isPatientProfileOpen, isProfileModalOpen } from '$lib/stores/layout.js';
	import { logout } from '$lib/stores/auth.js';
	import ProfileModal from '$lib/components/Profile/ProfileModal.svelte';

	export let user = null;

	let showProfileMenu = false;
</script>

<header 
	class="top-header transition-all duration-300" 
	style="padding-left: {$isSidebarHidden ? 'var(--space-8)' : ($isSidebarOpen ? 'calc(260px + var(--space-8))' : 'calc(80px + var(--space-8))')}; padding-right: var(--space-8);"
>
	<div class="flex-1 max-w-2xl">
		{#if $headerTitle}
			<button class="text-left focus:outline-none hover:opacity-80 transition-opacity group cursor-pointer flex items-center gap-2" on:click={() => ($isPatientProfileOpen = !$isPatientProfileOpen)}>
				<h1 class="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors m-0 leading-none">{$headerTitle}</h1>
				<span class="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm">info</span>
			</button>
		{/if}
	</div>
	<div class="flex items-center gap-6">
		<div class="flex items-center gap-4">
			<button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors focus:outline-none">
				<span class="material-symbols-outlined">notifications</span>
				<span class="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
			</button>
			<button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors focus:outline-none">
				<span class="material-symbols-outlined">chat_bubble</span>
			</button>
		</div>
		<div class="h-8 w-px bg-slate-200"></div>
		<div class="relative">
			<button
				class="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity"
				on:click={() => (showProfileMenu = !showProfileMenu)}
				on:blur={() => setTimeout(() => (showProfileMenu = false), 200)}
			>
				<div class="text-right">
					<p class="text-sm font-semibold text-slate-900 leading-none">{user?.name || "User"}</p>
					<p class="text-xs text-slate-500 mt-1 capitalize">{user?.role || "user"}</p>
				</div>
				<div class="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase overflow-hidden border border-slate-100">
					{#if user?.profile_image_url}
						<img src={user.profile_image_url} alt={user?.name} class="w-full h-full object-cover"/>
					{:else}
						{user?.name?.[0] || "U"}
					{/if}
				</div>
				<span class="material-symbols-outlined text-slate-400 text-sm {showProfileMenu ? 'rotate-180' : ''} transition-transform">expand_more</span>
			</button>

			{#if showProfileMenu}
				<div class="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-[60] origin-top-right transition-all">
					<button on:click={() => { $isProfileModalOpen = true; showProfileMenu = false; }} class="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors">
						<span class="material-symbols-outlined text-[20px] text-slate-400">account_circle</span>
						<span class="font-medium text-sm">My Profile</span>
					</button>
					<button class="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 transition-colors">
						<span class="material-symbols-outlined text-[20px] text-slate-400">settings</span>
						<span class="font-medium text-sm">Settings</span>
					</button>
					<div class="h-px bg-slate-100 my-1"></div>
					<button class="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-500 transition-colors" on:click={logout}>
						<span class="material-symbols-outlined text-[20px]">logout</span>
						<span class="font-medium text-sm">Logout</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
</header>

<ProfileModal {user} />
