export type TaskPriority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  column_id: string
  title: string
  description: string | null
  priority: TaskPriority
  due_date: string | null
  assignee_id: string | null
  position: number
  created_by: string
  created_at: string
}

export type TaskDetailsUpdate = {
  title: string
  description: string | null
  priority: TaskPriority
  due_date: string | null
}

export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}
