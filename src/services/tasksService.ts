import { supabase } from './supabaseClient'
import type { Task } from '../types/task'

const TASK_SELECT = 'id, column_id, title, position, created_by, created_at' as const

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
): Promise<Task> {
  const { data: existing, error: existingError } = await supabase
    .from('tasks')
    .select('position')
    .eq('column_id', targetColumnId)
    .order('position', { ascending: false })
    .limit(1)

  if (existingError) {
    throw existingError
  }

  const nextPosition =
    existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from('tasks')
    .update({
      column_id: targetColumnId,
      position: nextPosition,
    })
    .eq('id', taskId)
    .select(TASK_SELECT)
    .single()

  if (error) {
    throw error
  }

  return data
}
