import type { Task } from "@/types"

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem("token")
  console.log("Using token for auth header:", token)
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

// Fetch all tasks
export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch("/api/tasks", {
    headers: getAuthHeader(),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch tasks")
  }

  return response.json()
}

// Fetch a single task by ID
export async function fetchTask(id: string): Promise<Task> {
  if (!id) throw new Error("Task id is required");

  console.log("Fetching task with ID before fetch call:", id)

  const res = await fetch(`/api/tasks/${id}`, {
    method: "GET",
    headers:getAuthHeader(), // { Authorization: `Bearer ${token}` } si existe
    credentials: "include", // envía cookies (p.ej. token) al /api/*
    cache: "no-store",
  });

  // console.log("Response after fetch call:", res)


  // Intentar parsear JSON incluso en errores
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // si no es JSON, data queda como null y usamos statusText
  }

  if (!res.ok) {
    // Mensaje prioritario: backend -> { error } o { message }
    const msg =
      data?.error ||
      data?.message ||
      (res.status === 401 ? "Unauthorized" :
       res.status === 403 ? "Forbidden" :
       res.status === 404 ? "Task not found" :
       res.statusText || "Failed to fetch task");
    // Log opcional para debug
    console.warn("fetchTask error:", { status: res.status, data });
    throw new Error(msg);
  }

  return data as Task;
}


// Create a new task
export async function createTask(data: { title: string; description: string; status: string }): Promise<Task> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create task")
  }

  return response.json()
}

// Update an existing task
export async function updateTask(
  id: string,
  data: { title: string; description: string; status: string },
): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: getAuthHeader(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update task")
  }

  return response.json()
}

// Delete a task
export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete task")
  }
}

