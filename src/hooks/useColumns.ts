import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createColumn as createColumnRequest,
  deleteColumn as deleteColumnRequest,
  fetchColumnsByBoardId,
  renameColumn as renameColumnRequest,
} from '../services/columnsService'
import { queryKeys } from '../lib/queryKeys'
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
  const queryKey = boardId
    ? queryKeys.columns.byBoard(boardId)
    : (['columns', 'board', 'none'] as const)

  const columnsQuery = useQuery({
    queryKey,
    queryFn: () => fetchColumnsByBoardId(boardId!),
    enabled: Boolean(boardId),
  })

  const createMutation = useMutation({
    mutationFn: (title: string) => {
      if (!boardId) {
        throw new Error('Доска не найдена.')
      }

      return createColumnRequest(boardId, title)
    },
    onSuccess: (column) => {
      if (!boardId) {
        return
      }

      queryClient.setQueryData<Column[]>(
        queryKeys.columns.byBoard(boardId),
        (current) => sortColumns([...(current ?? []), column]),
      )
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
      if (!boardId) {
        return
      }

      queryClient.setQueryData<Column[]>(
        queryKeys.columns.byBoard(boardId),
        (current) =>
          sortColumns(
            (current ?? []).map((item) =>
              item.id === column.id ? column : item,
            ),
          ),
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteColumnRequest,
    onSuccess: (_data, columnId) => {
      if (!boardId) {
        return
      }

      queryClient.setQueryData<Column[]>(
        queryKeys.columns.byBoard(boardId),
        (current) => (current ?? []).filter((item) => item.id !== columnId),
      )
      queryClient.setQueryData<Task[]>(
        queryKeys.tasks.byBoard(boardId),
        (current) =>
          (current ?? []).filter((task) => task.column_id !== columnId),
      )
    },
  })

  async function refetch() {
    if (!boardId) {
      return
    }

    await queryClient.invalidateQueries({
      queryKey: queryKeys.columns.byBoard(boardId),
    })
  }

  function applyRealtimeInsert(column: Column) {
    if (!boardId) {
      return
    }

    queryClient.setQueryData<Column[]>(
      queryKeys.columns.byBoard(boardId),
      (current) => {
        const list = current ?? []

        if (list.some((item) => item.id === column.id)) {
          return list
        }

        return sortColumns([...list, column])
      },
    )
  }

  function applyRealtimeUpdate(column: Column) {
    if (!boardId) {
      return
    }

    queryClient.setQueryData<Column[]>(
      queryKeys.columns.byBoard(boardId),
      (current) => {
        const list = current ?? []
        const exists = list.some((item) => item.id === column.id)

        if (!exists) {
          return sortColumns([...list, column])
        }

        return sortColumns(
          list.map((item) => (item.id === column.id ? column : item)),
        )
      },
    )
  }

  function applyRealtimeDelete(columnId: string) {
    if (!boardId) {
      return
    }

    queryClient.setQueryData<Column[]>(
      queryKeys.columns.byBoard(boardId),
      (current) => (current ?? []).filter((item) => item.id !== columnId),
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
