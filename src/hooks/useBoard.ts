import { useEffect, useState } from 'react'
import { fetchBoardById } from '../services/boardsService'
import type { Board } from '../types/board'

type UseBoardResult = {
  board: Board | null
  isLoading: boolean
  error: string | null
}

export function useBoard(boardId: string | undefined): UseBoardResult {
  const [board, setBoard] = useState<Board | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadBoard() {
      if (!boardId) {
        setBoard(null)
        setError('Доска не найдена.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchBoardById(boardId)

        if (!isMounted) {
          return
        }

        setBoard(data)
      } catch (err) {
        if (!isMounted) {
          return
        }

        setBoard(null)
        const message =
          err instanceof Error ? err.message : 'Не удалось загрузить доску.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadBoard()

    return () => {
      isMounted = false
    }
  }, [boardId])

  return { board, isLoading, error }
}
