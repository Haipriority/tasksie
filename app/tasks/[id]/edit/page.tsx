"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskForm } from "@/components/task-form"
import { fetchTask, updateTask } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import type { Task } from "@/types"

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const taskId = params.id

  useEffect(() => {
    console.log("Fetching task with ID:", taskId)
    const loadTask = async () => {
      try {
        const data = await fetchTask(taskId)
        setTask(data)
      } catch (error) {
        console.log("Error fetching task:", error)
        toast({
          title: "Error",
          description: "Failed to load task. Please try again.",
          variant: "destructive",
        })
        // router.push("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    loadTask()
  }, [taskId, router, toast])

  const handleSubmit = async (formData: { title: string; description: string; status: string }) => {
    setIsSubmitting(true)
    try {
      await updateTask(taskId, formData)
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto py-8 flex justify-center">Loading task...</div>
  }

  if (!task) {
    return <div className="container mx-auto py-8 flex justify-center">Task not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4 flex items-center gap-2">
        <ArrowLeft size={16} />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Task</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm
            initialData={{
              title: task.title,
              description: task.description || "",
              status: task.status,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
          />
        </CardContent>
      </Card>
    </div>
  )
}

