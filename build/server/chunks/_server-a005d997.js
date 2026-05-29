import { j as json } from './index-d7f43214.js';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { d as db, g as documents, u as users } from './index3-c9b0a838.js';
import { eq } from 'drizzle-orm';
import { hashPasswordAsync, createToken } from './auth-c426d006.js';
import 'postgres';
import 'drizzle-orm/postgres-js';
import 'drizzle-orm/pg-core';
import 'jose';
import 'argon2';

async function PUT({ request, locals, cookies }) {
  if (!locals.user) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const username = formData.get("username");
    const password = formData.get("password");
    const file = formData.get("profile_photo");
    const currentUserId = locals.user.id;
    const updateValues = {};
    if (name)
      updateValues.name = name;
    if (username)
      updateValues.username = username;
    if (password && password.trim() !== "") {
      updateValues.password_hash = await hashPasswordAsync(password);
    }
    if (file && file instanceof File && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const id = globalThis.crypto.randomUUID();
      const extension = file.name.split(".").pop() || "png";
      const fileName = `${id}.${extension}`;
      const uploadsDir = join(process.cwd(), "uploads");
      const filePath = join(uploadsDir, fileName);
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(filePath, buffer);
      const docValues = {
        id,
        document_type: "profile_photo",
        file_name: file.name,
        file_path: filePath,
        mime_type: file.type,
        file_size: file.size,
        uploaded_by: currentUserId
      };
      await db.insert(documents).values(docValues);
      updateValues.profile_image_url = `/api/documents/${id}`;
    }
    if (Object.keys(updateValues).length === 0) {
      return json({ message: "No changes provided" });
    }
    updateValues.updated_at = /* @__PURE__ */ new Date();
    const [updatedUser] = await db.update(users).set(updateValues).where(eq(users.id, currentUserId)).returning();
    const token = await createToken(updatedUser);
    cookies.set("auth_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60
      // 1 hour
    });
    return json({ success: true, user: { id: updatedUser.id, name: updatedUser.name, role: updatedUser.role, profile_image_url: updatedUser.profile_image_url } });
  } catch (error) {
    console.error("Profile update error:", error);
    if (error.code === "23505") {
      return json({ error: "Username already taken." }, { status: 400 });
    }
    return json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export { PUT };
//# sourceMappingURL=_server-a005d997.js.map
