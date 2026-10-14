import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export function createQueryWrapper(queryClient = createTestQueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

export function renderHookWithQuery<TResult>(
  hook: () => TResult,
  queryClient = createTestQueryClient(),
) {
  return {
    queryClient,
    ...renderHook(hook, {
      wrapper: createQueryWrapper(queryClient),
    }),
  }
}
