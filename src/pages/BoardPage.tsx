import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BoardColumns } from '../components/board/BoardColumns'
import { BoardColumnsSkeleton } from '../components/board/BoardColumnsSkeleton'
import { AppHeader } from '../components/shared/AppHeader'
import { Skeleton } from '../components/shared/Skeleton'
import { useBoard } from '../hooks/useBoard'
import { useAuth } from '../providers/AuthProvider'
import { useNotification } from '../providers/NotificationProvider'
import { deleteBoard } from '../services/boardsService'
import {
  BOARD_ROLE_LABELS,
  getBoardPermissions,
} from '../types/permissions'
import { getErrorMessage } from '../utils/getErrorMessage'
import styles from './BoardPage.module.css'

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { board, isLoading, error } = useBoard(boardId)
  const { notifyError, notifySuccess } = useNotification()
  const [isDeletingBoard, setIsDeletingBoard] = useState(false)

  useEffect(() => {
    if (error) {
      notifyError(error)
    }
  }, [error, notifyError])

  async function handleDeleteBoard() {
    if (!board) {
      return
    }

    const confirmed = window.confirm(
      `Удалить доску «${board.title}»? Это действие нельзя отменить.`,
    )

    if (!confirmed) {
      return
    }

    setIsDeletingBoard(true)

    try {
      await deleteBoard(board.id)
      notifySuccess('Доска удалена.')
      navigate('/', { replace: true })
    } catch (err) {
      notifyError(getErrorMessage(err, 'Не удалось удалить доску.'))
      setIsDeletingBoard(false)
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <AppHeader breadcrumbs={[{ label: 'Загрузка…' }]} />
        <div className={styles.loadingTitle}>
          <Skeleton height="1.75rem" width="40%" />
        </div>
        <section className={styles.columns}>
          <BoardColumnsSkeleton />
        </section>
      </main>
    )
  }

  if (error || !board) {
    return (
      <main className={styles.page}>
        <AppHeader />
        <p className={styles.error} role="alert">
          {error ?? 'Доска не найдена.'}
        </p>
        <Link className={styles.back} to="/">
          Вернуться к списку досок
        </Link>
      </main>
    )
  }

  const role = user?.id === board.owner_id ? 'owner' : 'member'
  const permissions = getBoardPermissions(role)

  return (
    <main className={styles.page}>
      <AppHeader
        breadcrumbs={[
          {
            label: `${board.title} · ${BOARD_ROLE_LABELS[role]}`,
          },
        ]}
      />

      <div className={styles.toolbar}>
        {!permissions.canManageColumns ? (
          <p className={styles.roleHint}>
            Роль Member: просмотр доски и редактирование задач.
          </p>
        ) : (
          <span className={styles.toolbarSpacer} />
        )}

        {permissions.canDeleteBoard ? (
          <button
            className={styles.deleteBoard}
            type="button"
            onClick={() => void handleDeleteBoard()}
            disabled={isDeletingBoard}
          >
            {isDeletingBoard ? 'Удаление…' : 'Удалить доску'}
          </button>
        ) : null}
      </div>

      <section className={styles.columns} aria-label={`Доска ${board.title}`}>
        <BoardColumns boardId={board.id} ownerId={board.owner_id} />
      </section>
    </main>
  )
}
