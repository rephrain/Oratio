process.env.TZ = 'Asia/Jakarta';
import '$lib/server/cron.js'; 
import { verifyToken, rotateRefreshToken, revokeAllUserSessions } from '$lib/server/auth.js';
import { db } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/refresh'];
const ROLE_PATHS = {
	admin: '/admin',
	kasir: '/kasir',
	dokter: '/dokter',
	suster: '/suster'
};

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const path = event.url.pathname;
	if (PUBLIC_PATHS.some(p => path.startsWith(p))) {
		return resolve(event);
	}

	if (path.startsWith('/_app') || path.startsWith('/favicon')) {
		return resolve(event);
	}

	let token = event.cookies.get('auth_token');
	let payload = token ? await verifyToken(token) : null;
	const isProd = process.env.NODE_ENV === 'production';

	// Transparent refresh attempt if access token missing or expired
	if (!payload) {
		const refreshToken = event.cookies.get('refresh_token');
		if (refreshToken) {
			try {
				const userAgent = event.request.headers.get('user-agent');
				const ipAddress = event.request.headers.get('x-forwarded-for') || '127.0.0.1';
				const refreshed = await rotateRefreshToken(refreshToken, { userAgent, ipAddress });

				token = refreshed.accessToken;
				payload = await verifyToken(token);

				event.cookies.set('auth_token', refreshed.accessToken, {
					path: '/',
					httpOnly: true,
					sameSite: 'lax',
					secure: isProd,
					maxAge: 15 * 60
				});

				if (refreshed.newRefreshToken) {
					event.cookies.set('refresh_token', refreshed.newRefreshToken, {
						path: '/api/auth/refresh',
						httpOnly: true,
						sameSite: 'strict',
						secure: isProd,
						maxAge: 7 * 24 * 60 * 60
					});
				}
			} catch (err) {
				event.cookies.delete('auth_token', { path: '/' });
				event.cookies.delete('refresh_token', { path: '/api/auth/refresh' });
			}
		}
	}

	if (!payload) {
		if (path.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		return Response.redirect(`${event.url.origin}/login`, 302);
	}

	// Verify user still exists in database and is active
	let dbUser;
	try {
		[dbUser] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
	} catch (err) {
		console.error('[Hooks] Database error:', err);
		return new Response(JSON.stringify({ 
			error: 'Internal Server Error', 
			message: err.message,
			stack: err.stack,
			payload_sub: payload.sub
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (!dbUser || !dbUser.is_active) {
		if (dbUser) {
			await revokeAllUserSessions(dbUser.id);
		}
		event.cookies.delete('auth_token', { path: '/' });
		event.cookies.delete('refresh_token', { path: '/api/auth/refresh' });
		if (path.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: 'Session expired or account deactivated' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		return Response.redirect(`${event.url.origin}/login`, 302);
	}

	event.locals.user = {
		id: dbUser.id,
		name: dbUser.name,
		role: dbUser.role,
		doctor_code: dbUser.doctor_code,
		profile_image_url: dbUser.profile_image_url
	};

	// Role-based access control
	if (!path.startsWith('/api/chat')) {
		for (const [role, prefix] of Object.entries(ROLE_PATHS)) {
			if (path.startsWith(prefix) && payload.role !== role) {
				if (path.startsWith('/api/')) {
					return new Response(JSON.stringify({ error: 'Forbidden' }), {
						status: 403,
						headers: { 'Content-Type': 'application/json' }
					});
				}
				return Response.redirect(`${event.url.origin}/${payload.role}`, 302);
			}
		}
	}

	if (path === '/') {
		return Response.redirect(`${event.url.origin}/${payload.role}`, 302);
	}

	return resolve(event);
}
