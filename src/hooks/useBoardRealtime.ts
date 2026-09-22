import { useEffect, useRef } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'
import type { Column } from '../types/column'
import type { Task } from '../types/task'
import {
  getRealtimeRowId,
  getRealtimeTaskColumnId,
  mapRealtimeColumn,
  mapRealtimeTask,
} from '../utils/realtimeMappers'

type BoardRealtimeHandlers = {
  onColumnInsert: (column: Column) => void
  onColumnUpdate: (column: Column) => void
  onColumnDelete: (columnId: string) => void
  onTaskInsert: (task: Task) => void
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
}

export function useBoardRealtime(
  boardId: string | undefined,
  columnIds: string[],
  handlers: BoardRealtimeHandlers,
) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const columnIdsKey = [...columnIds].sort().join(',')

  useEffect(() => {
    if (!boardId) {
      return
    }

    const columnIdSet = new Set(
      columnIdsKey.length > 0 ? columnIdsKey.split(',') : [],
    )

    function handleColumnChange(
      payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
    ) {
      if (payload.eventType === 'INSERT') {
        const column = mapRealtimeColumn(payload.new)
        if (column) {
          handlersRef.current.onColumnInsert(column)
        }
        return
      }

      if (payload.eventType === 'UPDATE') {
        const column = mapRealtimeColumn(payload.new)
        if (column) {
          handlersRef.current.onColumnUpdate(column)
        }
        return
      }

      if (payload.eventType === 'DELETE') {
        const columnId = getRealtimeRowId(payload)
        if (columnId) {
          handlersRef.current.onColumnDelete(columnId)
        }
      }
    }

    function handleTaskChange(
      payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
    ) {
      const relatedColumnId = getRealtimeTaskColumnId(payload)
      const oldColumnId =
        payload.old && typeof payload.old === 'object' && 'column_id' in payload.old
          ? String((payload.old as { column_id?: string }).column_id ?? '')
          : null

      const belongsToBoard =
        (relatedColumnId && columnIdSet.has(relatedColumnId)) ||
        (oldColumnId && columnIdSet.has(oldColumnId))

      if (!belongsToBoard) {
        return
      }

      if (payload.eventType === 'INSERT') {
        const task = mapRealtimeTask(payload.new)
        if (task) {
          handlersRef.current.onTaskInsert(task)
        }
        return
      }

      if (payload.eventType === 'UPDATE') {
        const task = mapRealtimeTask(payload.new)
        if (task) {
          handlersRef.current.onTaskUpdate(task)
        }
        return
      }

      if (payload.eventType === 'DELETE') {
        const taskId = getRealtimeRowId(payload)
        if (taskId) {
          handlersRef.current.onTaskDelete(taskId)
        }
      }
    }

    const channel = supabase
      .channel(`board-realtime:${boardId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${boardId}`,
        },
        handleColumnChange,
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${boardId}`,
        },
        handleColumnChange,
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${boardId}`,
        },
        handleColumnChange,
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks',
        },
        handleTaskChange,
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
        },
        handleTaskChange,
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tasks',
        },
        handleTaskChange,
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [boardId, columnIdsKey])
}
