import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  createAnonClient,
  createBoardFor,
  credentials,
  deleteBoard,
  hasIntegrationEnv,
  inviteMember,
  signInAs,
  signOutAll,
  type TestUser,
} from './supabaseTestClient'

const PERMISSION_DENIED = '42501'

describe.skipIf(!hasIntegrationEnv)('RLS и привилегии', () => {
  let owner: TestUser
  let member: TestUser
  let boardId: string | null = null

  beforeAll(async () => {
    owner = await signInAs(credentials.owner)
    member = await signInAs(credentials.member)
    boardId = await createBoardFor(owner, 'it-rls')
    await inviteMember(owner, boardId, member.email)
  })

  afterAll(async () => {
    await deleteBoard(owner, boardId)
    await signOutAll([owner, member])
  })

  it('anon не читает таблицы приложения', async () => {
    const anon = createAnonClient()
    const { error } = await anon.from('boards').select('id').limit(1)

    expect(error?.code).toBe(PERMISSION_DENIED)
  })

  it('участник не читает email коллеги из profiles', async () => {
    const { error } = await member.client
      .from('profiles')
      .select('email')
      .eq('id', owner.userId)

    expect(error?.code).toBe(PERMISSION_DENIED)
  })

  it('участник читает публичные поля профиля коллеги', async () => {
    const { data, error } = await member.client
      .from('profiles')
      .select('id, name, avatar_url')
      .eq('id', owner.userId)

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data?.[0]).not.toHaveProperty('email')
  })

  it('участник не меняет чужой профиль', async () => {
    const { data, error } = await member.client
      .from('profiles')
      .update({ name: 'hacked' })
      .eq('id', owner.userId)
      .select('id')

    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('участник видит общую доску', async () => {
    const { data, error } = await member.client
      .from('boards')
      .select('id')
      .eq('id', boardId as string)

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
  })

  it('участник не создаёт колонки', async () => {
    const { error } = await member.client
      .from('columns')
      .insert({ board_id: boardId, title: 'forbidden' })
      .select('id')

    expect(error?.code).toBe(PERMISSION_DENIED)
  })

  it('участник не удаляет доску', async () => {
    const { data, error } = await member.client
      .from('boards')
      .delete()
      .eq('id', boardId as string)
      .select('id')

    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('участник не удаляет других участников напрямую', async () => {
    const { data, error } = await member.client
      .from('board_members')
      .delete()
      .eq('board_id', boardId as string)
      .eq('user_id', owner.userId)
      .select('id')

    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it('участник не вызывает remove_board_member', async () => {
    const { error } = await member.client.rpc('remove_board_member', {
      p_board_id: boardId,
      p_user_id: owner.userId,
    })

    expect(error?.message).toContain('Только владелец')
  })

  it('участник не создаёт задачу от чужого имени', async () => {
    const { data: columns } = await member.client
      .from('columns')
      .select('id')
      .eq('board_id', boardId as string)
      .limit(1)

    const { error } = await member.client
      .from('tasks')
      .insert({
        column_id: columns?.[0]?.id,
        title: 'spoofed',
        created_by: owner.userId,
      })
      .select('id')

    expect(error).not.toBeNull()
  })
})
