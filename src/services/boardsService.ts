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
