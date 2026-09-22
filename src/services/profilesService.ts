import { supabase } from './supabaseClient'
import type { Profile } from '../types/profile'

export async function ensureUserProfile(
  userId: string,
  email: string | undefined,
): Promise<void> {
  const normalizedEmail = email?.trim().toLowerCase() || null
  const fallbackName = normalizedEmail || 'Пользователь'

  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('id', userId)
    .maybeSingle()

  if (existingError) {
    throw existingError
  }

  if (!existing) {
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      name: fallbackName,
      email: normalizedEmail,
    })

    if (error) {
      throw error
    }

    return
  }

  const updates: { name?: string; email?: string } = {}

  if (!existing.name?.trim()) {
    updates.name = fallbackName
  }

  if (!existing.email && normalizedEmail) {
    updates.email = normalizedEmail
  }

  if (Object.keys(updates).length === 0) {
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) {
    throw error
  }
}

export async function fetchOwnProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, avatar_url')
    .eq('id', userId)
    .single()

  if (error) {
    throw error
  }

  return data
}

export type UpdateProfileInput = {
  name: string
  avatarUrl: string | null
}

export async function updateOwnProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<Profile> {
  const trimmedName = input.name.trim()

  if (!trimmedName) {
    throw new Error('Введите имя.')
  }

  const avatarUrl = input.avatarUrl?.trim() || null

  if (avatarUrl) {
    try {
      // eslint-disable-next-line no-new
      new URL(avatarUrl)
    } catch {
      throw new Error('Укажите корректный URL аватара.')
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: trimmedName,
      avatar_url: avatarUrl,
    })
    .eq('id', userId)
    .select('id, name, email, avatar_url')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function findProfileIdByEmail(email: string): Promise<string | null> {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    throw new Error('Введите email.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data?.id ?? null
}
