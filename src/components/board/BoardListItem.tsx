import type { Board } from '../../types/board'
import styles from './BoardListItem.module.css'

type BoardListItemProps = {
  board: Board
}

export function BoardListItem({ board }: BoardListItemProps) {
  return (
    <li className={styles.item}>
      <span className={styles.title}>{board.title}</span>
    </li>
  )
}
