import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  createBoardFor,
  credentials,
  deleteBoard,
  firstColumnId,
  hasIntegrationEnv,
  inviteMember,
  signInAs,
  signOutAll,
  type TestUser,
} from './supabaseTestClient'

describe.skipIf(!hasIntegrationEnv)('remove_board_member (атомарно)', () => {
  let owner: TestUser
  let member: TestUser
  let boardId: string | null = null
  let taskId: string

  beforeAll(async () => {
    owner = await signInAs(credentials.owner)
    member = await signInAs(credentials.member)
    boardId = await createBoardFor(owner, 'it-remove-member')
    await inviteMember(owner, boardId, member.email)

    const columnId = await firstColumnId(owner, boardId)
    const { data, error } = await owner.client
      .from('tasks')
      .insert({
        column_id: columnId,
        title: 'assigned to member',
        created_by: owner.userId,
        assignee_id: member.userId,
      })
      .select('id, assignee_id')
      .single()

    if (error) {
      throw error
    }

    expect(data.assignee_id).toBe(member.userId)
    taskId = data.id
  })

  afterAll(async () => {
    await deleteBoard(owner, boardId)
    await signOutAll([owner, member])
  })

  it('владельца удалить нельзя', async () => {
    const { error } = await owner.client.rpc('remove_board_member', {
      p_board_id: boardId,
      p_user_id: owner.userId,
    })

    expect(error?.message).toContain('владельца')
  })

  it('удаление участника снимает его с задач и закрывает доступ', async () => {
    const { error } = await owner.client.rpc('remove_board_member', {
      p_board_id: boardId,
      p_user_id: member.userId,
    })

    expect(error).toBeNull()

    const { data: task } = await owner.client
      .from('tasks')
      .select('assignee_id')
      .eq('id', taskId)
      .single()

    expect(task?.assignee_id).toBeNull()

    const { data: membership } = await owner.client
      .from('board_members')
      .select('id')
      .eq('board_id', boardId as string)
      .eq('user_id', member.userId)

    expect(membership).toEqual([])

    const { data: boardsForMember } = await member.client
      .from('boards')
      .select('id')
      .eq('id', boardId as string)

    expect(boardsForMember).toEqual([])

    const { data: tasksForMember } = await member.client
      .from('tasks')
      .select('id')
      .eq('id', taskId)

    expect(tasksForMember).toEqual([])
  })

  it('повторное удаление сообщает, что участник не найден', async () => {
    const { error } = await owner.client.rpc('remove_board_member', {
      p_board_id: boardId,
      p_user_id: member.userId,
    })

    expect(error?.message).toContain('не найден')
  })
})
