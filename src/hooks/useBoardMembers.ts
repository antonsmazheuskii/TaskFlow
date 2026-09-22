import { useEffect, useState } from 'react'
import {
  fetchBoardMembers,
  inviteBoardMemberByEmail,
  removeBoardMember,
} from '../services/boardMembersService'
import type { BoardMember } from '../types/boardMember'

type UseBoardMembersResult = {
  members: BoardMember[]
  isLoading: boolean
  error: string | null
  inviteByEmail: (email: string) => Promise<void>
  removeMember: (userId: string) => Promise<void>
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

  async function inviteByEmail(email: string) {
    if (!boardId) {
      throw new Error('Доска не найдена.')
    }

    const member = await inviteBoardMemberByEmail(boardId, email)
    setMembers((current) => {
      if (current.some((item) => item.user_id === member.user_id)) {
        return current
      }

      return [...current, member]
    })
  }

  async function removeMember(userId: string) {
    if (!boardId) {
      throw new Error('Доска не найдена.')
    }

    await removeBoardMember(boardId, userId)
    setMembers((current) =>
      current.filter((member) => member.user_id !== userId),
    )
  }

  return { members, isLoading, error, inviteByEmail, removeMember }
}
