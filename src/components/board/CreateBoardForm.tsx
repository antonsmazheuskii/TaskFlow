import { useState, type FormEvent } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './CreateBoardForm.module.css'

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
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        name="title"
        placeholder="Название доски"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={isSubmitting}
        maxLength={120}
        required
      />
      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Создание…' : 'Создать'}
      </button>
    </form>
  )
}
