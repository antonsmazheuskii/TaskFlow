import type { Notification } from '../../types/notification'
import { Toast } from './Toast'
import styles from './ToastContainer.module.css'

type ToastContainerProps = {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export function ToastContainer({
  notifications,
  onDismiss,
}: ToastContainerProps) {
  if (notifications.length === 0) {
    return null
  }

  return (
    <div className={styles.container} aria-live="polite" aria-relevant="additions">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}
