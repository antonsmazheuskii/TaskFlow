import { useEffect, useState } from 'react'
import {
  createTask as createTaskRequest,
  fetchTasksByBoardId,
} from '../services/tasksService'
import type { Task } from '../types/task'

type UseTasksResult = {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  createTask: (columnId: string, title: string) => Promise<void>
}

export function useTasks(boardId: string | undefined): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadTasks() {
      if (!boardId) {
        setTasks([])
        setError(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchTasksByBoardId(boardId)

        if (!isMounted) {
          return
        }

        setTasks(data)
      } catch (err) {
        if (!isMounted) {
          return
        }

        const message =
          err instanceof Error ? err.message : 'Не удалось загрузить задачи.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTasks()

    return () => {
      isMounted = false
    }
  }, [boardId])

  async function createTask(columnId: string, title: string) {
    const task = await createTaskRequest(columnId, title)
    setTasks((current) => [...current, task])
  }

  return { tasks, isLoading, error, createTask }
}
