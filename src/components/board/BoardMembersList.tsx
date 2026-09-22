import {
  BOARD_ROLE_LABELS,
  type BoardRole,
} from '../../types/permissions'
import {
  getMemberDisplayName,
  type BoardMember,
} from '../../types/boardMember'
import styles from './BoardMembersList.module.css'

type BoardMembersListProps = {
  members: BoardMember[]
  currentUserId: string | undefined
}

export function BoardMembersList({
  members,
  currentUserId,
}: BoardMembersListProps) {
  if (members.length === 0) {
    return null
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
            </li>
          )
        })}
      </ul>
    </section>
  )
}
