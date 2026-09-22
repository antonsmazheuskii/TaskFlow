import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../providers/NotificationProvider'
import { signOut } from '../../services/authService'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './LogoutButton.module.css'

export function LogoutButton() {
  const navigate = useNavigate()
  const { notifyError } = useNotification()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLogout() {
    setIsSubmitting(true)

    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось выйти.'))
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
    </div>
  )
}
