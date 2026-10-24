import { supabase } from './supabaseClient'
import type { Column } from '../types/column'

export async function fetchColumnsByBoardId(
  boardId: string,
): Promise<Column[]> {
  const { data, error } = await supabase
    .from('columns')
    .select('id, board_id, title, position')
    .eq('board_id', boardId)
    .order('position', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createColumn(
  boardId: string,
  title: string,
): Promise<Column> {
  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    throw new Error('Введите название колонки.')
  }

  // position назначает BEFORE INSERT триггер (см. миграцию 22).
  const { data, error } = await supabase
    .from('columns')
    .insert({
      board_id: boardId,
      title: trimmedTitle,
    })
    .select('id, board_id, title, position')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function renameColumn(
  columnId: string,
  title: string,
): Promise<Column> {
  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    throw new Error('Введите название колонки.')
  }

  const { data, error } = await supabase
    .from('columns')
    .update({ title: trimmedTitle })
    .eq('id', columnId)
    .select('id, board_id, title, position')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteColumn(columnId: string): Promise<void> {
  const { error } = await supabase.from('columns').delete().eq('id', columnId)

  if (error) {
    throw error
  }
}
