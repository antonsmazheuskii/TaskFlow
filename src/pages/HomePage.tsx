import { BoardsList } from '../components/board/BoardsList'
import { CreateBoardForm } from '../components/board/CreateBoardForm'
import { AppHeader } from '../components/shared/AppHeader'
import { useBoards } from '../hooks/useBoards'
import { ui } from '../lib/ui'

export function HomePage() {
  const { boards, isLoading, error, createBoard, deleteBoard } = useBoards()

  return (
    <main className={ui.page}>
      <AppHeader />

      <section className={ui.pageNarrow} aria-labelledby="boards-heading">
        <h2 id="boards-heading" className={ui.sectionTitle}>
          Мои доски
        </h2>
        <div className="mt-4">
          <CreateBoardForm onCreate={createBoard} />
        </div>
        <div className="mt-5">
          <BoardsList
            boards={boards}
            isLoading={isLoading}
            error={error}
            onDelete={deleteBoard}
          />
        </div>
      </section>
    </main>
  )
}
