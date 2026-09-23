import { useEffect, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useColumns } from '../../hooks/useColumns'
import { useBoardMembers } from '../../hooks/useBoardMembers'
import { useBoardRealtime } from '../../hooks/useBoardRealtime'
import { useTasks } from '../../hooks/useTasks'
import { useAuth } from '../../providers/AuthProvider'
import { useNotification } from '../../providers/NotificationProvider'
import {
  getMemberDisplayName,
} from '../../types/boardMember'
import {
  getBoardPermissions,
  type BoardRole,
} from '../../types/permissions'
import type { Task } from '../../types/task'
import { parseColumnDroppableId } from '../../utils/dndIds'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { TaskDetailsModal } from '../task/TaskDetailsModal'
import { BoardColumn } from './BoardColumn'
import { BoardColumnsSkeleton } from './BoardColumnsSkeleton'
import { BoardMembersList } from './BoardMembersList'
import { CreateColumnForm } from './CreateColumnForm'
import { InviteBoardMemberForm } from './InviteBoardMemberForm'
import { ui } from '../../lib/ui'

type BoardColumnsProps = {
  boardId: string
  ownerId: string
}

function sortByPosition<T extends { position: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.position - b.position)
}

export function BoardColumns({ boardId, ownerId }: BoardColumnsProps) {
  const { user } = useAuth()
  const { notifyError } = useNotification()

  const {
    columns,
    isLoading: isColumnsLoading,
    error: columnsError,
    applyRealtimeInsert: applyColumnInsert,
    applyRealtimeUpdate: applyColumnUpdate,
    applyRealtimeDelete: applyColumnDelete,
    createColumn,
    renameColumn,
    deleteColumn,
  } = useColumns(boardId)

  const {
    tasks,
    isLoading: isTasksLoading,
    error: tasksError,
    applyRealtimeInsert: applyTaskInsert,
    applyRealtimeUpdate: applyTaskUpdate,
    applyRealtimeDelete: applyTaskDelete,
    applyRealtimeDeleteByColumn: applyTaskDeleteByColumn,
    createTask,
    updateTaskDetails,
    moveTaskToColumn,
    reorderTasksInColumn,
    deleteTask,
  } = useTasks(boardId)

  const {
    members,
    isLoading: isMembersLoading,
    error: membersError,
    inviteByEmail,
    removeMember,
  } = useBoardMembers(boardId)

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? null

  const membersById = new Map(
    members.map((member) => [member.user_id, member]),
  )

  const membership = user
    ? members.find((member) => member.user_id === user.id)
    : undefined

  const role: BoardRole | null = membership
    ? (membership.role as BoardRole)
    : user?.id === ownerId
      ? 'owner'
      : null

  const permissions = getBoardPermissions(role)

  function getAssigneeLabel(assigneeId: string | null): string | null {
    if (!assigneeId) {
      return null
    }

    const member = membersById.get(assigneeId)

    if (!member) {
      return `Участник ${assigneeId.slice(0, 8)}`
    }

    return getMemberDisplayName(member)
  }

  function getAssigneeAvatarUrl(assigneeId: string | null): string | null {
    if (!assigneeId) {
      return null
    }

    return membersById.get(assigneeId)?.avatar_url ?? null
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  )

  useBoardRealtime(
    boardId,
    columns.map((column) => column.id),
    {
      onColumnInsert: applyColumnInsert,
      onColumnUpdate: applyColumnUpdate,
      onColumnDelete: (columnId) => {
        applyColumnDelete(columnId)
        applyTaskDeleteByColumn(columnId)
      },
      onTaskInsert: applyTaskInsert,
      onTaskUpdate: applyTaskUpdate,
      onTaskDelete: applyTaskDelete,
    },
  )

  useEffect(() => {
    if (columnsError) {
      notifyError(columnsError)
    }
  }, [columnsError, notifyError])

  useEffect(() => {
    if (tasksError) {
      notifyError(tasksError)
    }
  }, [tasksError, notifyError])

  useEffect(() => {
    if (membersError) {
      notifyError(membersError)
    }
  }, [membersError, notifyError])

  function handleOpenTask(task: Task) {
    setSelectedTaskId(task.id)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || !permissions.canEditTasks) {
      return
    }

    const taskId = String(active.id)
    const overId = String(over.id)

    if (taskId === overId) {
      return
    }

    const activeTask = tasks.find((task) => task.id === taskId)

    if (!activeTask) {
      return
    }

    const overColumnId =
      parseColumnDroppableId(overId) ??
      tasks.find((task) => task.id === overId)?.column_id ??
      null

    if (!overColumnId) {
      return
    }

    try {
      if (activeTask.column_id === overColumnId) {
        const columnTasks = sortByPosition(
          tasks.filter((task) => task.column_id === overColumnId),
        )
        const oldIndex = columnTasks.findIndex((task) => task.id === taskId)
        const newIndex = parseColumnDroppableId(overId)
          ? columnTasks.length - 1
          : columnTasks.findIndex((task) => task.id === overId)

        if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
          return
        }

        await reorderTasksInColumn(
          overColumnId,
          arrayMove(columnTasks, oldIndex, newIndex).map((task) => task.id),
        )
        return
      }

      const targetTasks = sortByPosition(
        tasks.filter((task) => task.column_id === overColumnId),
      )
      const targetIndex = parseColumnDroppableId(overId)
        ? targetTasks.length
        : targetTasks.findIndex((task) => task.id === overId)

      await moveTaskToColumn(
        taskId,
        overColumnId,
        targetIndex < 0 ? targetTasks.length : targetIndex,
      )
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось обновить порядок задач.'))
    }
  }

  if (isColumnsLoading || isTasksLoading) {
    return <BoardColumnsSkeleton />
  }

  if (columnsError || tasksError) {
    return (
      <p className={ui.errorBox} role="alert">
        {columnsError ?? tasksError}
      </p>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <BoardMembersList
        members={members}
        currentUserId={user?.id}
        canManageMembers={permissions.canInviteMembers}
        onRemoveMember={removeMember}
      />

      {permissions.canInviteMembers ? (
        <div className={`${ui.cardPad} max-w-6xl`}>
          <InviteBoardMemberForm onInvite={inviteByEmail} />
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="-mx-4 flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain px-4 pb-3 sm:-mx-6 sm:px-6">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={sortByPosition(
                tasks.filter((task) => task.column_id === column.id),
              )}
              canManageColumns={permissions.canManageColumns}
              onRename={renameColumn}
              onDelete={deleteColumn}
              onCreateTask={createTask}
              onOpenTask={handleOpenTask}
              onDeleteTask={deleteTask}
              getAssigneeLabel={getAssigneeLabel}
              getAssigneeAvatarUrl={getAssigneeAvatarUrl}
            />
          ))}
          {permissions.canManageColumns ? (
            <CreateColumnForm onCreate={createColumn} />
          ) : null}
        </div>
      </DndContext>

      {selectedTask ? (
        <TaskDetailsModal
          task={selectedTask}
          members={members}
          areMembersLoading={isMembersLoading}
          onSave={updateTaskDetails}
          onClose={() => setSelectedTaskId(null)}
        />
      ) : null}
    </div>
  )
}
