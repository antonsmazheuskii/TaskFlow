import { Skeleton } from '../shared/Skeleton'

export function BoardsListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton height="4.25rem" />
      <Skeleton height="4.25rem" />
      <Skeleton height="4.25rem" />
    </div>
  )
}
