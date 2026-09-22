export type BoardRole = 'owner' | 'member'

export const BOARD_ROLE_LABELS: Record<BoardRole, string> = {
  owner: 'Owner',
  member: 'Member',
}

export type BoardPermissions = {
  canInviteMembers: boolean
  canManageColumns: boolean
  canDeleteBoard: boolean
  canEditTasks: boolean
}

export function getBoardPermissions(
  role: BoardRole | null,
): BoardPermissions {
  if (role === 'owner') {
    return {
      canInviteMembers: true,
      canManageColumns: true,
      canDeleteBoard: true,
      canEditTasks: true,
    }
  }

  if (role === 'member') {
    return {
      canInviteMembers: false,
      canManageColumns: false,
      canDeleteBoard: false,
      canEditTasks: true,
    }
  }

  return {
    canInviteMembers: false,
    canManageColumns: false,
    canDeleteBoard: false,
    canEditTasks: false,
  }
}
