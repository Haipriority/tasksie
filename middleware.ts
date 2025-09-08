// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Paths
const protectedPaths = ["/dashboard", "/tasks"];
const authPaths = ["/login", "/register"];

async function isValidJWT(token: string | undefined) {
  if (!token) return false;
  const secret = process.env.JWT_SECRET; // must be defined
  if (!secret) {
    // Fail closed if secret missing
    return false;
  }
  try {
    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key); // throws on invalid/expired
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedPath =
    protectedPaths.some(p => path === p || path.startsWith(`${p}/`));

  const isAuthPath =
    authPaths.some(p => path === p); // only exact /login or /register

  const token = request.cookies.get("token")?.value;

  const authenticated = await isValidJWT(token);

  // If visiting a protected path and not authenticated → redirect to login
  if (isProtectedPath && !authenticated) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  // If visiting login/register and already authenticated → go to dashboard
  if (isAuthPath && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/login", "/register"],
};
