import { supabase } from './supabaseClient'
import type { BoardMember } from '../types/boardMember'

export async function fetchBoardMembers(
  boardId: string,
): Promise<BoardMember[]> {
  const { data: members, error: membersError } = await supabase
    .from('board_members')
    .select('id, board_id, user_id, role')
    .eq('board_id', boardId)
    .order('role', { ascending: true })

  if (membersError) {
    throw membersError
  }

  const rows = members ?? []

  if (rows.length === 0) {
    return []
  }

  const userIds = rows.map((member) => member.user_id)

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', userIds)

  if (profilesError) {
    throw profilesError
  }

  const nameByUserId = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.name]),
  )

  return rows.map((member) => ({
    id: member.id,
    board_id: member.board_id,
    user_id: member.user_id,
    role: member.role,
    name: nameByUserId.get(member.user_id) ?? null,
  }))
}
