import { verify } from "jsonwebtoken"

// Get auth token from request headers
export function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  return authHeader.split(" ")[1]
}

// Verify JWT token and return decoded payload
export function verifyToken(token: string) {
  console.log("Verifying jwt:", process.env.JWT_SECRET)
  try {
    return verify(token, process.env.JWT_SECRET || "your-secret-key")
  } catch (error) {
    return error
  }
}

// Middleware to check if user is authenticated
export function isAuthenticated(handler: Function) {
  return async (request: Request) => {
    const token = getAuthToken(request)
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
    // Add user to request
    ;(request as any).user = decoded

    return handler(request)
  }
}

