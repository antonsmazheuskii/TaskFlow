import type { CSSProperties } from 'react'
import styles from './Skeleton.module.css'

type SkeletonProps = {
  width?: string | number
  height?: string | number
  className?: string
}

export function Skeleton({ width, height, className }: SkeletonProps) {
  const style: CSSProperties = {
    width: width ?? '100%',
    height: height ?? '1rem',
  }

  const classes = className ? `${styles.skeleton} ${className}` : styles.skeleton

  return <span className={classes} style={style} aria-hidden="true" />
}
