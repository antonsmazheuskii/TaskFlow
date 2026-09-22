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
import styles from './BoardMembersList.module.css'

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
    <section className={styles.section} aria-labelledby="members-heading">
      <h3 id="members-heading" className={styles.title}>
        Участники
      </h3>
      <ul className={styles.list}>
        {members.map((member) => {
          const role = member.role as BoardRole
          const isCurrentUser = member.user_id === currentUserId
          const canRemove =
            canManageMembers && role === 'member' && !isCurrentUser

          return (
            <li key={member.id} className={styles.item}>
              <span className={styles.name}>
                {getMemberDisplayName(member)}
                {isCurrentUser ? ' (вы)' : ''}
              </span>
              <span
                className={
                  role === 'owner' ? styles.roleOwner : styles.roleMember
                }
              >
                {BOARD_ROLE_LABELS[role]}
              </span>
              {canRemove ? (
                <button
                  className={styles.remove}
                  type="button"
                  onClick={() => void handleRemove(member)}
                  disabled={removingUserId === member.user_id}
                  aria-label={`Удалить участника ${getMemberDisplayName(member)}`}
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
