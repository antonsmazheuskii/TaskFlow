import { useEffect, useState } from 'react'
import { fetchColumnsByBoardId } from '../services/columnsService'
import type { Column } from '../types/column'

type UseColumnsResult = {
  columns: Column[]
  isLoading: boolean
  error: string | null
}

export function useColumns(boardId: string | undefined): UseColumnsResult {
  const [columns, setColumns] = useState<Column[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadColumns() {
      if (!boardId) {
        setColumns([])
        setError(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchColumnsByBoardId(boardId)

        if (!isMounted) {
          return
        }

        setColumns(data)
      } catch (err) {
        if (!isMounted) {
          return
        }

        const message =
          err instanceof Error ? err.message : 'Не удалось загрузить колонки.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadColumns()

    return () => {
      isMounted = false
    }
  }, [boardId])

  return { columns, isLoading, error }
}
