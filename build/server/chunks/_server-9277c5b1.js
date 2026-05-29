import { e as error, j as json } from './index-d7f43214.js';
import { readFile } from 'fs/promises';
import 'path';
import { d as db, g as documents } from './index3-c9b0a838.js';
import { eq } from 'drizzle-orm';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';

async function GET({ params }) {
  const [doc] = await db.select().from(documents).where(eq(documents.id, params.id)).limit(1);
  if (!doc) {
    throw error(404, "Document not found");
  }
  try {
    const filePath = doc.file_path;
    const content = await readFile(filePath);
    return new Response(content, {
      headers: {
        "Content-Type": doc.mime_type || "application/octet-stream",
        "Content-Disposition": `inline; filename="${doc.file_name}"`
      }
    });
  } catch (err) {
    console.error("File serving error:", err);
    throw error(500, "Failed to read file");
  }
}
async function DELETE({ params }) {
  const [doc] = await db.select().from(documents).where(eq(documents.id, params.id)).limit(1);
  if (!doc) {
    throw error(404, "Document not found");
  }
  try {
    if (doc.file_path) {
      try {
        const { unlink } = await import('fs/promises');
        await unlink(doc.file_path);
      } catch (fsErr) {
        console.warn("Could not delete file from filesystem:", fsErr);
      }
    }
    await db.delete(documents).where(eq(documents.id, params.id));
    return json({ success: true });
  } catch (err) {
    console.error("DELETE /api/documents/[id] error:", err);
    throw error(500, "Failed to delete document");
  }
}

export { DELETE, GET };
//# sourceMappingURL=_server-9277c5b1.js.map
