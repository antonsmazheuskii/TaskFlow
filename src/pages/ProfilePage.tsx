import { useEffect } from 'react'
import { AppHeader } from '../components/shared/AppHeader'
import { Skeleton } from '../components/shared/Skeleton'
import { ProfileForm } from '../components/profile/ProfileForm'
import { useProfile } from '../hooks/useProfile'
import { useNotification } from '../providers/NotificationProvider'
import { ui } from '../lib/ui'

export function ProfilePage() {
  const { profile, isLoading, error, saveProfile } = useProfile()
  const { notifyError } = useNotification()

  useEffect(() => {
    if (error) {
      notifyError(error)
    }
  }, [error, notifyError])

  return (
    <main className={ui.page}>
      <AppHeader breadcrumbs={[{ label: 'Профиль' }]} />

      <section className={ui.pageNarrow} aria-labelledby="profile-heading">
        <h2 id="profile-heading" className={ui.sectionTitle}>
          Профиль
        </h2>

        {isLoading ? (
          <div className="mt-5 flex max-w-md flex-col items-start gap-4">
            <Skeleton height="5.5rem" width="5.5rem" rounded="rounded-full" />
            <Skeleton height="2.5rem" width="100%" />
            <Skeleton height="2.5rem" width="100%" />
          </div>
        ) : null}

        {error && !profile ? (
          <p className={`${ui.errorBox} mt-5`} role="alert">
            {error}
          </p>
        ) : null}

        {profile ? (
          <div className="mt-5">
            <ProfileForm profile={profile} onSave={saveProfile} />
          </div>
        ) : null}
      </section>
    </main>
  )
}
