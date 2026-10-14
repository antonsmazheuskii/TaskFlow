export const queryKeys = {
  boards: {
    all: ['boards'] as const,
    list: () => [...queryKeys.boards.all, 'list'] as const,
  },
  columns: {
    all: ['columns'] as const,
    byBoard: (boardId: string) =>
      [...queryKeys.columns.all, 'board', boardId] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    byBoard: (boardId: string) =>
      [...queryKeys.tasks.all, 'board', boardId] as const,
  },
} as const
