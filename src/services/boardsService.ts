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

  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    throw new Error('Введите название доски.')
  }

  const { data: board, error: boardError } = await supabase
    .from('boards')
    .insert({ title: trimmedTitle, owner_id: user.id })
    .select('id, title, owner_id, created_at')
    .single()

  if (boardError) {
    throw boardError
  }

  const { error: memberError } = await supabase.from('board_members').insert({
    board_id: board.id,
    user_id: user.id,
    role: 'owner',
  })

  if (memberError) {
    await supabase.from('boards').delete().eq('id', board.id)
    throw memberError
  }

  return board
}

export async function deleteBoard(boardId: string): Promise<void> {
  const { error } = await supabase.from('boards').delete().eq('id', boardId)

  if (error) {
    throw error
  }
}
