import { supabase } from './supabaseClient'
import { DEFAULT_COLUMN_TITLES, type Column } from '../types/column'

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

export async function createDefaultColumns(boardId: string): Promise<Column[]> {
  const payload = DEFAULT_COLUMN_TITLES.map((title, position) => ({
    board_id: boardId,
    title,
    position,
  }))

  const { data, error } = await supabase
    .from('columns')
    .insert(payload)
    .select('id, board_id, title, position')
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

  const { data: existing, error: existingError } = await supabase
    .from('columns')
    .select('position')
    .eq('board_id', boardId)
    .order('position', { ascending: false })
    .limit(1)

  if (existingError) {
    throw existingError
  }

  const nextPosition =
    existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from('columns')
    .insert({
      board_id: boardId,
      title: trimmedTitle,
      position: nextPosition,
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
