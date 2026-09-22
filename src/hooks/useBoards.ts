import { useEffect, useState } from 'react'
import { fetchMyBoards } from '../services/boardsService'
import type { Board } from '../types/board'

type UseBoardsResult = {
  boards: Board[]
  isLoading: boolean
  error: string | null
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

  return { boards, isLoading, error }
}
