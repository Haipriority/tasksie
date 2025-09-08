"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Task } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { deleteTask } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface TaskListProps {
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
}

export function TaskList({ tasks, onTasksChange }: TaskListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleEditTask = (taskId: string) => {
    console.log("Editing task with ID:", taskId)
    router.push(`/tasks/${taskId}/edit`)
  }

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return

    setIsDeleting(true)
    try {
      await deleteTask(taskToDelete)
      onTasksChange(tasks.filter((task) => task.id !== taskToDelete))
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline">Open</Badge>
      case "in-progress":
        return <Badge variant="secondary">In Progress</Badge>
      case "completed":
        return <Badge variant="default">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="font-medium text-lg mb-1">{task.title}</h3>
                <div className="flex items-center gap-2">
                  {getStatusBadge(task.status)}
                  {task.createdAt && (
                    <span className="text-xs text-muted-foreground">Created: {formatDate(task.createdAt)}</span>
                  )}
                </div>
                {task.description && <p className="text-muted-foreground mt-2">{task.description}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 px-6 py-3 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditTask(task.id)}
              className="flex items-center gap-1"
            >
              <Edit size={14} />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteClick(task.id)}
              className="flex items-center gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

