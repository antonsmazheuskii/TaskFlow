import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CreateTaskForm } from '../task/CreateTaskForm'
import { TaskCard } from '../task/TaskCard'
import type { Column } from '../../types/column'
import type { Task } from '../../types/task'
import { getColumnDroppableId } from '../../utils/dndIds'
import styles from './BoardColumn.module.css'

type BoardColumnProps = {
  column: Column
  tasks: Task[]
  onRename: (columnId: string, title: string) => Promise<void>
  onDelete: (columnId: string) => Promise<void>
  onCreateTask: (columnId: string, title: string) => Promise<void>
  onDeleteTask: (taskId: string) => Promise<void>
}

export function BoardColumn({
  column,
  tasks,
  onRename,
  onDelete,
  onCreateTask,
  onDeleteTask,
}: BoardColumnProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(column.title)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { setNodeRef, isOver } = useDroppable({
    id: getColumnDroppableId(column.id),
    data: {
      type: 'column',
      columnId: column.id,
    },
  })

  function startEditing() {
    setDraftTitle(column.title)
    setError(null)
    setIsEditing(true)
  }

  function cancelEditing() {
    setDraftTitle(column.title)
    setError(null)
    setIsEditing(false)
  }

  async function saveTitle() {
    const trimmedTitle = draftTitle.trim()

    if (!trimmedTitle) {
      setError('Введите название колонки.')
      return
    }

    if (trimmedTitle === column.title) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await onRename(column.id, trimmedTitle)
      setIsEditing(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Не удалось переименовать колонку.'
      setError(message)
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

    setError(null)
    setIsDeleting(true)

    try {
      await onDelete(column.id)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Не удалось удалить колонку.'
      setError(message)
      setIsDeleting(false)
    }
  }

  async function handleCreateTask(title: string) {
    await onCreateTask(column.id, title)
  }

  const tasksClassName = isOver
    ? `${styles.tasks} ${styles.tasksOver}`
    : styles.tasks

  return (
    <section className={styles.column}>
      <div className={styles.header}>
        {isEditing ? (
          <form className={styles.renameForm} onSubmit={handleSubmit}>
            <input
              className={styles.renameInput}
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
              className={styles.save}
              type="submit"
              disabled={isSaving || isDeleting}
            >
              {isSaving ? '…' : 'OK'}
            </button>
          </form>
        ) : (
          <button
            className={styles.titleButton}
            type="button"
            onClick={startEditing}
            disabled={isDeleting}
          >
            {column.title}
          </button>
        )}

        <button
          className={styles.delete}
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isSaving}
          aria-label={`Удалить колонку ${column.title}`}
        >
          {isDeleting ? '…' : '×'}
        </button>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div ref={setNodeRef} className={tasksClassName}>
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
          ))}
        </SortableContext>
      </div>

      <CreateTaskForm onCreate={handleCreateTask} />
    </section>
  )
}
