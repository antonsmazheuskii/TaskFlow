import { useBoards } from '../../hooks/useBoards'
import { BoardListItem } from './BoardListItem'
import styles from './BoardsList.module.css'

export function BoardsList() {
  const { boards, isLoading, error } = useBoards()

  if (isLoading) {
    return <p className={styles.status}>Загрузка досок…</p>
  }

  if (error) {
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    )
  }

  if (boards.length === 0) {
    return <p className={styles.status}>У вас пока нет досок.</p>
  }

  return (
    <ul className={styles.list}>
      {boards.map((board) => (
        <BoardListItem key={board.id} board={board} />
      ))}
    </ul>
  )
}
