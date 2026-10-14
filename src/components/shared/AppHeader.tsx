import { Link } from 'react-router-dom'
import { LogoutButton } from '../auth/LogoutButton'
import { useAuth } from '../../providers/AuthProvider'
import { cn, ui } from '../../lib/ui'

type Breadcrumb = {
  label: string
  to?: string
}

type AppHeaderProps = {
  breadcrumbs?: Breadcrumb[]
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
  const { user, profileError, retryProfileSync } = useAuth()

  return (
    <div className="mx-auto mb-6 w-full max-w-6xl sm:mb-8">
      {profileError ? (
        <div className={`${ui.errorBox} mb-3 flex flex-wrap items-center justify-between gap-2`} role="alert">
          <p className="m-0 flex-1">{profileError}</p>
          <button
            className={`${ui.btnSecondary} !min-h-0 px-3 py-1.5 text-xs`}
            type="button"
            onClick={() => void retryProfileSync()}
          >
            Повторить
          </button>
        </div>
      ) : null}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Link
            className="w-fit text-xl font-bold tracking-tight text-slate-900 transition hover:text-teal-700 dark:text-slate-50 dark:hover:text-teal-300 sm:text-2xl"
            to="/"
          >
            TaskFlow
          </Link>

          {breadcrumbs.length > 0 ? (
            <nav aria-label="Навигация">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <Link className={ui.link} to="/">
                    Мои доски
                  </Link>
                </li>
                {breadcrumbs.map((crumb) => (
                  <li key={crumb.label} className="inline-flex items-center gap-1.5">
                    <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                      /
                    </span>
                    {crumb.to ? (
                      <Link className={ui.link} to={crumb.to}>
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className="font-semibold text-slate-800 dark:text-slate-100"
                        aria-current="page"
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400" aria-current="page">
              Мои доски
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <Link
            className={cn(ui.link, 'text-sm break-all')}
            to="/profile"
          >
            {user?.email ?? 'Профиль'}
          </Link>
          <LogoutButton />
        </div>
      </header>
    </div>
  )
}
