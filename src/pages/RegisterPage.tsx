import { RegisterForm } from '../components/auth/RegisterForm'
import styles from './RegisterPage.module.css'

export function RegisterPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Регистрация</h1>
        <p className={styles.subtitle}>Создайте аккаунт TaskFlow</p>
        <RegisterForm />
      </section>
    </main>
  )
}
