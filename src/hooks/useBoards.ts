import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBoard as createBoardRequest,
  deleteBoard as deleteBoardRequest,
  fetchMyBoards,
} from '../services/boardsService'
import { queryKeys } from '../lib/queryKeys'
import { useAuth } from '../providers/AuthProvider'
import type { Board } from '../types/board'
import { removeById } from '../utils/collections'
import { getErrorMessage } from '../utils/getErrorMessage'

type UseBoardsResult = {
  boards: Board[]
  isLoading: boolean
  error: string | null
  createBoard: (title: string) => Promise<void>
  deleteBoard: (boardId: string) => Promise<void>
}

export function useBoards(): UseBoardsResult {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id ?? null
  const listKey = queryKeys.boards.list(userId)

  const boardsQuery = useQuery({
    queryKey: listKey,
    queryFn: fetchMyBoards,
    enabled: userId !== null,
  })

  const createMutation = useMutation({
    mutationFn: createBoardRequest,
    onSuccess: (board) => {
      queryClient.setQueryData<Board[]>(listKey, (current) => {
        const rest = removeById(current ?? [], board.id)
        return [board, ...rest]
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBoardRequest,
    onSuccess: (_data, boardId) => {
      queryClient.setQueryData<Board[]>(listKey, (current) =>
        removeById(current ?? [], boardId),
      )
      queryClient.removeQueries({
        queryKey: queryKeys.columns.byBoard(userId, boardId),
      })
      queryClient.removeQueries({
        queryKey: queryKeys.tasks.byBoard(userId, boardId),
      })
    },
  })

  async function createBoard(title: string) {
    await createMutation.mutateAsync(title)
  }

  async function deleteBoard(boardId: string) {
    await deleteMutation.mutateAsync(boardId)
  }

  return {
    boards: boardsQuery.data ?? [],
    isLoading: boardsQuery.isLoading,
    error: boardsQuery.error
      ? getErrorMessage(boardsQuery.error, 'Не удалось загрузить доски.')
      : null,
    createBoard,
    deleteBoard,
  }
}
