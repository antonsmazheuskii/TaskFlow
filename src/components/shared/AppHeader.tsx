import { Link } from 'react-router-dom'
import { LogoutButton } from '../auth/LogoutButton'
import { useAuth } from '../../providers/AuthProvider'
import styles from './AppHeader.module.css'

type Breadcrumb = {
  label: string
  to?: string
}

type AppHeaderProps = {
  breadcrumbs?: Breadcrumb[]
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
  const { user } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link className={styles.brand} to="/">
          TaskFlow
        </Link>

        {breadcrumbs.length > 0 ? (
          <nav className={styles.nav} aria-label="Навигация">
            <ol className={styles.breadcrumbs}>
              <li>
                <Link className={styles.crumbLink} to="/">
                  Мои доски
                </Link>
              </li>
              {breadcrumbs.map((crumb) => (
                <li key={crumb.label} className={styles.crumbItem}>
                  <span className={styles.separator} aria-hidden="true">
                    /
                  </span>
                  {crumb.to ? (
                    <Link className={styles.crumbLink} to={crumb.to}>
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={styles.crumbCurrent} aria-current="page">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : (
          <p className={styles.current} aria-current="page">
            Мои доски
          </p>
        )}
      </div>

      <div className={styles.right}>
        {user?.email ? (
          <Link className={styles.profileLink} to="/profile">
            {user.email}
          </Link>
        ) : (
          <Link className={styles.profileLink} to="/profile">
            Профиль
          </Link>
        )}
        <LogoutButton />
      </div>
    </header>
  )
}
