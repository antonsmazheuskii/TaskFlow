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

  // position назначает BEFORE INSERT триггер (см. миграцию 22).
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      column_id: columnId,
      title: trimmedTitle,
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
  const { data, error } = await supabase.rpc('move_task_to_column', {
    p_task_id: taskId,
    p_target_column_id: targetColumnId,
    p_target_index: targetIndex ?? null,
  })

  if (error) {
    throw error
  }

  return (data as Task[] | null) ?? []
}

export async function reorderTasksInColumn(
  columnId: string,
  orderedTaskIds: string[],
): Promise<Task[]> {
  const { data, error } = await supabase.rpc('reorder_tasks_in_column', {
    p_column_id: columnId,
    p_ordered_task_ids: orderedTaskIds,
  })

  if (error) {
    throw error
  }

  return (data as Task[] | null) ?? []
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
