import { Link } from 'react-router-dom'
import { RegisterForm } from '../components/auth/RegisterForm'
import styles from './AuthPage.module.css'

export function RegisterPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Регистрация</h1>
        <p className={styles.subtitle}>Создайте аккаунт TaskFlow</p>
        <RegisterForm />
        <p className={styles.footer}>
          Уже есть аккаунт?{' '}
          <Link className={styles.link} to="/login">
            Войти
          </Link>
        </p>
      </section>
    </main>
  )
}
