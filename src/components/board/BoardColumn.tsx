import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CreateTaskForm } from '../task/CreateTaskForm'
import { TaskCard } from '../task/TaskCard'
import { useNotification } from '../../providers/NotificationProvider'
import type { Column } from '../../types/column'
import type { Task } from '../../types/task'
import { getColumnDroppableId } from '../../utils/dndIds'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { cn, ui } from '../../lib/ui'

type BoardColumnProps = {
  column: Column
  tasks: Task[]
  canManageColumns: boolean
  onRename: (columnId: string, title: string) => Promise<void>
  onDelete: (columnId: string) => Promise<void>
  onCreateTask: (columnId: string, title: string) => Promise<void>
  onOpenTask: (task: Task) => void
  onDeleteTask: (taskId: string) => Promise<void>
  getAssigneeLabel: (assigneeId: string | null) => string | null
  getAssigneeAvatarUrl: (assigneeId: string | null) => string | null
}

export function BoardColumn({
  column,
  tasks,
  canManageColumns,
  onRename,
  onDelete,
  onCreateTask,
  onOpenTask,
  onDeleteTask,
  getAssigneeLabel,
  getAssigneeAvatarUrl,
}: BoardColumnProps) {
  const { notifyError, notifySuccess } = useNotification()
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(column.title)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: getColumnDroppableId(column.id),
    data: {
      type: 'column',
      columnId: column.id,
    },
  })

  function startEditing() {
    if (!canManageColumns) {
      return
    }

    setDraftTitle(column.title)
    setIsEditing(true)
  }

  function cancelEditing() {
    setDraftTitle(column.title)
    setIsEditing(false)
  }

  async function saveTitle() {
    const trimmedTitle = draftTitle.trim()

    if (!trimmedTitle) {
      notifyError('Введите название колонки.')
      return
    }

    if (trimmedTitle === column.title) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)

    try {
      await onRename(column.id, trimmedTitle)
      setIsEditing(false)
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось переименовать колонку.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await saveTitle()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      cancelEditing()
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Удалить колонку «${column.title}»? Это действие нельзя отменить.`,
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    try {
      await onDelete(column.id)
      notifySuccess('Колонка удалена.')
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось удалить колонку.'))
      setIsDeleting(false)
    }
  }

  async function handleCreateTask(title: string) {
    await onCreateTask(column.id, title)
  }

  return (
    <section
      className={cn(
        'flex w-72 shrink-0 snap-start flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-100/90 p-3 shadow-sm',
        'max-h-[min(70vh,calc(100dvh-9rem))] dark:border-slate-800 dark:bg-slate-900/70',
      )}
    >
      <div className="flex items-start gap-1.5">
        {canManageColumns && isEditing ? (
          <form className="flex min-w-0 flex-1 gap-1.5" onSubmit={handleSubmit}>
            <input
              className={ui.input}
              type="text"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              maxLength={80}
              autoFocus
              aria-label="Название колонки"
            />
            <button
              className={ui.btnSecondary}
              type="submit"
              disabled={isSaving || isDeleting}
            >
              {isSaving ? '…' : 'OK'}
            </button>
          </form>
        ) : canManageColumns ? (
          <button
            className="min-w-0 flex-1 rounded-lg px-2 py-1 text-left text-sm font-semibold text-slate-900 transition hover:bg-white/80 disabled:cursor-not-allowed dark:text-slate-100 dark:hover:bg-slate-800"
            type="button"
            onClick={startEditing}
            disabled={isDeleting}
          >
            {column.title}
          </button>
        ) : (
          <h3 className="min-w-0 flex-1 px-2 py-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            {column.title}
          </h3>
        )}

        <span className="mt-1 rounded-full bg-white px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
          {tasks.length}
        </span>

        {canManageColumns ? (
          <button
            className={ui.btnIconDanger}
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
            aria-label={`Удалить колонку ${column.title}`}
          >
            {isDeleting ? '…' : '×'}
          </button>
        ) : null}
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-16 flex-1 flex-col gap-2 overflow-y-auto rounded-lg p-0.5 transition-colors',
          isOver && 'bg-teal-50/80 ring-2 ring-teal-400/40 dark:bg-teal-950/30',
        )}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assigneeLabel={getAssigneeLabel(task.assignee_id)}
              assigneeAvatarUrl={getAssigneeAvatarUrl(task.assignee_id)}
              onOpen={onOpenTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
            Перетащите задачу сюда
          </p>
        ) : null}
      </div>

      <CreateTaskForm onCreate={handleCreateTask} />
    </section>
  )
}
