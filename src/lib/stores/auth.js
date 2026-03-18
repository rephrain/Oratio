import { writable, derived } from 'svelte/store';

export const currentUser = writable(null);
export const isAuthenticated = derived(currentUser, $user => !!$user);
export const userRole = derived(currentUser, $user => $user?.role || null);

export async function loadUser() {
	try {
		const res = await fetch('/api/auth/me');
		if (res.ok) {
			const data = await res.json();
			currentUser.set(data.user);
			return data.user;
		} else {
			currentUser.set(null);
			return null;
		}
	} catch {
		currentUser.set(null);
		return null;
	}
}

export async function logout() {
	await fetch('/api/auth/logout', { method: 'POST' });
	currentUser.set(null);
	window.location.href = '/login';
}
