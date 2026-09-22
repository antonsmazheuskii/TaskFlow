import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useNotification } from '../../providers/NotificationProvider'
import { signIn } from '../../services/authService'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './AuthForm.module.css'

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
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label className={styles.field}>
        <span className={styles.label}>Email</span>
        <input
          className={styles.input}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Пароль</span>
        <input
          className={styles.input}
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </label>

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Вход…' : 'Войти'}
      </button>
    </form>
  )
}
