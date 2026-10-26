import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Session, User } from '@supabase/supabase-js'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '../lib/queryKeys'
import { createTestQueryClient } from '../test/renderHookWithQuery'
import { AuthProvider, useAuth } from './AuthProvider'
import { NotificationProvider } from './NotificationProvider'

type AuthListener = (event: string, session: Session | null) => void

const authMock = vi.hoisted(() => ({
  session: null as Session | null,
  listeners: [] as AuthListener[],
  signOutError: null as Error | null,
  signOut: vi.fn(),
}))

vi.mock('../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: authMock.session } })),
      onAuthStateChange: vi.fn((listener: AuthListener) => {
        authMock.listeners.push(listener)
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      }),
      signOut: vi.fn(async () => {
        authMock.signOut()
        return { error: authMock.signOutError }
      }),
    },
  },
}))

vi.mock('../services/profilesService', () => ({
  ensureUserProfile: vi.fn(async () => undefined),
}))

function makeSession(userId: string): Session {
  const user = {
    id: userId,
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '2026-01-01T00:00:00.000Z',
  } as User

  return {
    access_token: `token-${userId}`,
    refresh_token: `refresh-${userId}`,
    expires_in: 3600,
    token_type: 'bearer',
    user,
  } as Session
}

function emitAuthChange(session: Session | null) {
  act(() => {
    for (const listener of authMock.listeners) {
      listener(session ? 'SIGNED_IN' : 'SIGNED_OUT', session)
    }
  })
}

function Probe() {
  const { user, signOut } = useAuth()

  return (
    <>
      <span data-testid="user-id">{user?.id ?? 'none'}</span>
      <button
        type="button"
        onClick={() => {
          signOut().catch(() => undefined)
        }}
      >
        logout
      </button>
    </>
  )
}

function renderAuth() {
  const queryClient = createTestQueryClient()

  render(
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>,
  )

  return queryClient
}

describe('AuthProvider — изоляция кэша React Query', () => {
  beforeEach(() => {
    authMock.session = makeSession('user-1')
    authMock.listeners.length = 0
    authMock.signOutError = null
    authMock.signOut.mockClear()
  })

  it('очищает кэш при входе под другим аккаунтом', async () => {
    const queryClient = renderAuth()
    await screen.findByText('user-1')

    queryClient.setQueryData(queryKeys.boards.list('user-1'), [{ id: 'b1' }])
    expect(queryClient.getQueryCache().getAll()).toHaveLength(1)

    emitAuthChange(makeSession('user-2'))

    await screen.findByText('user-2')
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    expect(queryClient.getQueryData(queryKeys.boards.list('user-1'))).toBeUndefined()
  })

  it('не трогает кэш при обновлении токена того же пользователя', async () => {
    const queryClient = renderAuth()
    await screen.findByText('user-1')

    queryClient.setQueryData(queryKeys.boards.list('user-1'), [{ id: 'b1' }])

    emitAuthChange(makeSession('user-1'))

    expect(queryClient.getQueryData(queryKeys.boards.list('user-1'))).toEqual([
      { id: 'b1' },
    ])
  })

  it('очищает кэш при выходе через контекст', async () => {
    const queryClient = renderAuth()
    await screen.findByText('user-1')

    queryClient.setQueryData(queryKeys.boards.list('user-1'), [{ id: 'b1' }])

    fireEvent.click(screen.getByText('logout'))

    await waitFor(() => {
      expect(authMock.signOut).toHaveBeenCalledTimes(1)
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    })
  })

  it('очищает кэш по событию SIGNED_OUT', async () => {
    const queryClient = renderAuth()
    await screen.findByText('user-1')

    queryClient.setQueryData(queryKeys.boards.list('user-1'), [{ id: 'b1' }])

    emitAuthChange(null)

    await screen.findByText('none')
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
  })

  it('сохраняет кэш, если выход завершился ошибкой', async () => {
    authMock.signOutError = new Error('network')
    const queryClient = renderAuth()
    await screen.findByText('user-1')

    queryClient.setQueryData(queryKeys.boards.list('user-1'), [{ id: 'b1' }])

    fireEvent.click(screen.getByText('logout'))

    await waitFor(() => {
      expect(authMock.signOut).toHaveBeenCalledTimes(1)
    })
    expect(queryClient.getQueryData(queryKeys.boards.list('user-1'))).toEqual([
      { id: 'b1' },
    ])
  })
})
