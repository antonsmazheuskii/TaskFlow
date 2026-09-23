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
import { ui } from '../lib/ui'

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
      <main className={ui.page}>
        <AppHeader breadcrumbs={[{ label: 'Загрузка…' }]} />
        <div className="mx-auto mb-4 w-full max-w-6xl">
          <Skeleton height="1.75rem" width="40%" />
        </div>
        <section>
          <BoardColumnsSkeleton />
        </section>
      </main>
    )
  }

  if (error || !board) {
    return (
      <main className={ui.page}>
        <AppHeader />
        <div className={ui.pageWide}>
          <p className={ui.errorBox} role="alert">
            {error ?? 'Доска не найдена.'}
          </p>
          <Link className={`${ui.link} mt-4 inline-flex`} to="/">
            Вернуться к списку досок
          </Link>
        </div>
      </main>
    )
  }

  const role = user?.id === board.owner_id ? 'owner' : 'member'
  const permissions = getBoardPermissions(role)

  return (
    <main className={ui.page}>
      <AppHeader
        breadcrumbs={[
          {
            label: `${board.title} · ${BOARD_ROLE_LABELS[role]}`,
          },
        ]}
      />

      <div className="mx-auto mb-4 flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
        {!permissions.canManageColumns ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Роль Member: просмотр доски и редактирование задач.
          </p>
        ) : (
          <span className="flex-1" />
        )}

        {permissions.canDeleteBoard ? (
          <button
            className={ui.btnDanger}
            type="button"
            onClick={() => void handleDeleteBoard()}
            disabled={isDeletingBoard}
          >
            {isDeletingBoard ? 'Удаление…' : 'Удалить доску'}
          </button>
        ) : null}
      </div>

      <section aria-label={`Доска ${board.title}`}>
        <BoardColumns boardId={board.id} ownerId={board.owner_id} />
      </section>
    </main>
  )
}
