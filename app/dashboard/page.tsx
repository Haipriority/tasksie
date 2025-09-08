"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskList } from "@/components/task-list"
import { Plus, LogOut } from "lucide-react"
import type { Task } from "@/types"
import { fetchTasks } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    console.log("Current user:", user)
    if (!user) {
      router.push("/login")
      return
    }

    const loadTasks = async () => {
      try {
        const data = await fetchTasks()
        setTasks(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [user, router, toast])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleCreateTask = () => {
    router.push("/tasks/new")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={handleCreateTask} className="flex items-center gap-2">
            <Plus size={16} />
            New Task
          </Button>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>Manage and track your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks found. Create your first task to get started.
            </div>
          ) : (
            <TaskList tasks={tasks} onTasksChange={setTasks} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

