export type Comment = {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  author_name: string
  author_avatar_url: string | null
}

export function getCommentAuthorLabel(
  userId: string,
  authorName: string | null | undefined,
): string {
  if (authorName?.trim()) {
    return authorName.trim()
  }

  return `Участник ${userId.slice(0, 8)}`
}
