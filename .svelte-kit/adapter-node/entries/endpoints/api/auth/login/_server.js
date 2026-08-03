import { j as json } from "../../../../../chunks/index.js";
import { d as db, u as users } from "../../../../../chunks/index3.js";
import { eq } from "drizzle-orm";
import { logAuthEvent, verifyPassword, createToken, createRefreshToken } from "../../../../../chunks/auth.js";
async function POST({ request, cookies }) {
  const { username, password } = await request.json();
  const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent");
  if (!username || !password) {
    return json({ error: "Username dan password wajib diisi" }, { status: 400 });
  }
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!user || !user.is_active) {
    await logAuthEvent("LOGIN_FAILED", { ipAddress, userAgent, details: JSON.stringify({ username, reason: "User invalid or inactive" }) });
    return json({ error: "Username atau password salah" }, { status: 401 });
  }
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    await logAuthEvent("LOGIN_FAILED", { userId: user.id, ipAddress, userAgent, details: JSON.stringify({ username, reason: "Invalid password" }) });
    return json({ error: "Username atau password salah" }, { status: 401 });
  }
  const token = await createToken(user);
  const { rawToken: refreshToken } = await createRefreshToken({
    userId: user.id,
    userAgent,
    ipAddress
  });
  const isProd = process.env.NODE_ENV === "production";
  cookies.set("auth_token", token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 15 * 60
    // 15 minutes
  });
  cookies.set("refresh_token", refreshToken, {
    path: "/api/auth/refresh",
    httpOnly: true,
    sameSite: "strict",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60
    // 7 days
  });
  await logAuthEvent("LOGIN_SUCCESS", { userId: user.id, ipAddress, userAgent });
  return json({
    user: { id: user.id, name: user.name, role: user.role, doctor_code: user.doctor_code, profile_image_url: user.profile_image_url }
  });
}
export {
  POST
};
