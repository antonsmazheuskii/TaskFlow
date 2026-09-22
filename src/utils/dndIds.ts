export function getColumnDroppableId(columnId: string): string {
  return `column:${columnId}`
}

export function parseColumnDroppableId(id: string | number): string | null {
  const value = String(id)

  if (!value.startsWith('column:')) {
    return null
  }

  return value.slice('column:'.length)
}
