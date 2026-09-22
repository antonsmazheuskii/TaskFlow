import { useColumns } from '../../hooks/useColumns'
import { BoardColumn } from './BoardColumn'
import { CreateColumnForm } from './CreateColumnForm'
import styles from './BoardColumns.module.css'

type BoardColumnsProps = {
  boardId: string
}

export function BoardColumns({ boardId }: BoardColumnsProps) {
  const {
    columns,
    isLoading,
    error,
    createColumn,
    renameColumn,
    deleteColumn,
  } = useColumns(boardId)

  if (isLoading) {
    return <p className={styles.status}>Загрузка колонок…</p>
  }

  if (error) {
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    )
  }

  return (
    <div className={styles.board}>
      {columns.map((column) => (
        <BoardColumn
          key={column.id}
          column={column}
          onRename={renameColumn}
          onDelete={deleteColumn}
        />
      ))}
      <CreateColumnForm onCreate={createColumn} />
    </div>
  )
}
