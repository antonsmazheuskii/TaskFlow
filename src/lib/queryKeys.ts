type UserId = string | null

export const queryKeys = {
  user: (userId: UserId) => ['user', userId] as const,
  boards: {
    all: (userId: UserId) => [...queryKeys.user(userId), 'boards'] as const,
    list: (userId: UserId) => [...queryKeys.boards.all(userId), 'list'] as const,
  },
  columns: {
    all: (userId: UserId) => [...queryKeys.user(userId), 'columns'] as const,
    byBoard: (userId: UserId, boardId: UserId) =>
      [...queryKeys.columns.all(userId), 'board', boardId] as const,
  },
  tasks: {
    all: (userId: UserId) => [...queryKeys.user(userId), 'tasks'] as const,
    byBoard: (userId: UserId, boardId: UserId) =>
      [...queryKeys.tasks.all(userId), 'board', boardId] as const,
  },
} as const
