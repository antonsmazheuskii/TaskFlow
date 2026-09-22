import { useColumns } from '../../hooks/useColumns'
import { BoardColumn } from './BoardColumn'
import styles from './BoardColumns.module.css'

type BoardColumnsProps = {
  boardId: string
}

export function BoardColumns({ boardId }: BoardColumnsProps) {
  const { columns, isLoading, error } = useColumns(boardId)

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

  if (columns.length === 0) {
    return <p className={styles.status}>На доске пока нет колонок.</p>
  }

  return (
    <div className={styles.board}>
      {columns.map((column) => (
        <BoardColumn key={column.id} column={column} />
      ))}
    </div>
  )
}
