import { useEffect, useState, type FormEvent } from 'react'
import {
  getMemberDisplayName,
  type BoardMember,
} from '../../types/boardMember'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskDetailsUpdate,
  type TaskPriority,
} from '../../types/task'
import { ui } from '../../lib/ui'

type TaskDetailsFormProps = {
  task: Task
  members: BoardMember[]
  areMembersLoading: boolean
  onSave: (details: TaskDetailsUpdate) => Promise<void>
  onCancel: () => void
}

type FormSnapshot = {
  title: string
  description: string
  priority: TaskPriority
  dueDate: string
  assigneeId: string
}

function snapshotFromTask(task: Task): FormSnapshot {
  return {
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    dueDate: task.due_date ?? '',
    assigneeId: task.assignee_id ?? '',
  }
}

function snapshotsEqual(a: FormSnapshot, b: FormSnapshot): boolean {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.priority === b.priority &&
    a.dueDate === b.dueDate &&
    a.assigneeId === b.assigneeId
  )
}

export function TaskDetailsForm({
  task,
  members,
  areMembersLoading,
  onSave,
  onCancel,
}: TaskDetailsFormProps) {
  const initial = snapshotFromTask(task)
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [priority, setPriority] = useState<TaskPriority>(initial.priority)
  const [dueDate, setDueDate] = useState(initial.dueDate)
  const [assigneeId, setAssigneeId] = useState(initial.assigneeId)
  const [baseline, setBaseline] = useState<FormSnapshot>(initial)
  const [syncedTaskId, setSyncedTaskId] = useState(task.id)
  const [remoteConflict, setRemoteConflict] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const draft: FormSnapshot = {
    title,
    description,
    priority,
    dueDate,
    assigneeId,
  }
  const isDirty = !snapshotsEqual(draft, baseline)

  function applySnapshot(snapshot: FormSnapshot) {
    setTitle(snapshot.title)
    setDescription(snapshot.description)
    setPriority(snapshot.priority)
    setDueDate(snapshot.dueDate)
    setAssigneeId(snapshot.assigneeId)
    setBaseline(snapshot)
    setRemoteConflict(false)
  }

  useEffect(() => {
    const next = snapshotFromTask(task)

    if (task.id !== syncedTaskId) {
      applySnapshot(next)
      setSyncedTaskId(task.id)
      return
    }

    if (snapshotsEqual(next, baseline)) {
      return
    }

    if (isDirty) {
      setRemoteConflict(true)
      return
    }

    applySnapshot(next)
  }, [task, syncedTaskId, baseline, isDirty])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSave({
        title: trimmedTitle,
        description: description.trim() ? description.trim() : null,
        priority,
        due_date: dueDate ? dueDate : null,
        assignee_id: assigneeId ? assigneeId : null,
      })
      applySnapshot({
        title: trimmedTitle,
        description: description.trim(),
        priority,
        dueDate,
        assigneeId,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {remoteConflict ? (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
          role="status"
        >
          <p>
            Задача изменена другим пользователем. Несохранённые правки сохранены
            в форме.
          </p>
          <button
            className={`${ui.btnSecondary} mt-2 !min-h-0 px-3 py-1.5 text-xs`}
            type="button"
            onClick={() => applySnapshot(snapshotFromTask(task))}
            disabled={isSubmitting}
          >
            Загрузить серверную версию
          </button>
        </div>
      ) : null}

      <label className="flex flex-col gap-1.5">
        <span className={ui.label}>Название</span>
        <input
          className={ui.input}
          type="text"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={isSubmitting}
          maxLength={200}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={ui.label}>Описание</span>
        <textarea
          className={ui.textarea}
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSubmitting}
          rows={5}
          maxLength={4000}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={ui.label}>Приоритет</span>
          <select
            className={ui.select}
            name="priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as TaskPriority)
            }
            disabled={isSubmitting}
          >
            {TASK_PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {TASK_PRIORITY_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={ui.label}>Дедлайн</span>
          <input
            className={ui.input}
            type="date"
            name="dueDate"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            disabled={isSubmitting}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={ui.label}>Исполнитель</span>
        <select
          className={ui.select}
          name="assignee"
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
          disabled={isSubmitting || areMembersLoading}
        >
          <option value="">Не назначен</option>
          {members.map((member) => (
            <option key={member.user_id} value={member.user_id}>
              {getMemberDisplayName(member)}
              {member.role === 'owner' ? ' (owner)' : ''}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap justify-end gap-2 pt-1">
        <button
          className={ui.btnSecondary}
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Отмена
        </button>
        <button
          className={ui.btnPrimary}
          type="submit"
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? 'Сохранение…' : 'Сохранить'}
        </button>
      </div>
    </form>
  )
}
