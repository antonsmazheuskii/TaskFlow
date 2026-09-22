import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Column } from '../types/column'
import type { Task } from '../types/task'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function mapRealtimeColumn(row: unknown): Column | null {
  if (!isRecord(row) || typeof row.id !== 'string') {
    return null
  }

  return {
    id: row.id,
    board_id: String(row.board_id ?? ''),
    title: String(row.title ?? ''),
    position: Number(row.position ?? 0),
  }
}

export function mapRealtimeTask(row: unknown): Task | null {
  if (!isRecord(row) || typeof row.id !== 'string') {
    return null
  }

  const priority = row.priority

  return {
    id: row.id,
    column_id: String(row.column_id ?? ''),
    title: String(row.title ?? ''),
    description: typeof row.description === 'string' ? row.description : null,
    priority:
      priority === 'low' || priority === 'medium' || priority === 'high'
        ? priority
        : 'medium',
    due_date: typeof row.due_date === 'string' ? row.due_date : null,
    assignee_id: typeof row.assignee_id === 'string' ? row.assignee_id : null,
    position: Number(row.position ?? 0),
    created_by: String(row.created_by ?? ''),
    created_at: String(row.created_at ?? ''),
  }
}

export function getRealtimeRowId(
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
): string | null {
  const row = payload.old ?? payload.new

  if (!isRecord(row) || typeof row.id !== 'string') {
    return null
  }

  return row.id
}

export function getRealtimeTaskColumnId(
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
): string | null {
  const row = payload.new ?? payload.old

  if (!isRecord(row) || typeof row.column_id !== 'string') {
    return null
  }

  return row.column_id
}
