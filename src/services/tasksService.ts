import { supabase } from './supabaseClient'
import type { Task, TaskDetailsUpdate } from '../types/task'

const TASK_SELECT =
  'id, column_id, title, description, priority, due_date, assignee_id, position, created_by, created_at' as const

export async function fetchTasksByBoardId(boardId: string): Promise<Task[]> {
  const { data: columns, error: columnsError } = await supabase
    .from('columns')
    .select('id')
    .eq('board_id', boardId)

  if (columnsError) {
    throw columnsError
  }

  const columnIds = (columns ?? []).map((column) => column.id)

  if (columnIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('tasks')
    .select(TASK_SELECT)
    .in('column_id', columnIds)
    .order('position', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createTask(
  columnId: string,
  title: string,
): Promise<Task> {
  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    throw new Error('Введите название задачи.')
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error('Необходимо войти в аккаунт.')
  }

  const { data: existing, error: existingError } = await supabase
    .from('tasks')
    .select('position')
    .eq('column_id', columnId)
    .order('position', { ascending: false })
    .limit(1)

  if (existingError) {
    throw existingError
  }

  const nextPosition =
    existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      column_id: columnId,
      title: trimmedTitle,
      position: nextPosition,
      created_by: user.id,
    })
    .select(TASK_SELECT)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function moveTaskToColumn(
  taskId: string,
  targetColumnId: string,
  targetIndex?: number,
): Promise<Task[]> {
  const { data: columnTasks, error: columnTasksError } = await supabase
    .from('tasks')
    .select(TASK_SELECT)
    .eq('column_id', targetColumnId)
    .neq('id', taskId)
    .order('position', { ascending: true })

  if (columnTasksError) {
    throw columnTasksError
  }

  const siblings = columnTasks ?? []
  const insertIndex =
    targetIndex === undefined
      ? siblings.length
      : Math.max(0, Math.min(targetIndex, siblings.length))

  const orderedIds = [
    ...siblings.slice(0, insertIndex).map((task) => task.id),
    taskId,
    ...siblings.slice(insertIndex).map((task) => task.id),
  ]

  const updates = orderedIds.map((id, position) =>
    supabase
      .from('tasks')
      .update({
        column_id: targetColumnId,
        position,
      })
      .eq('id', id)
      .select(TASK_SELECT)
      .single(),
  )

  const results = await Promise.all(updates)
  const failed = results.find((result) => result.error)

  if (failed?.error) {
    throw failed.error
  }

  return results
    .map((result) => result.data)
    .filter((task): task is Task => task !== null)
}

export async function reorderTasksInColumn(
  columnId: string,
  orderedTaskIds: string[],
): Promise<Task[]> {
  const updates = orderedTaskIds.map((id, position) =>
    supabase
      .from('tasks')
      .update({
        column_id: columnId,
        position,
      })
      .eq('id', id)
      .select(TASK_SELECT)
      .single(),
  )

  const results = await Promise.all(updates)
  const failed = results.find((result) => result.error)

  if (failed?.error) {
    throw failed.error
  }

  return results
    .map((result) => result.data)
    .filter((task): task is Task => task !== null)
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)

  if (error) {
    throw error
  }
}

export async function updateTaskDetails(
  taskId: string,
  details: TaskDetailsUpdate,
): Promise<Task> {
  const trimmedTitle = details.title.trim()

  if (!trimmedTitle) {
    throw new Error('Введите название задачи.')
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: trimmedTitle,
      description: details.description,
      priority: details.priority,
      due_date: details.due_date,
      assignee_id: details.assignee_id,
    })
    .eq('id', taskId)
    .select(TASK_SELECT)
    .single()

  if (error) {
    throw error
  }

  return data
}
