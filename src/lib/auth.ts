import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { JWTPayload, AuthUser } from "@/types";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-in-production"
);

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("eq_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireSession(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export function userToAuth(user: {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string | null;
  points: number;
  level: number;
  xp: number;
  streak: number;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    points: user.points,
    level: user.level,
    xp: user.xp,
    streak: user.streak,
  };
}
