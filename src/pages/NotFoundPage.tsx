import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { cn, ui } from '../lib/ui'

export function NotFoundPage() {
  const location = useLocation()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    const previousTitle = document.title
    document.title = '404 — TaskFlow'

    return () => {
      document.title = previousTitle
    }
  }, [])

  const homeTo = user ? '/' : '/login'

  return (
    <main
      className={cn(
        ui.page,
        'flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950',
      )}
    >
      <section
        className={cn(ui.cardPad, 'w-full max-w-md text-center animate-modal-in')}
        aria-labelledby="not-found-heading"
      >
        <p className="text-sm font-semibold tracking-wide text-teal-700 dark:text-teal-400">
          TaskFlow
        </p>
        <p className="mt-4 text-5xl font-bold tracking-tight text-slate-300 dark:text-slate-600">
          404
        </p>
        <h1
          id="not-found-heading"
          className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
        >
          Страница не найдена
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Маршрут{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {location.pathname}
          </code>{' '}
          не существует или был удалён.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {!isLoading ? (
            <Link className={ui.btnPrimary} to={homeTo}>
              {user ? 'К доскам' : 'Войти'}
            </Link>
          ) : null}
          {user ? (
            <Link className={ui.btnSecondary} to="/profile">
              Профиль
            </Link>
          ) : (
            <Link className={ui.btnSecondary} to="/register">
              Регистрация
            </Link>
          )}
        </div>
      </section>
    </main>
  )
}
