<script>
	import { goto } from '$app/navigation';

	let username = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleLogin() {
		error = '';
		loading = true;

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});

			const data = await res.json();

			if (!res.ok) {
				error = data.error || 'Login gagal';
				loading = false;
				return;
			}

			// Redirect by role
			const roleRoutes = { admin: '/admin', kasir: '/kasir', dokter: '/dokter' };
			goto(roleRoutes[data.user.role] || '/');
		} catch (err) {
			error = 'Terjadi kesalahan jaringan';
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login — Oratio Dental</title>
</svelte:head>

<div class="login-page">
	<div class="login-card">
		<div class="logo">O</div>
		<h1>Oratio Dental</h1>
		<p class="subtitle">Sistem Rekam Medis Kedokteran Gigi</p>

		{#if error}
			<div class="alert-error">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
				</svg>
				{error}
			</div>
		{/if}

		<form on:submit|preventDefault={handleLogin}>
			<div class="form-group" style="margin-bottom: var(--space-4)">
				<label class="form-label" for="username">Username</label>
				<input
					id="username"
					type="text"
					class="form-input"
					bind:value={username}
					placeholder="Masukkan username"
					required
					autocomplete="username"
				/>
			</div>

			<div class="form-group" style="margin-bottom: var(--space-6)">
				<label class="form-label" for="password">Password</label>
				<input
					id="password"
					type="password"
					class="form-input"
					bind:value={password}
					placeholder="Masukkan password"
					required
					autocomplete="current-password"
				/>
			</div>

			<button type="submit" class="btn btn-primary btn-lg w-full" disabled={loading}>
				{#if loading}
					<span class="spinner"></span>
					Memproses...
				{:else}
					Masuk
				{/if}
			</button>
		</form>

		<p class="footer-text">© 2024 Oratio Dental Clinic</p>
	</div>
</div>

<style>
	.alert-error {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		background: var(--danger-light);
		color: #991B1B;
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		margin-bottom: var(--space-4);
		animation: slideUp 200ms ease;
	}
	.footer-text {
		text-align: center;
		color: var(--text-secondary);
		font-size: var(--font-size-xs);
		margin-top: var(--space-6);
	}
</style>
