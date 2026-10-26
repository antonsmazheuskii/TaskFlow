import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  createBoardFor,
  credentials,
  deleteBoard,
  firstColumnId,
  hasIntegrationEnv,
  signInAs,
  signOutAll,
  type TestUser,
} from './supabaseTestClient'

describe.skipIf(!hasIntegrationEnv)('Конкурентное создание', () => {
  let owner: TestUser
  let boardId: string | null = null

  beforeAll(async () => {
    owner = await signInAs(credentials.owner)
    boardId = await createBoardFor(owner, 'it-concurrency')
  })

  afterAll(async () => {
    await deleteBoard(owner, boardId)
    await signOutAll([owner])
  })

  it('параллельные вставки задач получают уникальные плотные position', async () => {
    const columnId = await firstColumnId(owner, boardId as string)
    const count = 10

    const results = await Promise.all(
      Array.from({ length: count }, (_, index) =>
        owner.client
          .from('tasks')
          .insert({
            column_id: columnId,
            title: `concurrent ${index}`,
            created_by: owner.userId,
          })
          .select('id, position')
          .single(),
      ),
    )

    for (const result of results) {
      expect(result.error).toBeNull()
    }

    const positions = results
      .map((result) => result.data?.position as number)
      .sort((a, b) => a - b)

    expect(new Set(positions).size).toBe(count)
    expect(positions).toEqual(Array.from({ length: count }, (_, i) => i))

    const { data: stored } = await owner.client
      .from('tasks')
      .select('id')
      .eq('column_id', columnId)

    expect(stored).toHaveLength(count)
  })

  it('клиентский position игнорируется — назначает сервер', async () => {
    const columnId = await firstColumnId(owner, boardId as string)

    const { data: before } = await owner.client
      .from('tasks')
      .select('position')
      .eq('column_id', columnId)
      .order('position', { ascending: false })
      .limit(1)

    const expected = (before?.[0]?.position ?? -1) + 1

    const { data, error } = await owner.client
      .from('tasks')
      .insert({
        column_id: columnId,
        title: 'forced position',
        position: 999,
        created_by: owner.userId,
      })
      .select('position')
      .single()

    expect(error).toBeNull()
    expect(data?.position).toBe(expected)
  })

  it('параллельные вставки колонок получают уникальные position', async () => {
    const count = 5

    const results = await Promise.all(
      Array.from({ length: count }, (_, index) =>
        owner.client
          .from('columns')
          .insert({ board_id: boardId, title: `col ${index}` })
          .select('position')
          .single(),
      ),
    )

    for (const result of results) {
      expect(result.error).toBeNull()
    }

    const { data: all } = await owner.client
      .from('columns')
      .select('position')
      .eq('board_id', boardId as string)

    const positions = (all ?? []).map((row) => row.position as number)

    expect(new Set(positions).size).toBe(positions.length)
  })
})
