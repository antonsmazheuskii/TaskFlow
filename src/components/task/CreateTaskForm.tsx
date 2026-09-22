import { useState, type FormEvent } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './CreateTaskForm.module.css'

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
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        name="title"
        placeholder="Новая задача"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={isSubmitting}
        maxLength={200}
        required
      />
      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? '…' : '+'}
      </button>
    </form>
  )
}
