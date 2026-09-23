import { useEffect, useState, type FormEvent } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import type { Profile } from '../../types/profile'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { ui } from '../../lib/ui'

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
    <form className={`${ui.cardPad} flex max-w-md flex-col gap-4`} onSubmit={handleSubmit}>
      <div className="flex justify-center">
        {previewUrl && !previewBroken ? (
          <img
            className="h-24 w-24 rounded-full border border-slate-200 object-cover shadow-sm dark:border-slate-700"
            src={previewUrl}
            alt="Аватар"
            onError={() => setPreviewBroken(true)}
          />
        ) : (
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-3xl font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            aria-hidden="true"
          >
            {(name.trim() || '?').slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={ui.label}>Имя</span>
        <input
          className={ui.input}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSaving}
          maxLength={80}
          autoComplete="name"
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={ui.label}>URL аватара</span>
        <input
          className={ui.input}
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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Email:{' '}
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {profile.email}
          </span>
        </p>
      ) : null}

      <button className={`${ui.btnPrimary} self-start`} type="submit" disabled={isSaving}>
        {isSaving ? 'Сохранение…' : 'Сохранить'}
      </button>
    </form>
  )
}
