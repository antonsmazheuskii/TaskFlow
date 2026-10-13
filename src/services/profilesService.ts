import { supabase } from './supabaseClient'
import type { Profile } from '../types/profile'

export async function ensureUserProfile(userId: string): Promise<void> {
  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('id', userId)
    .maybeSingle()

  if (existingError) {
    throw existingError
  }

  if (existing) {
    return
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  const fallbackName =
    user?.email?.trim().toLowerCase() || 'Пользователь'

  const { error } = await supabase.from('profiles').insert({
    id: userId,
    name: fallbackName,
  })

  if (error) {
    // Профиль мог создать триггер auth — повторная вставка не ошибка.
    if (error.code === '23505') {
      return
    }

    throw error
  }
}

export async function fetchOwnProfile(userId: string): Promise<Profile> {
  const [{ data, error }, authResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .eq('id', userId)
      .single(),
    supabase.auth.getUser(),
  ])

  if (error) {
    throw error
  }

  if (authResult.error) {
    throw authResult.error
  }

  return {
    id: data.id,
    name: data.name,
    avatar_url: data.avatar_url,
    email: authResult.data.user?.email ?? null,
  }
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
    .select('id, name, avatar_url')
    .single()

  if (error) {
    throw error
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  return {
    id: data.id,
    name: data.name,
    avatar_url: data.avatar_url,
    email: user?.email ?? null,
  }
}
