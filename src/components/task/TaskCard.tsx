import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState, type MouseEvent } from 'react'
import { UserAvatar } from '../shared/UserAvatar'
import { useNotification } from '../../providers/NotificationProvider'
import { TASK_PRIORITY_LABELS, type Task } from '../../types/task'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { cn, ui } from '../../lib/ui'

type TaskCardProps = {
  task: Task
  assigneeLabel: string | null
  assigneeAvatarUrl: string | null
  onOpen: (task: Task) => void
  onDelete: (taskId: string) => Promise<void>
}

const priorityStyles = {
  low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  high: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
} as const

export function TaskCard({
  task,
  assigneeLabel,
  assigneeAvatarUrl,
  onOpen,
  onDelete,
}: TaskCardProps) {
  const { notifyError, notifySuccess } = useNotification()
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      columnId: task.column_id,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : undefined,
  }

  function handleOpen() {
    if (isDragging) {
      return
    }

    onOpen(task)
  }

  async function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    const confirmed = window.confirm(
      `Удалить задачу «${task.title}»? Это действие нельзя отменить.`,
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    try {
      await onDelete(task.id)
      notifySuccess('Задача удалена.')
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось удалить задачу.'))
      setIsDeleting(false)
    }
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        'group grid grid-cols-[1fr_auto_auto] items-start gap-1 rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
        'dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600',
        isDragging && 'shadow-md ring-2 ring-teal-500/30',
      )}
    >
      <div className="min-w-0">
        <button
          className="w-full rounded-lg px-1.5 py-1 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-100 dark:hover:bg-slate-900 dark:hover:text-teal-300"
          type="button"
          onClick={handleOpen}
          disabled={isDeleting}
        >
          {task.title}
        </button>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 px-1.5">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold',
              priorityStyles[task.priority],
            )}
          >
            {TASK_PRIORITY_LABELS[task.priority]}
          </span>
          {task.due_date ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <span aria-hidden="true">◷</span>
              {task.due_date}
            </span>
          ) : null}
          {assigneeLabel ? (
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-slate-100 py-0.5 pr-2 pl-0.5 text-[0.65rem] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <UserAvatar
                name={assigneeLabel}
                avatarUrl={assigneeAvatarUrl}
                size="sm"
              />
              <span className="max-w-[7rem] truncate">{assigneeLabel}</span>
            </span>
          ) : null}
        </div>
      </div>

      <button
        className={cn(
          ui.btnIcon,
          'cursor-grab touch-none opacity-60 group-hover:opacity-100 active:cursor-grabbing',
        )}
        type="button"
        aria-label={`Переместить задачу ${task.title}`}
        disabled={isDeleting}
        {...listeners}
        {...attributes}
      >
        ⋮⋮
      </button>

      <button
        className={ui.btnIconDanger}
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label={`Удалить задачу ${task.title}`}
      >
        {isDeleting ? '…' : '×'}
      </button>
    </article>
  )
}
