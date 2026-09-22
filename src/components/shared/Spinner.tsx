import styles from './Spinner.module.css'

type SpinnerProps = {
  label?: string
}

export function Spinner({ label = 'Загрузка…' }: SpinnerProps) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  )
}
