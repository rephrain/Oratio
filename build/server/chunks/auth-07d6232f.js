import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-in-production");
const JWT_EXPIRY = "1h";
async function createToken(user) {
  const payload = {
    sub: user.id,
    name: user.name,
    role: user.role,
    doctor_code: user.doctor_code || null
  };
  return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(JWT_EXPIRY).sign(JWT_SECRET);
}
async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}
async function hashPasswordAsync(password) {
  const { createHash } = await import('crypto');
  return createHash("sha256").update(password).digest("hex");
}
async function verifyPassword(password, hash) {
  const hashed = await hashPasswordAsync(password);
  return hashed === hash;
}

export { verifyPassword as a, createToken as c, verifyToken as v };
//# sourceMappingURL=auth-07d6232f.js.map
