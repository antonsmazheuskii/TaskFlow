import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBoard as createBoardRequest,
  deleteBoard as deleteBoardRequest,
  fetchMyBoards,
} from '../services/boardsService'
import { queryKeys } from '../lib/queryKeys'
import type { Board } from '../types/board'
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

  const boardsQuery = useQuery({
    queryKey: queryKeys.boards.list(),
    queryFn: fetchMyBoards,
  })

  const createMutation = useMutation({
    mutationFn: createBoardRequest,
    onSuccess: (board) => {
      queryClient.setQueryData<Board[]>(queryKeys.boards.list(), (current) =>
        current ? [board, ...current] : [board],
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBoardRequest,
    onSuccess: (_data, boardId) => {
      queryClient.setQueryData<Board[]>(queryKeys.boards.list(), (current) =>
        (current ?? []).filter((board) => board.id !== boardId),
      )
      void queryClient.removeQueries({
        queryKey: queryKeys.columns.byBoard(boardId),
      })
      void queryClient.removeQueries({
        queryKey: queryKeys.tasks.byBoard(boardId),
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
