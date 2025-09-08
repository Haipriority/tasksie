// app/api/tasks/route.ts
import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth-utils";

// jsonwebtoken not needed if we just forward; keep Node runtime if you use other Node libs
export const runtime = "nodejs";

const API_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:3001"; // include global prefix here if you use one, e.g. http://localhost:3001/api

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function forwardJson(res: Response) {
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text ? { message: text } : null;
  }
  return NextResponse.json(data ?? {}, { status: res.status });
}

// ---- GET /api/tasks ---- (list current user's tasks)
export async function GET(request: Request) {
  try {
    const token = getAuthToken(request);
    if (!token) return unauthorized();

    const res = await fetch(`${API_URL}/tasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return forwardJson(res);
  } catch (error) {
    console.error("Proxy GET /tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---- POST /api/tasks ---- (create a task)
export async function POST(request: Request) {
  try {
    const token = getAuthToken(request);
    if (!token) return unauthorized();

    const body = await request.json().catch(() => ({}));
    // Optional light validation (backend should also validate)
    if (!body?.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body), // { title, description?, status? }
    });

    return forwardJson(res);
  } catch (error) {
    console.error("Proxy POST /tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
