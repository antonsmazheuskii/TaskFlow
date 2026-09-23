import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useNotification } from '../../providers/NotificationProvider'
import { signIn } from '../../services/authService'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { ui } from '../../lib/ui'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { notifyError } = useNotification()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? '/'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      notifyError('Введите email.')
      return
    }

    if (!password) {
      notifyError('Введите пароль.')
      return
    }

    setIsSubmitting(true)

    try {
      await signIn({ email: trimmedEmail, password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось войти.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <label className="flex flex-col gap-1.5">
        <span className={ui.label}>Email</span>
        <input
          className={ui.input}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={ui.label}>Пароль</span>
        <input
          className={ui.input}
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </label>

      <button className={ui.btnPrimary} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Вход…' : 'Войти'}
      </button>
    </form>
  )
}
