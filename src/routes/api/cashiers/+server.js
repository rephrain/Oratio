import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';

export async function GET({ url }) {
	const activeOnly = url.searchParams.get('active') !== 'false';

	let conditions = [eq(users.role, 'kasir')];
	if (activeOnly) conditions.push(eq(users.is_active, true));

	const cashiers = await db.select({
		id: users.id,
		name: users.name,
		profile_image_url: users.profile_image_url,
		is_active: users.is_active
	}).from(users).where(and(...conditions));

	return json({ cashiers });
}
