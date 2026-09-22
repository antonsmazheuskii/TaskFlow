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
import { useTasks } from '../../hooks/useTasks'
import { useNotification } from '../../providers/NotificationProvider'
import type { Task } from '../../types/task'
import { parseColumnDroppableId } from '../../utils/dndIds'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { TaskDetailsModal } from '../task/TaskDetailsModal'
import { BoardColumn } from './BoardColumn'
import { BoardColumnsSkeleton } from './BoardColumnsSkeleton'
import { CreateColumnForm } from './CreateColumnForm'
import styles from './BoardColumns.module.css'

type BoardColumnsProps = {
  boardId: string
}

function sortByPosition<T extends { position: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.position - b.position)
}

export function BoardColumns({ boardId }: BoardColumnsProps) {
  const { notifyError } = useNotification()

  const {
    columns,
    isLoading: isColumnsLoading,
    error: columnsError,
    createColumn,
    renameColumn,
    deleteColumn,
  } = useColumns(boardId)

  const {
    tasks,
    isLoading: isTasksLoading,
    error: tasksError,
    createTask,
    updateTaskDetails,
    moveTaskToColumn,
    reorderTasksInColumn,
    deleteTask,
  } = useTasks(boardId)

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? null

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
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
    if (selectedTaskId && !tasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(null)
    }
  }, [selectedTaskId, tasks])

  function handleOpenTask(task: Task) {
    setSelectedTaskId(task.id)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) {
      return
    }

    const taskId = String(active.id)
    const activeTask = tasks.find((task) => task.id === taskId)

    if (!activeTask) {
      return
    }

    const overId = String(over.id)
    const overColumnId =
      parseColumnDroppableId(overId) ??
      tasks.find((task) => task.id === overId)?.column_id ??
      null

    if (!overColumnId) {
      return
    }

    try {
      if (overColumnId === activeTask.column_id) {
        const columnTasks = sortByPosition(
          tasks.filter((task) => task.column_id === overColumnId),
        )
        const oldIndex = columnTasks.findIndex((task) => task.id === taskId)

        if (oldIndex < 0) {
          return
        }

        const newIndex = parseColumnDroppableId(overId)
          ? columnTasks.length - 1
          : columnTasks.findIndex((task) => task.id === overId)

        if (newIndex < 0 || oldIndex === newIndex) {
          return
        }

        const reordered = arrayMove(columnTasks, oldIndex, newIndex)
        await reorderTasksInColumn(
          overColumnId,
          reordered.map((task) => task.id),
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
      <p className={styles.error} role="alert">
        {columnsError ?? tasksError}
      </p>
    )
  }

  return (
    <div className={styles.wrapper}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.board}>
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={sortByPosition(
                tasks.filter((task) => task.column_id === column.id),
              )}
              onRename={renameColumn}
              onDelete={deleteColumn}
              onCreateTask={createTask}
              onOpenTask={handleOpenTask}
              onDeleteTask={deleteTask}
            />
          ))}
          <CreateColumnForm onCreate={createColumn} />
        </div>
      </DndContext>

      {selectedTask ? (
        <TaskDetailsModal
          task={selectedTask}
          onSave={updateTaskDetails}
          onClose={() => setSelectedTaskId(null)}
        />
      ) : null}
    </div>
  )
}
