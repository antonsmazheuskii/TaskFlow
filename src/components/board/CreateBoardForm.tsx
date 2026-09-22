import { useState, type FormEvent } from 'react'
import styles from './CreateBoardForm.module.css'

type CreateBoardFormProps = {
  onCreate: (title: string) => Promise<void>
}

export function CreateBoardForm({ onCreate }: CreateBoardFormProps) {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError('Введите название доски.')
      return
    }

    setIsSubmitting(true)

    try {
      await onCreate(trimmedTitle)
      setTitle('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Не удалось создать доску.'
      setError(message)
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
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
