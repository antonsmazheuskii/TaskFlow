import { useState, type FormEvent } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { ui } from '../../lib/ui'

type CreateColumnFormProps = {
  onCreate: (title: string) => Promise<void>
}

export function CreateColumnForm({ onCreate }: CreateColumnFormProps) {
  const { notifyError } = useNotification()
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      notifyError('Введите название колонки.')
      return
    }

    setIsSubmitting(true)

    try {
      await onCreate(trimmedTitle)
      setTitle('')
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось создать колонку.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="flex w-72 shrink-0 snap-start flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 p-3 dark:border-slate-700 dark:bg-slate-900/40"
      onSubmit={handleSubmit}
    >
      <input
        className={ui.input}
        type="text"
        name="title"
        placeholder="Новая колонка"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={isSubmitting}
        maxLength={80}
        required
      />
      <button className={ui.btnSecondary} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Добавление…' : '+ Колонка'}
      </button>
    </form>
  )
}
