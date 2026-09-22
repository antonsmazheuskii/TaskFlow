import type { Notification } from '../../types/notification'
import styles from './Toast.module.css'

type ToastProps = {
  notification: Notification
  onDismiss: (id: string) => void
}

export function Toast({ notification, onDismiss }: ToastProps) {
  const typeClass =
    notification.type === 'error' ? styles.error : styles.success

  return (
    <div
      className={`${styles.toast} ${typeClass}`}
      role={notification.type === 'error' ? 'alert' : 'status'}
    >
      <p className={styles.message}>{notification.message}</p>
      <button
        className={styles.close}
        type="button"
        onClick={() => onDismiss(notification.id)}
        aria-label="Закрыть уведомление"
      >
        ×
      </button>
    </div>
  )
}
