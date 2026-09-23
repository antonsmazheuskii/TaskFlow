import { useState, type FormEvent } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { ui } from '../../lib/ui'

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
    <form onSubmit={handleSubmit}>
      <label className="flex flex-col gap-1.5">
        <span className={ui.label}>Пригласить по email</span>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            className={ui.input}
            type="email"
            name="email"
            placeholder="user@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            autoComplete="email"
            required
          />
          <button className={ui.btnPrimary} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Приглашение…' : 'Пригласить'}
          </button>
        </div>
      </label>
    </form>
  )
}
