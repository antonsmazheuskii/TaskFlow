import { supabase } from './supabaseClient'
import type { Board } from '../types/board'

export async function fetchMyBoards(): Promise<Board[]> {
  const { data, error } = await supabase
    .from('boards')
    .select('id, title, owner_id, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function fetchBoardById(boardId: string): Promise<Board> {
  const { data, error } = await supabase
    .from('boards')
    .select('id, title, owner_id, created_at')
    .eq('id', boardId)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function createBoard(title: string): Promise<Board> {
  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    throw new Error('Введите название доски.')
  }

  const { data, error } = await supabase.rpc('create_board_with_defaults', {
    p_title: trimmedTitle,
  })

  if (error) {
    throw error
  }

  const row = (Array.isArray(data) ? data[0] : data) as Board | null | undefined

  if (!row) {
    throw new Error('Не удалось создать доску.')
  }

  return {
    id: row.id,
    title: row.title,
    owner_id: row.owner_id,
    created_at: row.created_at,
  }
}

export async function deleteBoard(boardId: string): Promise<void> {
  const { error } = await supabase.from('boards').delete().eq('id', boardId)

  if (error) {
    throw error
  }
}
