import { useEffect, useState } from 'react'
import {
  fetchOwnProfile,
  updateOwnProfile,
  type UpdateProfileInput,
} from '../services/profilesService'
import type { Profile } from '../types/profile'
import { useAuth } from '../providers/AuthProvider'

type UseProfileResult = {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  saveProfile: (input: UpdateProfileInput) => Promise<void>
}

export function useProfile(): UseProfileResult {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      if (!user) {
        setProfile(null)
        setError(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchOwnProfile(user.id)

        if (!isMounted) {
          return
        }

        setProfile(data)
      } catch (err) {
        if (!isMounted) {
          return
        }

        setProfile(null)
        const message =
          err instanceof Error ? err.message : 'Не удалось загрузить профиль.'
        setError(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      isMounted = false
    }
  }, [user])

  async function saveProfile(input: UpdateProfileInput) {
    if (!user) {
      throw new Error('Необходимо войти в аккаунт.')
    }

    const updated = await updateOwnProfile(user.id, input)
    setProfile(updated)
  }

  return { profile, isLoading, error, saveProfile }
}
