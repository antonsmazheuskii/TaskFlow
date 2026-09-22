import { useState } from 'react'
import styles from './UserAvatar.module.css'

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
  const sizeClass = size === 'md' ? styles.md : styles.sm

  if (avatarUrl && !isBroken) {
    return (
      <img
        className={`${styles.avatar} ${sizeClass}`}
        src={avatarUrl}
        alt=""
        onError={() => setIsBroken(true)}
      />
    )
  }

  return (
    <span
      className={`${styles.avatar} ${styles.placeholder} ${sizeClass}`}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
