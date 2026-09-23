import type { BoardMember } from '../../types/boardMember'
import type { Task, TaskDetailsUpdate } from '../../types/task'
import { useNotification } from '../../providers/NotificationProvider'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { Modal } from '../shared/Modal'
import { TaskComments } from './TaskComments'
import { TaskDetailsForm } from './TaskDetailsForm'

type TaskDetailsModalProps = {
  task: Task
  members: BoardMember[]
  areMembersLoading: boolean
  onSave: (taskId: string, details: TaskDetailsUpdate) => Promise<void>
  onClose: () => void
}

export function TaskDetailsModal({
  task,
  members,
  areMembersLoading,
  onSave,
  onClose,
}: TaskDetailsModalProps) {
  const { notifyError, notifySuccess } = useNotification()

  async function handleSave(details: TaskDetailsUpdate) {
    try {
      await onSave(task.id, details)
      notifySuccess('Задача сохранена.')
      onClose()
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось сохранить задачу.'))
    }
  }

  return (
    <Modal title="Детали задачи" onClose={onClose}>
      <div className="flex flex-col gap-6">
        <TaskDetailsForm
          task={task}
          members={members}
          areMembersLoading={areMembersLoading}
          onSave={handleSave}
          onCancel={onClose}
        />
        <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
          <TaskComments taskId={task.id} />
        </div>
      </div>
    </Modal>
  )
}
