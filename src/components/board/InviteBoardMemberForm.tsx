import { useState, type FormEvent } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './InviteBoardMemberForm.module.css'

type InviteBoardMemberFormProps = {
  onInvite: (email: string) => Promise<void>
}

export function InviteBoardMemberForm({ onInvite }: InviteBoardMemberFormProps) {
  const { notifyError, notifySuccess } = useNotification()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      notifyError('Введите email пользователя.')
      return
    }

    setIsSubmitting(true)

    try {
      await onInvite(trimmedEmail)
      setEmail('')
      notifySuccess('Пользователь приглашён на доску.')
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось пригласить пользователя.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span className={styles.label}>Пригласить по email</span>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="user@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            autoComplete="email"
            required
          />
          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Приглашение…' : 'Пригласить'}
          </button>
        </div>
      </label>
    </form>
  )
}
