import { Link } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm'
import styles from './AuthPage.module.css'

export function LoginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Вход</h1>
        <p className={styles.subtitle}>Войдите в аккаунт TaskFlow</p>
        <LoginForm />
        <p className={styles.footer}>
          Нет аккаунта?{' '}
          <Link className={styles.link} to="/register">
            Зарегистрироваться
          </Link>
        </p>
      </section>
    </main>
  )
}
