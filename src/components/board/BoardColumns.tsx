import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useColumns } from '../../hooks/useColumns'
import { useTasks } from '../../hooks/useTasks'
import { parseColumnDroppableId } from '../../utils/dndIds'
import { BoardColumn } from './BoardColumn'
import { CreateColumnForm } from './CreateColumnForm'
import styles from './BoardColumns.module.css'

type BoardColumnsProps = {
  boardId: string
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
  } = useTasks(boardId)

  const [moveError, setMoveError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setMoveError(null)

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

    if (!overColumnId || overColumnId === activeTask.column_id) {
      return
    }

    try {
      await moveTaskToColumn(taskId, overColumnId)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось переместить задачу.'
      setMoveError(message)
    }
  }

  if (isColumnsLoading || isTasksLoading) {
    return <p className={styles.status}>Загрузка доски…</p>
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
      {moveError ? (
        <p className={styles.error} role="alert">
          {moveError}
        </p>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.board}>
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={tasks
                .filter((task) => task.column_id === column.id)
                .sort((a, b) => a.position - b.position)}
              onRename={renameColumn}
              onDelete={deleteColumn}
              onCreateTask={createTask}
            />
          ))}
          <CreateColumnForm onCreate={createColumn} />
        </div>
      </DndContext>
    </div>
  )
}
