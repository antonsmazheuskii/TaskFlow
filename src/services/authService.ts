import type { SignUpCredentials } from '../types/auth'
import { supabase } from './supabaseClient'

export async function signUp({ email, password }: SignUpCredentials) {
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    throw error
  }

  return data
}
