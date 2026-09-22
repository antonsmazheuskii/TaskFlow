export type NotificationType = 'error' | 'success'

export type Notification = {
  id: string
  type: NotificationType
  message: string
}
