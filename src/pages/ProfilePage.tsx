import { useEffect } from 'react'
import { AppHeader } from '../components/shared/AppHeader'
import { Skeleton } from '../components/shared/Skeleton'
import { ProfileForm } from '../components/profile/ProfileForm'
import { useProfile } from '../hooks/useProfile'
import { useNotification } from '../providers/NotificationProvider'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const { profile, isLoading, error, saveProfile } = useProfile()
  const { notifyError } = useNotification()

  useEffect(() => {
    if (error) {
      notifyError(error)
    }
  }, [error, notifyError])

  return (
    <main className={styles.page}>
      <AppHeader breadcrumbs={[{ label: 'Профиль' }]} />

      <section className={styles.content} aria-labelledby="profile-heading">
        <h2 id="profile-heading" className={styles.title}>
          Профиль
        </h2>

        {isLoading ? (
          <div className={styles.loading}>
            <Skeleton height="5.5rem" width="5.5rem" />
            <Skeleton height="2.5rem" width="100%" />
            <Skeleton height="2.5rem" width="100%" />
          </div>
        ) : null}

        {error && !profile ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        {profile ? (
          <ProfileForm profile={profile} onSave={saveProfile} />
        ) : null}
      </section>
    </main>
  )
}
