import { supabase } from './supabaseClient'
import type { BoardMember } from '../types/boardMember'
import { findProfileIdByEmail } from './profilesService'

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

export async function inviteBoardMemberByEmail(
  boardId: string,
  email: string,
): Promise<BoardMember> {
  const userId = await findProfileIdByEmail(email)

  if (!userId) {
    throw new Error('Пользователь с таким email не найден. Он должен сначала зарегистрироваться.')
  }

  const { data: existing, error: existingError } = await supabase
    .from('board_members')
    .select('id')
    .eq('board_id', boardId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingError) {
    throw existingError
  }

  if (existing) {
    throw new Error('Этот пользователь уже участник доски.')
  }

  const { data: member, error: memberError } = await supabase
    .from('board_members')
    .insert({
      board_id: boardId,
      user_id: userId,
      role: 'member',
    })
    .select('id, board_id, user_id, role')
    .single()

  if (memberError) {
    throw memberError
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    throw profileError
  }

  return {
    id: member.id,
    board_id: member.board_id,
    user_id: member.user_id,
    role: member.role,
    name: profile?.name ?? null,
  }
}
