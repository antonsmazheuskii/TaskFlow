import { useEffect, useState } from 'react'
import {
  createComment as createCommentRequest,
  deleteComment as deleteCommentRequest,
  fetchCommentsByTaskId,
} from '../services/commentsService'
import type { Comment } from '../types/comment'

type UseCommentsResult = {
  comments: Comment[]
  isLoading: boolean
  error: string | null
  createComment: (content: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
}

export function useComments(taskId: string | undefined): UseCommentsResult {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadComments() {
      if (!taskId) {
        setComments([])
        setError(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchCommentsByTaskId(taskId)

        if (!isMounted) {
          return
        }

        setComments(data)
      } catch (err) {
        if (!isMounted) {
          return
        }

        const message =
          err instanceof Error
            ? err.message
            : 'Не удалось загрузить комментарии.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadComments()

    return () => {
      isMounted = false
    }
  }, [taskId])

  async function createComment(content: string) {
    if (!taskId) {
      throw new Error('Задача не найдена.')
    }

    const comment = await createCommentRequest(taskId, content)
    setComments((current) => [...current, comment])
  }

  async function deleteComment(commentId: string) {
    const previous = comments
    setComments((current) =>
      current.filter((comment) => comment.id !== commentId),
    )

    try {
      await deleteCommentRequest(commentId)
    } catch (err) {
      setComments(previous)
      throw err
    }
  }

  return {
    comments,
    isLoading,
    error,
    createComment,
    deleteComment,
  }
}
