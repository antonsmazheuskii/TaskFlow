import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { signOut as signOutRequest } from '../services/authService'
import { ensureUserProfile } from '../services/profilesService'
import { supabase } from '../services/supabaseClient'
import { getErrorMessage } from '../utils/getErrorMessage'
import { useNotification } from './NotificationProvider'

type AuthContextValue = {
  session: Session | null
  user: User | null
  isLoading: boolean
  profileReady: boolean
  profileError: string | null
  retryProfileSync: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { notifyError } = useNotification()
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileReady, setProfileReady] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const profileErrorNotifiedRef = useRef(false)
  const sessionRef = useRef<Session | null>(null)
  const knownUserIdRef = useRef<string | null | undefined>(undefined)

  const applySession = useCallback(
    (nextSession: Session | null) => {
      const nextUserId = nextSession?.user.id ?? null
      const previousUserId = knownUserIdRef.current

      if (previousUserId !== undefined && previousUserId !== nextUserId) {
        queryClient.clear()
      }

      knownUserIdRef.current = nextUserId
      sessionRef.current = nextSession
      setSession(nextSession)
      setIsLoading(false)
    },
    [queryClient],
  )

  const syncProfile = useCallback(
    async (nextSession: Session | null) => {
      if (!nextSession?.user) {
        setProfileReady(false)
        setProfileError(null)
        profileErrorNotifiedRef.current = false
        return
      }

      try {
        await ensureUserProfile(nextSession.user.id)

        setProfileReady(true)
        setProfileError(null)
        profileErrorNotifiedRef.current = false
      } catch (err) {
        const message = getErrorMessage(
          err,
          'Не удалось сохранить профиль. Приглашения и исполнители могут работать некорректно.',
        )

        console.error('[AuthProvider] ensureUserProfile failed', err)
        setProfileReady(false)
        setProfileError(message)

        if (!profileErrorNotifiedRef.current) {
          profileErrorNotifiedRef.current = true
          notifyError(message)
        }
      }
    },
    [notifyError],
  )

  const retryProfileSync = useCallback(async () => {
    profileErrorNotifiedRef.current = false
    await syncProfile(sessionRef.current)
  }, [syncProfile])

  const signOut = useCallback(async () => {
    await queryClient.cancelQueries()
    await signOutRequest()
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return
      }

      applySession(data.session)
      void syncProfile(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession)
      void syncProfile(nextSession)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [applySession, syncProfile])

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    isLoading,
    profileReady,
    profileError,
    retryProfileSync,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
