import { useState, type FormEvent } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './AddCommentForm.module.css'

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
    <form className={styles.form} onSubmit={handleSubmit}>
      <textarea
        className={styles.textarea}
        name="content"
        placeholder="Написать комментарий…"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        disabled={isSubmitting}
        rows={3}
        maxLength={2000}
        required
      />
      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Отправка…' : 'Добавить'}
      </button>
    </form>
  )
}
