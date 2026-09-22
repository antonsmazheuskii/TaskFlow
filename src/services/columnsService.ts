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
