export const load = async ({ fetch }) => {
	const res = await fetch('/api/auth/me');
	if (res.ok) {
		const data = await res.json();
		return { user: data.user };
	}
	return { user: null };
};
