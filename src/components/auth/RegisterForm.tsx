import { useState, type FormEvent } from 'react'
import { signUp } from '../../services/authService'
import styles from './AuthForm.module.css'

const MIN_PASSWORD_LENGTH = 6

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Введите email.')
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов.`)
      return
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают.')
      return
    }

    setIsSubmitting(true)

    try {
      const data = await signUp({ email: trimmedEmail, password })

      if (data.session) {
        setSuccessMessage('Регистрация прошла успешно.')
      } else {
        setSuccessMessage(
          'Регистрация прошла успешно. Проверьте email для подтверждения аккаунта.',
        )
      }

      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Не удалось зарегистрироваться.'
      setError(message)
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
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Подтверждение пароля</span>
        <input
          className={styles.input}
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isSubmitting}
          minLength={MIN_PASSWORD_LENGTH}
          required
        />
      </label>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p className={styles.success} role="status">
          {successMessage}
        </p>
      ) : null}

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Регистрация…' : 'Зарегистрироваться'}
      </button>
    </form>
  )
}
