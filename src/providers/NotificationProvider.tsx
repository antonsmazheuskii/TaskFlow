import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Notification, NotificationType } from '../types/notification'
import { ToastContainer } from '../components/shared/ToastContainer'

type NotificationContextValue = {
  notify: (type: NotificationType, message: string) => void
  notifyError: (message: string) => void
  notifySuccess: (message: string) => void
  dismiss: (id: string) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
)

const AUTO_DISMISS_MS = 4500

type NotificationProviderProps = {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const dismiss = useCallback((id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    )
  }, [])

  const notify = useCallback((type: NotificationType, message: string) => {
    const id = crypto.randomUUID()
    const notification: Notification = { id, type, message }

    setNotifications((current) => [...current, notification])

    window.setTimeout(() => {
      setNotifications((current) =>
        current.filter((item) => item.id !== id),
      )
    }, AUTO_DISMISS_MS)
  }, [])

  const notifyError = useCallback(
    (message: string) => {
      notify('error', message)
    },
    [notify],
  )

  const notifySuccess = useCallback(
    (message: string) => {
      notify('success', message)
    },
    [notify],
  )

  const value = useMemo(
    () => ({ notify, notifyError, notifySuccess, dismiss }),
    [notify, notifyError, notifySuccess, dismiss],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)

  if (context === undefined) {
    throw new Error('useNotification must be used within NotificationProvider')
  }

  return context
}
