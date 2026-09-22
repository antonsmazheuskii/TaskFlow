import { useColumns } from '../../hooks/useColumns'
import { useTasks } from '../../hooks/useTasks'
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
  } = useTasks(boardId)

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
    <div className={styles.board}>
      {columns.map((column) => (
        <BoardColumn
          key={column.id}
          column={column}
          tasks={tasks.filter((task) => task.column_id === column.id)}
          onRename={renameColumn}
          onDelete={deleteColumn}
          onCreateTask={createTask}
        />
      ))}
      <CreateColumnForm onCreate={createColumn} />
    </div>
  )
}
