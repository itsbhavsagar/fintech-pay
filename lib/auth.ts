import { compare, hash } from "bcryptjs";
import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { UserDto } from "@/types/domain";

import { AUTH_COOKIE_NAME } from "@/lib/brand";

const authCookieName = AUTH_COOKIE_NAME;
const tokenTtl = "7d";

type SessionUser = UserDto;

type SessionRow = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  businessName: string | null;
  apiKey: string;
  webhookUrl: string | null;
  createdAt: Date;
};

export class AuthError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthError";
  }
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export function toSessionUser(user: SessionRow): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    businessName: user.businessName,
    apiKey: user.apiKey,
    webhookUrl: user.webhookUrl,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

export async function signAuthToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    image: user.image,
    businessName: user.businessName,
    apiKey: user.apiKey,
    webhookUrl: user.webhookUrl,
    createdAt: user.createdAt,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(tokenTtl)
    .sign(getJwtSecret());
}

function sessionFromPayload(payload: JWTPayload): SessionUser | null {
  if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
    return null;
  }

  if (typeof payload.apiKey !== "string" || typeof payload.createdAt !== "string") {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    name: typeof payload.name === "string" ? payload.name : null,
    image: typeof payload.image === "string" ? payload.image : null,
    businessName: typeof payload.businessName === "string" ? payload.businessName : null,
    apiKey: payload.apiKey,
    webhookUrl: typeof payload.webhookUrl === "string" ? payload.webhookUrl : null,
    createdAt: payload.createdAt,
  };
}

export async function verifyAuthToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return sessionFromPayload(payload);
  } catch {
    return null;
  }
}

export function setAuthCookie(
  response: NextResponse,
  token: string,
  rememberMe: boolean = false,
): void {
  response.cookies.set(authCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 7 } : {}),
  });
}

export async function attachSessionCookie(
  response: NextResponse,
  user: SessionUser,
  rememberMe: boolean = false,
): Promise<void> {
  const token = await signAuthToken(user);
  setAuthCookie(response, token, rememberMe);
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(authCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    throw new AuthError();
  }

  return user;
}

export async function requireSessionUserId(): Promise<string> {
  const user = await requireSessionUser();
  return user.id;
}

export const sessionUserSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
  businessName: true,
  apiKey: true,
  webhookUrl: true,
  createdAt: true,
} as const;
