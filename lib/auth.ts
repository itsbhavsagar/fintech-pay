import { compare, hash } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { UserDto } from "@/types/domain";

const authCookieName = "paysense_token";
const tokenTtl = "7d";

type TokenUser = {
  id: string;
  email: string;
};

type SessionUser = UserDto;

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

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

export async function signAuthToken(user: TokenUser): Promise<string> {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(tokenTtl)
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token: string): Promise<TokenUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const email = payload.email;

    if (typeof payload.sub !== "string" || typeof email !== "string") {
      return null;
    }

    return {
      id: payload.sub,
      email,
    };
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string, rememberMe: boolean = false): void {
  response.cookies.set(authCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 7 } : {}),
  });
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

  const verifiedToken = await verifyAuthToken(token);

  if (!verifiedToken) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: verifiedToken.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      businessName: true,
      apiKey: true,
      webhookUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    throw new AuthError();
  }

  return user;
}

export function getAuthCookieName(): string {
  return authCookieName;
}
