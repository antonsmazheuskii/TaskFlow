import { supabase } from './supabaseClient'
import type { Comment } from '../types/comment'

const COMMENT_SELECT = 'id, task_id, user_id, content, created_at' as const

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

  return data ?? []
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

  return data
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', commentId)

  if (error) {
    throw error
  }
}
