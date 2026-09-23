import type { CSSProperties } from 'react'
import { cn } from '../../lib/ui'

type SkeletonProps = {
  width?: string | number
  height?: string | number
  className?: string
  rounded?: string
}

export function Skeleton({
  width,
  height,
  className,
  rounded = 'rounded-xl',
}: SkeletonProps) {
  const style: CSSProperties = {
    width: width ?? '100%',
    height: height ?? '1rem',
  }

  return (
    <span
      className={cn(
        'inline-block animate-pulse bg-slate-200/80 dark:bg-slate-800',
        rounded,
        className,
      )}
      style={style}
      aria-hidden="true"
    />
  )
}
