import { QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { createAppQueryClient } from '../lib/queryClient'

type AppQueryProviderProps = {
  children: ReactNode
}

export function AppQueryProvider({ children }: AppQueryProviderProps) {
  const [queryClient] = useState(() => createAppQueryClient())

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
