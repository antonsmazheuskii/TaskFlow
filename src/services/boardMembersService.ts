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
      role: member.role as BoardMember['role'],
      name: profile?.name ?? null,
      avatar_url: profile?.avatar_url ?? null,
    }
  })
}

type InviteBoardMemberRow = {
  id: string
  board_id: string
  user_id: string
  role: string
  name: string | null
  avatar_url: string | null
}

export async function inviteBoardMemberByEmail(
  boardId: string,
  email: string,
): Promise<BoardMember> {
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    throw new Error('Введите email.')
  }

  const { data, error } = await supabase.rpc('invite_board_member', {
    p_board_id: boardId,
    p_email: trimmedEmail,
  })

  if (error) {
    throw error
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | InviteBoardMemberRow
    | null
    | undefined

  if (!row) {
    throw new Error('Не удалось пригласить пользователя.')
  }

  return {
    id: row.id,
    board_id: row.board_id,
    user_id: row.user_id,
    role: row.role as BoardMember['role'],
    name: row.name,
    avatar_url: row.avatar_url,
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
