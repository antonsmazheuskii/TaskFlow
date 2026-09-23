import { useState, type FormEvent } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { ui } from '../../lib/ui'

type CreateBoardFormProps = {
  onCreate: (title: string) => Promise<void>
}

export function CreateBoardForm({ onCreate }: CreateBoardFormProps) {
  const { notifyError, notifySuccess } = useNotification()
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      notifyError('Введите название доски.')
      return
    }

    setIsSubmitting(true)

    try {
      await onCreate(trimmedTitle)
      setTitle('')
      notifySuccess('Доска создана.')
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось создать доску.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="grid gap-2 sm:grid-cols-[1fr_auto]"
      onSubmit={handleSubmit}
    >
      <input
        className={ui.input}
        type="text"
        name="title"
        placeholder="Название доски"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={isSubmitting}
        maxLength={120}
        required
      />
      <button className={ui.btnPrimary} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Создание…' : 'Создать'}
      </button>
    </form>
  )
}
