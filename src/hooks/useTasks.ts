import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTask as createTaskRequest,
  deleteTask as deleteTaskRequest,
  fetchTasksByBoardId,
  moveTaskToColumn as moveTaskToColumnRequest,
  reorderTasksInColumn as reorderTasksInColumnRequest,
  updateTaskDetails as updateTaskDetailsRequest,
} from '../services/tasksService'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from '../providers/AuthProvider'
import type { Task, TaskDetailsUpdate } from '../types/task'
import { removeById, upsertById } from '../utils/collections'
import { getErrorMessage } from '../utils/getErrorMessage'

type UseTasksResult = {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  applyRealtimeInsert: (task: Task) => void
  applyRealtimeUpdate: (task: Task) => void
  applyRealtimeDelete: (taskId: string) => void
  applyRealtimeDeleteByColumn: (columnId: string) => void
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
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id ?? null
  const tasksKey = queryKeys.tasks.byBoard(userId, boardId ?? null)
  const isEnabled = userId !== null && boardId !== undefined

  const tasksQuery = useQuery({
    queryKey: tasksKey,
    queryFn: () => fetchTasksByBoardId(boardId as string),
    enabled: isEnabled,
  })

  function getTasksCache(): Task[] {
    return queryClient.getQueryData<Task[]>(tasksKey) ?? []
  }

  function setTasksCache(
    updater: Task[] | ((current: Task[]) => Task[]),
  ) {
    queryClient.setQueryData<Task[]>(tasksKey, (current) => {
      const list = current ?? []
      return typeof updater === 'function' ? updater(list) : updater
    })
  }

  async function refetch() {
    if (!isEnabled) {
      return
    }

    await queryClient.invalidateQueries({ queryKey: tasksKey })
  }

  function applyRealtimeInsert(task: Task) {
    setTasksCache((current) => upsertById(current, task))
  }

  function applyRealtimeUpdate(task: Task) {
    setTasksCache((current) => upsertById(current, task))
  }

  function applyRealtimeDelete(taskId: string) {
    setTasksCache((current) => removeById(current, taskId))
  }

  function applyRealtimeDeleteByColumn(columnId: string) {
    setTasksCache((current) =>
      current.filter((item) => item.column_id !== columnId),
    )
  }

  const createMutation = useMutation({
    mutationFn: ({
      columnId,
      title,
    }: {
      columnId: string
      title: string
    }) => createTaskRequest(columnId, title),
    onSuccess: (task) => {
      setTasksCache((current) => upsertById(current, task))
    },
  })

  async function createTask(columnId: string, title: string) {
    await createMutation.mutateAsync({ columnId, title })
  }

  async function updateTaskDetails(
    taskId: string,
    details: TaskDetailsUpdate,
  ) {
    const previousTasks = getTasksCache()

    setTasksCache((current) =>
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
      setTasksCache((current) =>
        current.map((task) => (task.id === taskId ? updatedTask : task)),
      )
    } catch (err) {
      setTasksCache(previousTasks)
      throw err
    }
  }

  async function moveTaskToColumn(
    taskId: string,
    targetColumnId: string,
    targetIndex?: number,
  ) {
    const previousTasks = getTasksCache()
    const movingTask = previousTasks.find((task) => task.id === taskId)

    if (!movingTask || movingTask.column_id === targetColumnId) {
      return
    }

    const siblings = sortByPosition(
      previousTasks.filter(
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

    setTasksCache((current) => [
      ...current.filter(
        (task) =>
          task.id !== taskId && task.column_id !== targetColumnId,
      ),
      ...optimisticTarget,
    ])

    try {
      const affectedTasks = await moveTaskToColumnRequest(
        taskId,
        targetColumnId,
        targetIndex,
      )
      const affectedIds = new Set(affectedTasks.map((task) => task.id))
      const affectedColumnIds = new Set(
        affectedTasks.map((task) => task.column_id),
      )

      setTasksCache((current) => [
        ...current.filter(
          (task) =>
            !affectedIds.has(task.id) &&
            !affectedColumnIds.has(task.column_id),
        ),
        ...affectedTasks,
      ])
    } catch (err) {
      setTasksCache(previousTasks)
      throw err
    }
  }

  async function reorderTasksInColumn(
    columnId: string,
    orderedTaskIds: string[],
  ) {
    const previousTasks = getTasksCache()
    const columnTaskMap = new Map(
      previousTasks
        .filter((task) => task.column_id === columnId)
        .map((task) => [task.id, task]),
    )

    const optimistic = orderedTaskIds
      .map((id, position) => {
        const task = columnTaskMap.get(id)
        return task ? { ...task, position } : null
      })
      .filter((task): task is Task => task !== null)

    setTasksCache((current) => [
      ...current.filter((task) => task.column_id !== columnId),
      ...optimistic,
    ])

    try {
      const updatedTasks = await reorderTasksInColumnRequest(
        columnId,
        orderedTaskIds,
      )
      setTasksCache((current) => [
        ...current.filter((task) => task.column_id !== columnId),
        ...updatedTasks,
      ])
    } catch (err) {
      setTasksCache(previousTasks)
      throw err
    }
  }

  async function deleteTask(taskId: string) {
    const previousTasks = getTasksCache()
    setTasksCache((current) => current.filter((task) => task.id !== taskId))

    try {
      await deleteTaskRequest(taskId)
    } catch (err) {
      setTasksCache(previousTasks)
      throw err
    }
  }

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error
      ? getErrorMessage(tasksQuery.error, 'Не удалось загрузить задачи.')
      : null,
    refetch,
    applyRealtimeInsert,
    applyRealtimeUpdate,
    applyRealtimeDelete,
    applyRealtimeDeleteByColumn,
    createTask,
    updateTaskDetails,
    moveTaskToColumn,
    reorderTasksInColumn,
    deleteTask,
  }
}
