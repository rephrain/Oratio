import { json } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { db } from '$lib/server/db/index.js';
import { documents } from '$lib/server/db/schema.js';

export async function POST({ request, locals }) {
	try {
		const formData = await request.formData();
		const file = formData.get('file');
		const patientId = formData.get('patient_id');
		const encounterId = formData.get('encounter_id');
		const documentType = formData.get('document_type') || 'clinical_photo';

		if (!file || !(file instanceof File)) {
			console.warn('Upload attempt with no file or invalid file instance');
			return json({ error: 'No file uploaded' }, { status: 400 });
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const id = globalThis.crypto.randomUUID();
		const originalName = file.name;
		const extension = originalName.split('.').pop();
		const fileName = `${id}.${extension}`;
		
		// Use process.cwd() for consistent paths in Docker/Node environments
		const uploadsDir = join(process.cwd(), 'uploads');
		const filePath = join(uploadsDir, fileName);

		// Ensure directory exists
		await mkdir(uploadsDir, { recursive: true });

		// Save file to disk
		await writeFile(filePath, buffer);

		// Record in database
		const values = {
			id: id,
			patient_id: patientId || null,
			encounter_id: encounterId || null,
			document_type: documentType,
			file_name: originalName,
			file_path: filePath,
			mime_type: file.type,
			file_size: file.size,
			uploaded_by: locals.user?.id || null
		};

		const [doc] = await db.insert(documents).values(values).returning();

		return json({ id: doc.id, fileName: doc.file_name });
	} catch (error) {
		console.error('CRITICAL: File upload error:', error);
		return json({ 
			error: 'Failed to save document', 
			details: error.message 
		}, { status: 500 });
	}
}

