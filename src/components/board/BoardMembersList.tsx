import { useState } from 'react'
import { useNotification } from '../../providers/NotificationProvider'
import {
  BOARD_ROLE_LABELS,
  type BoardRole,
} from '../../types/permissions'
import {
  getMemberDisplayName,
  type BoardMember,
} from '../../types/boardMember'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { cn, ui } from '../../lib/ui'
import { UserAvatar } from '../shared/UserAvatar'

type BoardMembersListProps = {
  members: BoardMember[]
  currentUserId: string | undefined
  canManageMembers: boolean
  onRemoveMember: (userId: string) => Promise<void>
}

export function BoardMembersList({
  members,
  currentUserId,
  canManageMembers,
  onRemoveMember,
}: BoardMembersListProps) {
  const { notifyError, notifySuccess } = useNotification()
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)

  if (members.length === 0) {
    return null
  }

  async function handleRemove(member: BoardMember) {
    if (member.role === 'owner') {
      return
    }

    const name = getMemberDisplayName(member)
    const confirmed = window.confirm(
      `Удалить участника «${name}» с доски?`,
    )

    if (!confirmed) {
      return
    }

    setRemovingUserId(member.user_id)

    try {
      await onRemoveMember(member.user_id)
      notifySuccess('Участник удалён.')
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось удалить участника.'))
    } finally {
      setRemovingUserId(null)
    }
  }

  return (
    <section className="w-full max-w-6xl" aria-labelledby="members-heading">
      <h3
        id="members-heading"
        className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300"
      >
        Участники
      </h3>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {members.map((member) => {
          const role = member.role as BoardRole
          const isCurrentUser = member.user_id === currentUserId
          const canRemove =
            canManageMembers && role === 'member' && !isCurrentUser
          const name = getMemberDisplayName(member)

          return (
            <li
              key={member.id}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-2 pl-1 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <UserAvatar
                name={name}
                avatarUrl={member.avatar_url}
                size="sm"
              />
              <span className="text-xs font-medium text-slate-800 dark:text-slate-100">
                {name}
                {isCurrentUser ? ' (вы)' : ''}
              </span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold',
                  role === 'owner'
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                )}
              >
                {BOARD_ROLE_LABELS[role]}
              </span>
              {canRemove ? (
                <button
                  className={ui.btnIconDanger}
                  type="button"
                  onClick={() => void handleRemove(member)}
                  disabled={removingUserId === member.user_id}
                  aria-label={`Удалить участника ${name}`}
                >
                  {removingUserId === member.user_id ? '…' : '×'}
                </button>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
