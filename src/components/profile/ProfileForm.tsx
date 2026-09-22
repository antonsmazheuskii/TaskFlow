import { useEffect, useState, type FormEvent } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import type { Profile } from '../../types/profile'
import { getErrorMessage } from '../../utils/getErrorMessage'
import styles from './ProfileForm.module.css'

type ProfileFormProps = {
  profile: Profile
  onSave: (input: { name: string; avatarUrl: string | null }) => Promise<void>
}

export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const { notifyError, notifySuccess } = useNotification()
  const [name, setName] = useState(profile.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [previewBroken, setPreviewBroken] = useState(false)

  useEffect(() => {
    setName(profile.name ?? '')
    setAvatarUrl(profile.avatar_url ?? '')
    setPreviewBroken(false)
  }, [profile])

  const previewUrl = avatarUrl.trim()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)

    try {
      await onSave({
        name,
        avatarUrl: previewUrl || null,
      })
      notifySuccess('Профиль сохранён.')
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось сохранить профиль.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.avatarBlock}>
        {previewUrl && !previewBroken ? (
          <img
            className={styles.avatar}
            src={previewUrl}
            alt="Аватар"
            onError={() => setPreviewBroken(true)}
          />
        ) : (
          <div className={styles.avatarPlaceholder} aria-hidden="true">
            {(name.trim() || '?').slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Имя</span>
        <input
          className={styles.input}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSaving}
          maxLength={80}
          autoComplete="name"
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>URL аватара</span>
        <input
          className={styles.input}
          type="url"
          value={avatarUrl}
          onChange={(event) => {
            setAvatarUrl(event.target.value)
            setPreviewBroken(false)
          }}
          disabled={isSaving}
          placeholder="https://…"
          autoComplete="off"
        />
      </label>

      {profile.email ? (
        <p className={styles.email}>
          Email: <span>{profile.email}</span>
        </p>
      ) : null}

      <button className={styles.submit} type="submit" disabled={isSaving}>
        {isSaving ? 'Сохранение…' : 'Сохранить'}
      </button>
    </form>
  )
}
