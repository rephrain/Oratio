<script>
	import { isProfileModalOpen } from '$lib/stores/layout.js';
	import { onMount } from 'svelte';
	
	export let user = {};
	
	let name = user.name || '';
	let username = ''; // will be fetched or default to empty
	let password = '';
	let previewUrl = user.profile_image_url || null;
	let newImageFile = null;
	
	let isLoading = false;
	let errorMsg = null;
	
	onMount(async () => {
		// Fetch fresh data including username, which might not be in the token payload
		try {
			const res = await fetch('/api/auth/me');
			if (res.ok) {
				const data = await res.json();
				name = data.user.name;
				username = data.user.username;
				previewUrl = data.user.profile_image_url;
			}
		} catch (e) {
			console.error("Failed to fetch user info", e);
		}
	});
	
	function handleImageChange(event) {
		const file = event.target.files[0];
		if (file) {
			newImageFile = file;
			previewUrl = URL.createObjectURL(file);
		}
	}
	
	async function handleSubmit() {
		isLoading = true;
		errorMsg = null;
		
		const formData = new FormData();
		if (name !== user.name) formData.append('name', name);
		if (username) formData.append('username', username);
		if (password) formData.append('password', password);
		if (newImageFile) formData.append('profile_photo', newImageFile);
		
		try {
			const res = await fetch('/api/auth/profile', {
				method: 'PUT',
				body: formData
			});
			
			const result = await res.json();
			if (!res.ok) {
				errorMsg = result.error || 'Failed to update profile';
			} else {
				// Close and hard reload to get everything fresh (nav, token, layout user data)
				$isProfileModalOpen = false;
				window.location.reload();
			}
		} catch (e) {
			errorMsg = e.message;
		} finally {
			isLoading = false;
		}
	}
	
	function close() {
		$isProfileModalOpen = false;
	}
</script>

{#if $isProfileModalOpen}
	<div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all" role="dialog" aria-modal="true">
		<div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
			<!-- Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
				<div>
					<h2 class="text-lg font-bold text-slate-800 dark:text-white">My Profile</h2>
					<p class="text-sm text-slate-500">Update your account settings</p>
				</div>
				<button on:click={close} class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all shadow-sm">
					<span class="material-symbols-outlined text-[20px]">close</span>
				</button>
			</div>
			
			<!-- Body -->
			<div class="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
				{#if errorMsg}
					<div class="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
						<span class="material-symbols-outlined text-[18px]">error</span>
						<span>{errorMsg}</span>
					</div>
				{/if}
				
				<form on:submit|preventDefault={handleSubmit} class="space-y-5">
					
					<!-- Avatar Preview & Upload -->
					<div class="flex flex-col items-center gap-4">
						<div class="relative group cursor-pointer">
							<div class="size-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800 flex justify-center items-center overflow-hidden">
								{#if previewUrl}
									<img src={previewUrl} alt={name || user?.name} class="w-full h-full object-cover" />
								{:else}
									<span class="text-3xl font-bold text-slate-400 uppercase">{name?.[0] || user?.name?.[0] || 'U'}</span>
								{/if}
							</div>
							<label class="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]">
								<span class="material-symbols-outlined">photo_camera</span>
								<input type="file" accept="image/*" class="hidden" on:change={handleImageChange} />
							</label>
						</div>
						<div class="text-center">
							<label class="text-sm text-primary font-medium cursor-pointer hover:underline">
								Change Photo
								<input type="file" accept="image/*" class="hidden" on:change={handleImageChange} />
							</label>
						</div>
					</div>
					
					<!-- Form Fields -->
					<div class="space-y-4">
						<div>
							<label for="name" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
							<div class="relative">
								<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">person</span>
								<input type="text" id="name" bind:value={name} placeholder="Your name" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all" required />
							</div>
						</div>
						
						<div>
							<label for="username" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
							<div class="relative">
								<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">alternate_email</span>
								<input type="text" id="username" bind:value={username} placeholder="Your unique username" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all" required />
							</div>
						</div>
						
						<div>
							<label for="password" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
							<div class="relative">
								<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
								<input type="password" id="password" bind:value={password} placeholder="Leave blank to keep current" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all" />
							</div>
							<p class="text-[11px] text-slate-500 mt-1.5 ml-1">Optional. Only fill this if you want to change your password.</p>
						</div>
					</div>
					
					<!-- Footer Actions -->
					<div class="pt-4 flex gap-3">
						<button type="button" on:click={close} class="flex-1 py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
							Cancel
						</button>
						<button type="submit" disabled={isLoading} class="flex-1 py-2.5 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
							{#if isLoading}
								<span class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
								Saving...
							{:else}
								Save Changes
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
