export type Column = {
  id: string
  board_id: string
  title: string
  position: number
}

export const DEFAULT_COLUMN_TITLES = ['To Do', 'In Progress', 'Done'] as const
