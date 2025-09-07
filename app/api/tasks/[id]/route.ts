// app/api/tasks/[id]/route.ts
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { getAuthToken } from "@/lib/auth-utils";

export const runtime = "nodejs"; // jsonwebtoken requires Node

// helper to extract userId from token
function getUserIdFromToken(token: string): string | null {
  try {
    const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
    return decoded?.userId ?? decoded?.sub ?? null;
  } catch {
    return null;
  }
}

const API_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:3001"; // include global prefix here if you use one (e.g. http://localhost:3001/api)

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
function invalidToken() {
  return NextResponse.json({ error: "Invalid token" }, { status: 401 });
}

function requireAuth(request: Request): { token: string } | NextResponse {
  const token = getAuthToken(request);
  if (!token) return unauthorized();
  try {
    // optional local verification; remove if you only want to forward
    verify(token, process.env.JWT_SECRET || "your-secret-key");
    return { token };
  } catch {
    return invalidToken();
  }
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

// ---- GET /api/tasks/[id] ----
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(_request);
    if (auth instanceof NextResponse) return auth;
    // no need to re-verify token here if you want—backend will enforce auth
    const res = await fetch(`${API_URL}/tasks/${params.id}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
       },
      cache: "no-store",
    });
    // console.log("Fetching task wirh ID:", params.id);
    return forwardJson(res);
  } catch (err) {
    console.error("Proxy GET task error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---- PATCH /api/tasks/[id] ----
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json().catch(() => ({}));

    console.log("Edit")

    const res = await fetch(`${API_URL}/tasks/${params.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(body),
    });

    return forwardJson(res);
  } catch (err) {
    console.error("Proxy PATCH task error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// app/api/tasks/[id]/route.ts (DELETE)

function userIdFromToken(token: string): string | null {
  try {
    const decoded: any = verify(token, process.env.JWT_SECRET || "your-secret-key");
    return decoded?.userId ?? decoded?.sub ?? null;
  } catch {
    return null;
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof NextResponse) return auth;

    const urlObj = new URL(request.url);
    const qsUserId = urlObj.searchParams.get("userId");
    const tokenUserId = userIdFromToken(auth.token);
    const userId = qsUserId ?? tokenUserId;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Preferred: query-param style (avoids 404 when backend doesn’t define a path param)
    const backendUrl = `${API_URL}/tasks/${encodeURIComponent(params.id)}?userId=${encodeURIComponent(userId)}`;


    // If your Nest route is /tasks/:id/:userId instead, use this:
    // const backendUrl = `${API_URL}/tasks/${encodeURIComponent(params.id)}/${encodeURIComponent(userId)}`;

    // Helpful debugging log (appears in Next server logs)
    console.log("[DELETE /api/tasks/[id]] →", backendUrl);

    const res = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    return forwardJson(res);
  } catch (err) {
    console.error("Proxy DELETE task error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
