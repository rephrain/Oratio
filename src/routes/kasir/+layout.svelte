<script>
	import Toast from "$lib/components/UI/Toast.svelte";
	import Sidebar from "$lib/components/Layout/Sidebar.svelte";
	import { page } from "$app/stores";
	export let data;
	$: user = data?.user;
	$: currentPath = $page.url.pathname;
</script>

<svelte:head>
	<title>Oratio Dental - Kasir</title>
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
						placeholder="Search by ID, NIK, or Patient Name..."
						type="text"
					/>
				</div>
			</div>
			<div class="flex items-center gap-6">
				<div class="flex items-center gap-4">
					<button
						class="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
					>
						<span class="material-symbols-outlined"
							>notifications</span
						>
						<span
							class="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"
						></span>
					</button>
					<button
						class="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
					>
						<span class="material-symbols-outlined"
							>chat_bubble</span
						>
					</button>
				</div>
				<div class="h-8 w-px bg-slate-200"></div>
				<div class="flex items-center gap-3">
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
						class="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
					>
						{user?.name?.[0]?.toUpperCase() || "R"}
					</div>
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

<style>
	:global(:root) {
		--tw-primary: #10B981;
		--tw-secondary: #E0E0E0;
		--tw-accent: #14B8A6;
		--tw-forest: #064E3B;
		--tw-bg-light: #F9FAFB;
		--tw-bg-dark: #064E3B;
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
</style>
