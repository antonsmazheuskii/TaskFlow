import { useEffect, useState } from 'react'
import {
  createBoard as createBoardRequest,
  deleteBoard as deleteBoardRequest,
  fetchMyBoards,
} from '../services/boardsService'
import type { Board } from '../types/board'

type UseBoardsResult = {
  boards: Board[]
  isLoading: boolean
  error: string | null
  createBoard: (title: string) => Promise<void>
  deleteBoard: (boardId: string) => Promise<void>
}

export function useBoards(): UseBoardsResult {
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadBoards() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchMyBoards()

        if (!isMounted) {
          return
        }

        setBoards(data)
      } catch (err) {
        if (!isMounted) {
          return
        }

        const message =
          err instanceof Error ? err.message : 'Не удалось загрузить доски.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadBoards()

    return () => {
      isMounted = false
    }
  }, [])

  async function createBoard(title: string) {
    const board = await createBoardRequest(title)
    setBoards((current) => [board, ...current])
  }

  async function deleteBoard(boardId: string) {
    await deleteBoardRequest(boardId)
    setBoards((current) => current.filter((board) => board.id !== boardId))
  }

  return { boards, isLoading, error, createBoard, deleteBoard }
}
