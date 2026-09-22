import { Skeleton } from '../shared/Skeleton'
import styles from './BoardColumnsSkeleton.module.css'

export function BoardColumnsSkeleton() {
  return (
    <div
      className={styles.board}
      aria-busy="true"
      aria-label="Загрузка колонок"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className={styles.column}>
          <Skeleton height="1rem" width="50%" />
          <Skeleton height="3rem" />
          <Skeleton height="3rem" />
          <Skeleton height="2.25rem" />
        </div>
      ))}
    </div>
  )
}
