import { supabase } from './supabaseClient'

export async function ensureUserProfile(
  userId: string,
  email: string | undefined,
): Promise<void> {
  const fallbackName = email?.trim() || 'Пользователь'

  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('id', userId)
    .maybeSingle()

  if (existingError) {
    throw existingError
  }

  if (!existing) {
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      name: fallbackName,
    })

    if (error) {
      throw error
    }

    return
  }

  if (!existing.name?.trim()) {
    const { error } = await supabase
      .from('profiles')
      .update({ name: fallbackName })
      .eq('id', userId)

    if (error) {
      throw error
    }
  }
}
