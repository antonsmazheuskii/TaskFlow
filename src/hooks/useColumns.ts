import { useEffect, useState } from 'react'
import {
  createColumn as createColumnRequest,
  deleteColumn as deleteColumnRequest,
  fetchColumnsByBoardId,
  renameColumn as renameColumnRequest,
} from '../services/columnsService'
import type { Column } from '../types/column'

type UseColumnsResult = {
  columns: Column[]
  isLoading: boolean
  error: string | null
  createColumn: (title: string) => Promise<void>
  renameColumn: (columnId: string, title: string) => Promise<void>
  deleteColumn: (columnId: string) => Promise<void>
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

  async function createColumn(title: string) {
    if (!boardId) {
      throw new Error('Доска не найдена.')
    }

    const column = await createColumnRequest(boardId, title)
    setColumns((current) => [...current, column])
  }

  async function renameColumn(columnId: string, title: string) {
    const column = await renameColumnRequest(columnId, title)
    setColumns((current) =>
      current.map((item) => (item.id === columnId ? column : item)),
    )
  }

  async function deleteColumn(columnId: string) {
    await deleteColumnRequest(columnId)
    setColumns((current) => current.filter((item) => item.id !== columnId))
  }

  return {
    columns,
    isLoading,
    error,
    createColumn,
    renameColumn,
    deleteColumn,
  }
}
