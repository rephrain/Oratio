import { error } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { db } from '$lib/server/db/index.js';
import { documents } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
	const [doc] = await db.select()
		.from(documents)
		.where(eq(documents.id, params.id))
		.limit(1);

	if (!doc) {
		throw error(404, 'Document not found');
	}

	try {
		const filePath = doc.file_path;
		const content = await readFile(filePath);

		return new Response(content, {
			headers: {
				'Content-Type': doc.mime_type || 'application/octet-stream',
				'Content-Disposition': `inline; filename="${doc.file_name}"`
			}
		});
	} catch (err) {
		console.error('File serving error:', err);
		throw error(500, 'Failed to read file');
	}
}
