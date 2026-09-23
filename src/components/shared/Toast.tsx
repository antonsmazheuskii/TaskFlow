import type { Notification } from '../../types/notification'
import { cn, ui } from '../../lib/ui'

type ToastProps = {
  notification: Notification
  onDismiss: (id: string) => void
}

export function Toast({ notification, onDismiss }: ToastProps) {
  const isError = notification.type === 'error'

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 shadow-md animate-toast-in',
        isError
          ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/80 dark:text-rose-200'
          : 'border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-900/60 dark:bg-teal-950/80 dark:text-teal-100',
      )}
      role={isError ? 'alert' : 'status'}
    >
      <p className="flex-1 text-sm font-medium leading-snug">{notification.message}</p>
      <button
        className={ui.btnIcon}
        type="button"
        onClick={() => onDismiss(notification.id)}
        aria-label="Закрыть уведомление"
      >
        ×
      </button>
    </div>
  )
}
