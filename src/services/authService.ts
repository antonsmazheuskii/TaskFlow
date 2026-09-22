import type { AuthCredentials } from '../types/auth'
import { supabase } from './supabaseClient'

export async function signUp({ email, password }: AuthCredentials) {
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    throw error
  }

  return data
}

export async function signIn({ email, password }: AuthCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}
