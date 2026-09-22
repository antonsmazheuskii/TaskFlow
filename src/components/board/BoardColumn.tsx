import type { Column } from '../../types/column'
import styles from './BoardColumn.module.css'

type BoardColumnProps = {
  column: Column
}

export function BoardColumn({ column }: BoardColumnProps) {
  return (
    <section className={styles.column}>
      <h3 className={styles.title}>{column.title}</h3>
    </section>
  )
}
