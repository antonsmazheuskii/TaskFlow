import { useEffect, useState } from 'react'
import { fetchBoardMembers } from '../services/boardMembersService'
import type { BoardMember } from '../types/boardMember'

type UseBoardMembersResult = {
  members: BoardMember[]
  isLoading: boolean
  error: string | null
}

export function useBoardMembers(
  boardId: string | undefined,
): UseBoardMembersResult {
  const [members, setMembers] = useState<BoardMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadMembers() {
      if (!boardId) {
        setMembers([])
        setError(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchBoardMembers(boardId)

        if (!isMounted) {
          return
        }

        setMembers(data)
      } catch (err) {
        if (!isMounted) {
          return
        }

        const message =
          err instanceof Error
            ? err.message
            : 'Не удалось загрузить участников доски.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadMembers()

    return () => {
      isMounted = false
    }
  }, [boardId])

  return { members, isLoading, error }
}
