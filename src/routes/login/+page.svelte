<script>
	import { goto } from "$app/navigation";

	let username = "";
	let password = "";
	let error = "";
	let loading = false;

	async function handleLogin() {
		error = "";
		loading = true;

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				error = data.error || "Login gagal";
				loading = false;
				return;
			}

			// Redirect by role
			const roleRoutes = {
				admin: "/admin",
				kasir: "/kasir",
				dokter: "/dokter",
			};
			goto(roleRoutes[data.user.role] || "/");
		} catch (err) {
			error = "Terjadi kesalahan jaringan";
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Oratio Dental</title>
</svelte:head>

<div
	class="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center relative overflow-hidden w-full"
>
	<!-- Background Decoration -->
	<div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
		<!-- Soft Animated Blobs -->
		<div
			class="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-float"
		></div>
		<div
			class="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-accent/20 rounded-full blur-[120px] animate-floatReverse"
		></div>
		<div
			class="absolute top-1/4 left-1/3 w-[30%] h-[30%] bg-blue-300/10 rounded-full blur-[100px] animate-float"
		></div>
		<!-- Background Image with Overlay -->
		<div
			class="absolute inset-0 w-full h-full bg-cover bg-center opacity-20 filter blur-[2px]"
			style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDHsksZn370eYrEY9KyRHTTNjun1m7C2gfmy4dpLZgIYburTFw_Kh4A0sUzeJwiNWBnpFWeZReRpEaUhtSd1wftf3fqmS9U37CcnJWu8ydZGJ_8KRTD4sPMQ2c0t2-rRFUeT2mIrT3pdEgoz_V7DdNcKVvCoSH6kJo2Q97Y3G8DZkB7NaA-PBky8F5A3KsUYBkxnfAtrZ6Eq3FE6FwJhsSDOIypBkAKRlJGDqfkd3oWvTspLHlNJMcqJQZ-ABna3QbCQiHcjqPN9N7J')"
		></div>
		<div
			class="absolute inset-0 bg-gradient-to-tr from-background-light/80 via-transparent to-background-light/60 dark:from-background-dark/80 dark:to-background-dark/60"
		></div>
	</div>

	<div
		class="relative z-10 w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-center p-8 gap-16 animate-fadeInUp"
	>
		<!-- Brand Info Side -->
		<div class="flex-1 max-w-[480px] hidden md:flex flex-col gap-6">
			<div class="flex items-center gap-3 text-primary">
				<span class="material-symbols-outlined text-5xl">dentistry</span
				>
				<h1 class="text-4xl font-black tracking-tightest">
					Oratio Dental
				</h1>
			</div>
			<div class="space-y-4">
				<h2 class="text-3xl font-bold leading-tight tracking-tight">
					Precision in Dental Care Management
				</h2>
				<p
					class="text-slate-600 dark:text-slate-400 text-lg leading-relaxed"
				>
					The integrated medical recording system designed for modern
					dental clinics. Manage patient records, scheduling, and
					billing with seamless efficiency.
				</p>
			</div>
			<div
				class="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl"
			>
				<span class="material-symbols-outlined text-primary"
					>verified_user</span
				>
				<p class="text-sm font-medium text-primary/80">
					Authorized Access Only • AES-256 Encryption
				</p>
			</div>
		</div>
		<!-- Login Card -->
		<div
			class="w-full max-w-[460px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-2xl border border-white/40 dark:border-slate-800/40 overflow-hidden"
		>
			<div class="p-8 md:p-10 flex flex-col">
				<!-- Logo Mobile -->
				<div
					class="flex md:hidden items-center gap-2 text-primary mb-2"
				>
					<span class="material-symbols-outlined text-3xl"
						>dentistry</span
					>
					<span class="text-xl font-bold">Oratio Dental</span>
				</div>
				<div class="flex flex-col gap-2 mb-4">
					<h3
						class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
					>
						Welcome Back
					</h3>
					<p class="text-slate-500 dark:text-slate-400 text-lg">
						Medical Recording System Login
					</p>
				</div>

				{#if error}
					<div
						class="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm animate-fadeInUp"
					>
						<span class="material-symbols-outlined text-lg"
							>error</span
						>
						{error}
					</div>
				{/if}

				<!-- Form Fields -->
				<form
					class="flex flex-col gap-5"
					on:submit|preventDefault={handleLogin}
				>
					<div class="flex flex-col gap-2">
						<label
							class="text-[13px] font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider"
							for="username">Username</label
						>
						<div class="relative group">
							<span
								class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-300"
								>person</span
							>
							<input
								id="username"
								class="w-full pl-12 pr-4 py-3.5 bg-blue-50/30 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
								placeholder="Enter username"
								type="text"
								bind:value={username}
								required
							/>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						<div class="flex justify-between items-center ml-1">
							<label
								class="text-[13px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
								for="password">Password</label
							>
						</div>
						<div class="relative group">
							<span
								class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-300"
								>lock</span
							>
							<input
								id="password"
								class="w-full pl-12 pr-4 py-3.5 bg-blue-50/30 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
								placeholder="••••••••"
								type="password"
								bind:value={password}
								required
							/>
						</div>
					</div>
					<button
						class="w-full mt-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2 group hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
						type="submit"
						disabled={loading}
					>
						{#if loading}
							<span
								class="animate-spin material-symbols-outlined"
								style="animation: spin 1s linear infinite;"
								>refresh</span
							>
							<span>Authenticating...</span>
						{:else}
							<span>Sign In to Portal</span>
							<span
								class="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-300"
								>arrow_forward</span
							>
						{/if}
					</button>
				</form>
				<!-- Security Footer -->
				<div
					class="flex items-center justify-center gap-2 py-6 border-t border-slate-200/30 dark:border-slate-700/30 mt-8"
				>
					<span
						class="material-symbols-outlined text-amber-500 text-sm"
						>lan</span
					>
					<p
						class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest"
					>
						Secure LAN Access Only
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Background Elements -->
	<div
		class="fixed bottom-12 left-12 hidden lg:block z-0 pointer-events-none"
	>
		<div class="flex flex-col gap-1 opacity-40">
			<div class="w-12 h-1 bg-primary"></div>
			<div class="w-8 h-1 bg-primary"></div>
			<div class="w-4 h-1 bg-primary"></div>
		</div>
	</div>
</div>

<style>
	:global(:root) {
		--tw-primary: #3b82f6;
		--tw-accent: #0ea5e9;
		--tw-bg-light: #f8fafc;
		--tw-bg-dark: #0f172a;
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
