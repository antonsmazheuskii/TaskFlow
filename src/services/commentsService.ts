import { supabase } from './supabaseClient'
import {
  getCommentAuthorLabel,
  type Comment,
} from '../types/comment'

type CommentRow = {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
}

const COMMENT_SELECT = 'id, task_id, user_id, content, created_at' as const

async function resolveAuthorNames(
  userIds: string[],
): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(userIds)]

  if (uniqueIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', uniqueIds)

  if (error) {
    throw error
  }

  return new Map(
    (data ?? []).map((profile) => [
      profile.id,
      getCommentAuthorLabel(profile.id, profile.name),
    ]),
  )
}

function mapComment(
  row: CommentRow,
  authorNames: Map<string, string>,
): Comment {
  return {
    ...row,
    author_name:
      authorNames.get(row.user_id) ??
      getCommentAuthorLabel(row.user_id, null),
  }
}

export async function fetchCommentsByTaskId(
  taskId: string,
): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_SELECT)
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  const rows = data ?? []
  const authorNames = await resolveAuthorNames(rows.map((row) => row.user_id))

  return rows.map((row) => mapComment(row, authorNames))
}

export async function createComment(
  taskId: string,
  content: string,
): Promise<Comment> {
  const trimmedContent = content.trim()

  if (!trimmedContent) {
    throw new Error('Введите текст комментария.')
  }

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

  const { data, error } = await supabase
    .from('comments')
    .insert({
      task_id: taskId,
      user_id: user.id,
      content: trimmedContent,
    })
    .select(COMMENT_SELECT)
    .single()

  if (error) {
    throw error
  }

  const authorNames = await resolveAuthorNames([user.id])

  return mapComment(data, authorNames)
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', commentId)

  if (error) {
    throw error
  }
}
