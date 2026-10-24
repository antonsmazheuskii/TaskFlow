type WithId = { id: string }

export function upsertById<T extends WithId>(list: T[], item: T): T[] {
  const index = list.findIndex((entry) => entry.id === item.id)

  if (index === -1) {
    return [...list, item]
  }

  return list.map((entry, position) => (position === index ? item : entry))
}

export function removeById<T extends WithId>(list: T[], id: string): T[] {
  return list.filter((entry) => entry.id !== id)
}
