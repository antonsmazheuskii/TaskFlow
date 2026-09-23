import { Link } from 'react-router-dom'
import { RegisterForm } from '../components/auth/RegisterForm'
import { cn, ui } from '../lib/ui'

export function RegisterPage() {
  return (
    <main
      className={cn(
        ui.page,
        'flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950',
      )}
    >
      <section className={cn(ui.cardPad, 'w-full max-w-md animate-modal-in')}>
        <p className="text-sm font-semibold tracking-wide text-teal-700 dark:text-teal-400">
          TaskFlow
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Регистрация
        </h1>
        <p className="mt-1.5 mb-6 text-sm text-slate-500 dark:text-slate-400">
          Создайте аккаунт, чтобы управлять досками
        </p>
        <RegisterForm />
        <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
          Уже есть аккаунт?{' '}
          <Link className={ui.link} to="/login">
            Войти
          </Link>
        </p>
      </section>
    </main>
  )
}
