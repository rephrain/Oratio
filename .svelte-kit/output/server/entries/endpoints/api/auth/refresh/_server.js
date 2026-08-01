import { j as json } from "../../../../../chunks/index.js";
import { rotateRefreshToken } from "../../../../../chunks/auth.js";
async function POST({ request, cookies }) {
  const refreshToken = cookies.get("refresh_token");
  const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent");
  const isProd = process.env.NODE_ENV === "production";
  if (!refreshToken) {
    return json({ error: "Refresh token cookie missing" }, { status: 401 });
  }
  try {
    const { accessToken, newRefreshToken, user } = await rotateRefreshToken(refreshToken, {
      userAgent,
      ipAddress
    });
    cookies.set("auth_token", accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 15 * 60
      // 15 minutes
    });
    if (newRefreshToken) {
      cookies.set("refresh_token", newRefreshToken, {
        path: "/api/auth/refresh",
        httpOnly: true,
        sameSite: "strict",
        secure: isProd,
        maxAge: 7 * 24 * 60 * 60
        // 7 days
      });
    }
    return json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role, doctor_code: user.doctor_code, profile_image_url: user.profile_image_url }
    });
  } catch (err) {
    cookies.delete("auth_token", { path: "/" });
    cookies.delete("refresh_token", { path: "/api/auth/refresh" });
    return json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}
export {
  POST
};
