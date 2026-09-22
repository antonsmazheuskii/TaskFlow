export type BoardMember = {
  id: string
  board_id: string
  user_id: string
  role: 'owner' | 'member'
  name: string | null
}

export function getMemberDisplayName(member: BoardMember): string {
  if (member.name?.trim()) {
    return member.name.trim()
  }

  return `Участник ${member.user_id.slice(0, 8)}`
}
