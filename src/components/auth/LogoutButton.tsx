import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from '../../services/authService'
import styles from './LogoutButton.module.css'

export function LogoutButton() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogout() {
    setError(null)
    setIsSubmitting(true)

    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Не удалось выйти.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <button
        className={styles.button}
        type="button"
        onClick={handleLogout}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Выход…' : 'Выйти'}
      </button>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
