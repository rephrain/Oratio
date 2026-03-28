import { SignJWT, jwtVerify } from 'jose';
import argon2 from 'argon2';

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
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    // 64 MiB
    timeCost: 3,
    // 3 iterations
    parallelism: 4
  });
}
async function verifyPassword(password, hash) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export { createToken, hashPasswordAsync, verifyPassword, verifyToken };
//# sourceMappingURL=auth-436feca7.js.map
