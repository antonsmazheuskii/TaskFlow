import { useEffect, useState } from 'react'
import {
  createTask as createTaskRequest,
  deleteTask as deleteTaskRequest,
  fetchTasksByBoardId,
  moveTaskToColumn as moveTaskToColumnRequest,
  reorderTasksInColumn as reorderTasksInColumnRequest,
  updateTaskDetails as updateTaskDetailsRequest,
} from '../services/tasksService'
import type { Task, TaskDetailsUpdate } from '../types/task'

type UseTasksResult = {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  createTask: (columnId: string, title: string) => Promise<void>
  updateTaskDetails: (
    taskId: string,
    details: TaskDetailsUpdate,
  ) => Promise<void>
  moveTaskToColumn: (
    taskId: string,
    targetColumnId: string,
    targetIndex?: number,
  ) => Promise<void>
  reorderTasksInColumn: (
    columnId: string,
    orderedTaskIds: string[],
  ) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
}

function sortByPosition(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.position - b.position)
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

  async function updateTaskDetails(
    taskId: string,
    details: TaskDetailsUpdate,
  ) {
    const previousTasks = tasks
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: details.title.trim(),
              description: details.description,
              priority: details.priority,
              due_date: details.due_date,
              assignee_id: details.assignee_id,
            }
          : task,
      ),
    )

    try {
      const updatedTask = await updateTaskDetailsRequest(taskId, details)
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? updatedTask : task)),
      )
    } catch (err) {
      setTasks(previousTasks)
      throw err
    }
  }

  async function moveTaskToColumn(
    taskId: string,
    targetColumnId: string,
    targetIndex?: number,
  ) {
    const previousTasks = tasks
    const movingTask = tasks.find((task) => task.id === taskId)

    if (!movingTask || movingTask.column_id === targetColumnId) {
      return
    }

    const siblings = sortByPosition(
      tasks.filter(
        (task) => task.column_id === targetColumnId && task.id !== taskId,
      ),
    )
    const insertIndex =
      targetIndex === undefined
        ? siblings.length
        : Math.max(0, Math.min(targetIndex, siblings.length))

    const optimisticTarget = [
      ...siblings.slice(0, insertIndex),
      { ...movingTask, column_id: targetColumnId },
      ...siblings.slice(insertIndex),
    ].map((task, position) => ({ ...task, position }))

    setTasks((current) => [
      ...current.filter(
        (task) =>
          task.id !== taskId && task.column_id !== targetColumnId,
      ),
      ...optimisticTarget,
    ])

    try {
      const updatedTargetTasks = await moveTaskToColumnRequest(
        taskId,
        targetColumnId,
        targetIndex,
      )

      setTasks((current) => [
        ...current.filter(
          (task) =>
            task.id !== taskId && task.column_id !== targetColumnId,
        ),
        ...updatedTargetTasks,
      ])
    } catch (err) {
      setTasks(previousTasks)
      throw err
    }
  }

  async function reorderTasksInColumn(
    columnId: string,
    orderedTaskIds: string[],
  ) {
    const previousTasks = tasks
    const columnTaskMap = new Map(
      tasks
        .filter((task) => task.column_id === columnId)
        .map((task) => [task.id, task]),
    )

    const optimistic = orderedTaskIds
      .map((id, position) => {
        const task = columnTaskMap.get(id)
        return task ? { ...task, position } : null
      })
      .filter((task): task is Task => task !== null)

    setTasks((current) => [
      ...current.filter((task) => task.column_id !== columnId),
      ...optimistic,
    ])

    try {
      const updatedTasks = await reorderTasksInColumnRequest(
        columnId,
        orderedTaskIds,
      )
      setTasks((current) => [
        ...current.filter((task) => task.column_id !== columnId),
        ...updatedTasks,
      ])
    } catch (err) {
      setTasks(previousTasks)
      throw err
    }
  }

  async function deleteTask(taskId: string) {
    const previousTasks = tasks
    setTasks((current) => current.filter((task) => task.id !== taskId))

    try {
      await deleteTaskRequest(taskId)
    } catch (err) {
      setTasks(previousTasks)
      throw err
    }
  }

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTaskDetails,
    moveTaskToColumn,
    reorderTasksInColumn,
    deleteTask,
  }
}
