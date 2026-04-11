import { error, json } from '@sveltejs/kit';
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

export async function DELETE({ params }) {
	const [doc] = await db.select()
		.from(documents)
		.where(eq(documents.id, params.id))
		.limit(1);

	if (!doc) {
		throw error(404, 'Document not found');
	}

	try {
		// Attempt to delete from filesystem if path exists
		if (doc.file_path) {
			try {
				const { unlink } = await import('fs/promises');
				await unlink(doc.file_path);
			} catch (fsErr) {
				console.warn('Could not delete file from filesystem:', fsErr);
				// Continue even if FS delete fails, to clean up DB
			}
		}

		await db.delete(documents).where(eq(documents.id, params.id));

		return json({ success: true });
	} catch (err) {
		console.error('DELETE /api/documents/[id] error:', err);
		throw error(500, 'Failed to delete document');
	}
}
