import { Skeleton } from '../shared/Skeleton'

export function BoardColumnsSkeleton() {
  return (
    <div
      className="flex gap-3 overflow-x-auto pb-3"
      aria-hidden="true"
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-100/80 p-3 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <Skeleton height="1.25rem" width="55%" />
          <Skeleton height="4.5rem" />
          <Skeleton height="4.5rem" />
          <Skeleton height="2.75rem" />
        </div>
      ))}
    </div>
  )
}
