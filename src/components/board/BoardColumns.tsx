import { useState } from 'react'
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
import { parseColumnDroppableId } from '../../utils/dndIds'
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
    moveTaskToColumn,
    reorderTasksInColumn,
    deleteTask,
  } = useTasks(boardId)

  const [dndError, setDndError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setDndError(null)

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
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось обновить порядок задач.'
      setDndError(message)
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
      {dndError ? (
        <p className={styles.error} role="alert">
          {dndError}
        </p>
      ) : null}

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
              onDeleteTask={deleteTask}
            />
          ))}
          <CreateColumnForm onCreate={createColumn} />
        </div>
      </DndContext>
    </div>
  )
}
