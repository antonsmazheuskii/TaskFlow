import { supabase } from './supabaseClient'

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
