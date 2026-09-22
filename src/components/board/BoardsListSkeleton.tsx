import { Skeleton } from '../shared/Skeleton'
import styles from './BoardsListSkeleton.module.css'

export function BoardsListSkeleton() {
  return (
    <div className={styles.list} aria-busy="true" aria-label="Загрузка досок">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className={styles.item}>
          <Skeleton height="1.1rem" width="60%" />
          <Skeleton height="2rem" width="5rem" />
        </div>
      ))}
    </div>
  )
}
