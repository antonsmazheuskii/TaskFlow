import { useState, type FormEvent } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { ui } from '../../lib/ui'

type CreateTaskFormProps = {
  onCreate: (title: string) => Promise<void>
}

export function CreateTaskForm({ onCreate }: CreateTaskFormProps) {
  const { notifyError } = useNotification()
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      notifyError('Введите название задачи.')
      return
    }

    setIsSubmitting(true)

    try {
      await onCreate(trimmedTitle)
      setTitle('')
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось создать задачу.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="mt-auto grid grid-cols-[1fr_auto] gap-1.5" onSubmit={handleSubmit}>
      <input
        className={ui.input}
        type="text"
        name="title"
        placeholder="Новая задача"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={isSubmitting}
        maxLength={200}
        required
      />
      <button
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-lg font-semibold text-white shadow-sm transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
        aria-label="Добавить задачу"
      >
        {isSubmitting ? '…' : '+'}
      </button>
    </form>
  )
}
