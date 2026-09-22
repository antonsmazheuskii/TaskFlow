import { useEffect, useState, type FormEvent } from 'react'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskDetailsUpdate,
  type TaskPriority,
} from '../../types/task'
import styles from './TaskDetailsForm.module.css'

type TaskDetailsFormProps = {
  task: Task
  onSave: (details: TaskDetailsUpdate) => Promise<void>
  onCancel: () => void
}

export function TaskDetailsForm({
  task,
  onSave,
  onCancel,
}: TaskDetailsFormProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description ?? '')
    setPriority(task.priority)
    setDueDate(task.due_date ?? '')
  }, [task])

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
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span className={styles.label}>Название</span>
        <input
          className={styles.input}
          type="text"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={isSubmitting}
          maxLength={200}
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Описание</span>
        <textarea
          className={styles.textarea}
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSubmitting}
          rows={5}
          maxLength={4000}
        />
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Приоритет</span>
          <select
            className={styles.select}
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

        <label className={styles.field}>
          <span className={styles.label}>Дедлайн</span>
          <input
            className={styles.input}
            type="date"
            name="dueDate"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            disabled={isSubmitting}
          />
        </label>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.cancel}
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Отмена
        </button>
        <button
          className={styles.submit}
          type="submit"
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? 'Сохранение…' : 'Сохранить'}
        </button>
      </div>
    </form>
  )
}
