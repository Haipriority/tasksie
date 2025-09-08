// app/api/auth/login/route.ts (Next.js App Router)
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
// If your Nest app has a global prefix (e.g. 'api'), put it in BACKEND_URL: http://localhost:3001/api

export const runtime = "nodejs"; // optional

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Call your Nest backend: POST /auth/login (LocalAuthGuard)
    // Send both email and username for compatibility with passport-local
    console.log("Logging in user:", { email, password });
    let user = { email:email, password:password }
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(user),
    });

    const data = await res.json().catch(() => ({}));
    const out = NextResponse.json(data, { status: res.status });

    // If backend returns a token, set it as an HttpOnly cookie for the app
    // Common keys: access_token, token, jwt
    const token =
      (data && (data.access_token || data.token || data.jwt)) ?? null;

    console.log("Received token from backend:", token);

    if (token && res.ok) {
      out.cookies.set("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });
    }

    return out;
  } catch (err) {
    console.error("Login proxy error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
