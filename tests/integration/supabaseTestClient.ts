import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type Credentials = {
  email: string
  password: string
}

export type TestUser = {
  client: SupabaseClient
  userId: string
  email: string
}

const url = process.env.VITE_SUPABASE_URL ?? ''
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? ''

export const hasIntegrationEnv = url !== '' && anonKey !== ''

export const credentials = {
  owner: {
    email: process.env.TEST_OWNER_EMAIL ?? 'owner@taskflow.demo',
    password: process.env.TEST_OWNER_PASSWORD ?? 'TaskFlowOwner1!',
  },
  member: {
    email: process.env.TEST_MEMBER_EMAIL ?? 'member@taskflow.demo',
    password: process.env.TEST_MEMBER_PASSWORD ?? 'TaskFlowMember1!',
  },
} satisfies Record<string, Credentials>

export function createAnonClient(): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export async function signInAs({ email, password }: Credentials): Promise<TestUser> {
  const client = createAnonClient()
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    throw new Error(
      `Не удалось войти как ${email}: ${error?.message ?? 'нет пользователя'}`,
    )
  }

  return { client, userId: data.user.id, email }
}

export async function createBoardFor(
  owner: TestUser,
  titlePrefix: string,
): Promise<string> {
  const { data, error } = await owner.client.rpc('create_board_with_defaults', {
    p_title: `${titlePrefix} ${Date.now()}`,
  })

  if (error) {
    throw error
  }

  const row = (Array.isArray(data) ? data[0] : data) as { id: string } | null

  if (!row) {
    throw new Error('create_board_with_defaults вернула пустой результат.')
  }

  return row.id
}

export async function inviteMember(
  owner: TestUser,
  boardId: string,
  email: string,
): Promise<void> {
  const { error } = await owner.client.rpc('invite_board_member', {
    p_board_id: boardId,
    p_email: email,
  })

  if (error) {
    throw error
  }
}

export async function firstColumnId(
  user: TestUser,
  boardId: string,
): Promise<string> {
  const { data, error } = await user.client
    .from('columns')
    .select('id')
    .eq('board_id', boardId)
    .order('position', { ascending: true })
    .limit(1)
    .single()

  if (error) {
    throw error
  }

  return data.id
}

export async function deleteBoard(owner: TestUser, boardId: string | null) {
  if (!boardId) {
    return
  }

  await owner.client.from('boards').delete().eq('id', boardId)
}

export async function signOutAll(users: Array<TestUser | undefined>) {
  await Promise.all(users.map((user) => user?.client.auth.signOut()))
}
