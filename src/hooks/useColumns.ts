import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createColumn as createColumnRequest,
  deleteColumn as deleteColumnRequest,
  fetchColumnsByBoardId,
  renameColumn as renameColumnRequest,
} from '../services/columnsService'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from '../providers/AuthProvider'
import type { Column } from '../types/column'
import type { Task } from '../types/task'
import { getErrorMessage } from '../utils/getErrorMessage'

type UseColumnsResult = {
  columns: Column[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  applyRealtimeInsert: (column: Column) => void
  applyRealtimeUpdate: (column: Column) => void
  applyRealtimeDelete: (columnId: string) => void
  createColumn: (title: string) => Promise<void>
  renameColumn: (columnId: string, title: string) => Promise<void>
  deleteColumn: (columnId: string) => Promise<void>
}

function sortColumns(columns: Column[]): Column[] {
  return [...columns].sort((a, b) => a.position - b.position)
}

export function useColumns(boardId: string | undefined): UseColumnsResult {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id ?? null
  const scopedBoardId = boardId ?? null
  const columnsKey = queryKeys.columns.byBoard(userId, scopedBoardId)
  const tasksKey = queryKeys.tasks.byBoard(userId, scopedBoardId)
  const isEnabled = userId !== null && boardId !== undefined

  const columnsQuery = useQuery({
    queryKey: columnsKey,
    queryFn: () => fetchColumnsByBoardId(boardId as string),
    enabled: isEnabled,
  })

  function setColumnsCache(updater: (current: Column[]) => Column[]) {
    queryClient.setQueryData<Column[]>(columnsKey, (current) =>
      updater(current ?? []),
    )
  }

  const createMutation = useMutation({
    mutationFn: (title: string) => {
      if (!boardId) {
        throw new Error('Доска не найдена.')
      }

      return createColumnRequest(boardId, title)
    },
    onSuccess: (column) => {
      setColumnsCache((current) => sortColumns([...current, column]))
    },
  })

  const renameMutation = useMutation({
    mutationFn: ({
      columnId,
      title,
    }: {
      columnId: string
      title: string
    }) => renameColumnRequest(columnId, title),
    onSuccess: (column) => {
      setColumnsCache((current) =>
        sortColumns(
          current.map((item) => (item.id === column.id ? column : item)),
        ),
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteColumnRequest,
    onSuccess: (_data, columnId) => {
      setColumnsCache((current) =>
        current.filter((item) => item.id !== columnId),
      )
      queryClient.setQueryData<Task[]>(tasksKey, (current) =>
        (current ?? []).filter((task) => task.column_id !== columnId),
      )
    },
  })

  async function refetch() {
    if (!isEnabled) {
      return
    }

    await queryClient.invalidateQueries({ queryKey: columnsKey })
  }

  function applyRealtimeInsert(column: Column) {
    setColumnsCache((current) => {
      if (current.some((item) => item.id === column.id)) {
        return current
      }

      return sortColumns([...current, column])
    })
  }

  function applyRealtimeUpdate(column: Column) {
    setColumnsCache((current) => {
      const exists = current.some((item) => item.id === column.id)

      if (!exists) {
        return sortColumns([...current, column])
      }

      return sortColumns(
        current.map((item) => (item.id === column.id ? column : item)),
      )
    })
  }

  function applyRealtimeDelete(columnId: string) {
    setColumnsCache((current) =>
      current.filter((item) => item.id !== columnId),
    )
  }

  return {
    columns: columnsQuery.data ?? [],
    isLoading: columnsQuery.isLoading,
    error: columnsQuery.error
      ? getErrorMessage(columnsQuery.error, 'Не удалось загрузить колонки.')
      : null,
    refetch,
    applyRealtimeInsert,
    applyRealtimeUpdate,
    applyRealtimeDelete,
    createColumn: async (title: string) => {
      await createMutation.mutateAsync(title)
    },
    renameColumn: async (columnId: string, title: string) => {
      await renameMutation.mutateAsync({ columnId, title })
    },
    deleteColumn: async (columnId: string) => {
      await deleteMutation.mutateAsync(columnId)
    },
  }
}
