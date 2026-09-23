import { useState } from 'react'
import { cn } from '../../lib/ui'

type UserAvatarProps = {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md'
}

export function UserAvatar({
  name,
  avatarUrl,
  size = 'sm',
}: UserAvatarProps) {
  const [isBroken, setIsBroken] = useState(false)
  const initial = (name.trim() || '?').slice(0, 1).toUpperCase()
  const sizeClass = size === 'md' ? 'h-7 w-7 text-[0.7rem]' : 'h-5 w-5 text-[0.6rem]'

  if (avatarUrl && !isBroken) {
    return (
      <img
        className={cn(
          'shrink-0 rounded-full border border-slate-200 object-cover dark:border-slate-700',
          sizeClass,
        )}
        src={avatarUrl}
        alt=""
        onError={() => setIsBroken(true)}
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
        sizeClass,
      )}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
