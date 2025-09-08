// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth-utils";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function GET(request: Request) {
  try {
    // 1) get token from cookie/header
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) call your Nest backend
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,   // <-- forward JWT
        "Content-Type": "application/json",
      },
      // cache: "no-store", // optional
    });

    // 3) bubble up backend status/message
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
