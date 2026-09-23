import { useState, type FormEvent } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { ui } from '../../lib/ui'

type AddCommentFormProps = {
  onAdd: (content: string) => Promise<void>
}

export function AddCommentForm({ onAdd }: AddCommentFormProps) {
  const { notifyError } = useNotification()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedContent = content.trim()

    if (!trimmedContent) {
      notifyError('Введите текст комментария.')
      return
    }

    setIsSubmitting(true)

    try {
      await onAdd(trimmedContent)
      setContent('')
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось добавить комментарий.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
      <textarea
        className={ui.textarea}
        name="content"
        placeholder="Написать комментарий…"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={isSubmitting}
        rows={3}
        maxLength={2000}
        required
      />
      <button
        className={`${ui.btnPrimary} self-start`}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Отправка…' : 'Добавить'}
      </button>
    </form>
  )
}
