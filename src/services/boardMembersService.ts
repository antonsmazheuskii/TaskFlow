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
    .select('id, name, avatar_url')
    .in('id', userIds)

  if (profilesError) {
    throw profilesError
  }

  const profileByUserId = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  )

  return rows.map((member) => {
    const profile = profileByUserId.get(member.user_id)

    return {
      id: member.id,
      board_id: member.board_id,
      user_id: member.user_id,
      role: member.role,
      name: profile?.name ?? null,
      avatar_url: profile?.avatar_url ?? null,
    }
  })
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
    .select('name, avatar_url')
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
    avatar_url: profile?.avatar_url ?? null,
  }
}

export async function removeBoardMember(
  boardId: string,
  userId: string,
): Promise<void> {
  const { data: member, error: memberError } = await supabase
    .from('board_members')
    .select('id, role')
    .eq('board_id', boardId)
    .eq('user_id', userId)
    .maybeSingle()

  if (memberError) {
    throw memberError
  }

  if (!member) {
    throw new Error('Участник не найден.')
  }

  if (member.role === 'owner') {
    throw new Error('Нельзя удалить владельца доски.')
  }

  const { data: columns, error: columnsError } = await supabase
    .from('columns')
    .select('id')
    .eq('board_id', boardId)

  if (columnsError) {
    throw columnsError
  }

  const columnIds = (columns ?? []).map((column) => column.id)

  if (columnIds.length > 0) {
    const { error: assigneeError } = await supabase
      .from('tasks')
      .update({ assignee_id: null })
      .in('column_id', columnIds)
      .eq('assignee_id', userId)

    if (assigneeError) {
      throw assigneeError
    }
  }

  const { error: deleteError } = await supabase
    .from('board_members')
    .delete()
    .eq('board_id', boardId)
    .eq('user_id', userId)

  if (deleteError) {
    throw deleteError
  }
}
