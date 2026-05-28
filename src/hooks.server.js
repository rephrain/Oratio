process.env.TZ = 'Asia/Jakarta';
import '$lib/server/cron.js';
import { verifyToken } from '$lib/server/auth.js';
import { redirect } from '@sveltejs/kit';

const PUBLIC_PATHS = ['/login', '/api/auth/login'];
const ROLE_PATHS = {
	admin: '/admin',
	kasir: '/kasir',
	dokter: '/dokter'
};

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Allow public paths
	const path = event.url.pathname;
	if (PUBLIC_PATHS.some(p => path.startsWith(p))) {
		return resolve(event);
	}

	// Allow static assets
	if (path.startsWith('/_app') || path.startsWith('/favicon')) {
		return resolve(event);
	}

	// Check JWT token
	const token = event.cookies.get('auth_token');
	if (!token) {
		if (path.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		throw redirect(302, '/login');
	}

	const payload = await verifyToken(token);
	if (!payload) {
		event.cookies.delete('auth_token', { path: '/' });
		if (path.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: 'Invalid token' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		throw redirect(302, '/login');
	}

	let dbUser;

	try {
		const { db } = await import('$lib/server/db/index.js');
		const { users } = await import('$lib/server/db/schema.js');
		const { eq } = await import('drizzle-orm');

		const result = await db
			.select()
			.from(users)
			.where(eq(users.id, payload.sub))
			.limit(1);

		dbUser = result[0];
	} catch (err) {
		console.error('DB ERROR:', err);

		event.cookies.delete('auth_token', { path: '/' });

		if (path.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: 'Database error' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		throw redirect(302, '/login');
	}

	// Attach user to event.locals
	event.locals.user = {
		id: dbUser.id,
		name: dbUser.name,
		role: dbUser.role,
		doctor_code: dbUser.doctor_code,
		profile_image_url: dbUser.profile_image_url
	};

	// Role-based access control
	// Chat API is accessible by both dokter and kasir
	if (!path.startsWith('/api/chat')) {
		for (const [role, prefix] of Object.entries(ROLE_PATHS)) {
			if (path.startsWith(prefix) && payload.role !== role) {
				if (path.startsWith('/api/')) {
					return new Response(JSON.stringify({ error: 'Forbidden' }), {
						status: 403,
						headers: { 'Content-Type': 'application/json' }
					});
				}
				throw redirect(302, `/${payload.role}`);
			}
		}
	}

	// Redirect root to role dashboard
	if (path === '/') {
		throw redirect(302, `/${payload.role}`);
	}

	return resolve(event);
}
