import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { createToken, verifyPassword } from '$lib/server/auth.js';

export async function POST({ request, cookies }) {
	const { username, password } = await request.json();

	if (!username || !password) {
		return json({ error: 'Username dan password wajib diisi' }, { status: 400 });
	}

	const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

	if (!user || !user.is_active) {
		return json({ error: 'Username atau password salah' }, { status: 401 });
	}

	const valid = await verifyPassword(password, user.password_hash);
	if (!valid) {
		return json({ error: 'Username atau password salah' }, { status: 401 });
	}

	const token = await createToken(user);

	cookies.set('auth_token', token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60 // 1 hour
	});

	return json({
		user: { id: user.id, name: user.name, role: user.role, doctor_code: user.doctor_code }
	});
}
