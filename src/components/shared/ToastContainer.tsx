import type { Notification } from '../../types/notification'
import { Toast } from './Toast'

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
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(100%-2rem,22rem)] flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast notification={notification} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
