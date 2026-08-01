import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { refreshTokens } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { hashToken, revokeFamily, logAuthEvent } from '$lib/server/auth.js';

export async function POST({ request, cookies, locals }) {
	const refreshToken = cookies.get('refresh_token');
	const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
	const userAgent = request.headers.get('user-agent');
	const userId = locals?.user?.id || null;

	if (refreshToken) {
		const tokenHash = hashToken(refreshToken);
		const [tokenRecord] = await db.select().from(refreshTokens)
			.where(eq(refreshTokens.token_hash, tokenHash))
			.limit(1);

		if (tokenRecord) {
			await revokeFamily(tokenRecord.family_id);
		}
	}

	await logAuthEvent('LOGOUT', { userId, ipAddress, userAgent });

	cookies.delete('auth_token', { path: '/' });
	cookies.delete('refresh_token', { path: '/api/auth/refresh' });

	return json({ success: true });
}
