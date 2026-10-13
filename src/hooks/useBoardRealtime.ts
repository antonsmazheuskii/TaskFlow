import { useEffect, useRef } from 'react'
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
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
  onResync: () => Promise<void>
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

    let resyncTimer: ReturnType<typeof setTimeout> | null = null
    let hasSubscribedOnce = false

    function scheduleResync() {
      if (resyncTimer) {
        clearTimeout(resyncTimer)
      }

      resyncTimer = setTimeout(() => {
        void handlersRef.current.onResync()
      }, 150)
    }

    function handleColumnChange(
      payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
    ) {
      if (payload.eventType === 'INSERT') {
        const column = mapRealtimeColumn(payload.new)
        if (column && column.board_id === boardId) {
          handlersRef.current.onColumnInsert(column)
        }
        return
      }

      if (payload.eventType === 'UPDATE') {
        const column = mapRealtimeColumn(payload.new)
        if (!column) {
          return
        }

        if (column.board_id === boardId) {
          handlersRef.current.onColumnUpdate(column)
          return
        }

        // Колонка ушла с доски / стала недоступна по RLS — убрать локально.
        handlersRef.current.onColumnDelete(column.id)
        return
      }

      if (payload.eventType === 'DELETE') {
        const columnId = getRealtimeRowId(payload)
        if (!columnId) {
          return
        }

        const oldBoardId =
          payload.old &&
          typeof payload.old === 'object' &&
          'board_id' in payload.old
            ? String((payload.old as { board_id?: string }).board_id ?? '')
            : null

        // При replica identity default old может содержать только id —
        // всё равно удаляем, если колонка была на этой доске (или id известен).
        if (
          oldBoardId === boardId ||
          oldBoardId === null ||
          columnIdSet.has(columnId)
        ) {
          handlersRef.current.onColumnDelete(columnId)
        }
      }
    }

    function handleTaskChange(
      payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
    ) {
      if (payload.eventType === 'DELETE') {
        const taskId = getRealtimeRowId(payload)
        if (taskId) {
          // Не зависим от column_id в old: локальный стейт сам отфильтрует чужие id.
          handlersRef.current.onTaskDelete(taskId)
        }
        return
      }

      const relatedColumnId = getRealtimeTaskColumnId(payload)
      const oldColumnId =
        payload.old &&
        typeof payload.old === 'object' &&
        'column_id' in payload.old
          ? String((payload.old as { column_id?: string }).column_id ?? '')
          : null

      const belongsToBoard =
        (relatedColumnId !== null && columnIdSet.has(relatedColumnId)) ||
        (oldColumnId !== null &&
          oldColumnId !== '' &&
          columnIdSet.has(oldColumnId))

      if (payload.eventType === 'INSERT') {
        if (!belongsToBoard) {
          return
        }

        const task = mapRealtimeTask(payload.new)
        if (task) {
          handlersRef.current.onTaskInsert(task)
        }
        return
      }

      if (payload.eventType === 'UPDATE') {
        const task = mapRealtimeTask(payload.new)

        if (!task) {
          return
        }

        if (columnIdSet.has(task.column_id)) {
          handlersRef.current.onTaskUpdate(task)
          return
        }

        // Задача ушла с колонок этой доски / стала невидимой — удалить локально.
        if (oldColumnId && columnIdSet.has(oldColumnId)) {
          handlersRef.current.onTaskDelete(task.id)
        }
      }
    }

    const channel: RealtimeChannel = supabase
      .channel(`board-realtime:${boardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${boardId}`,
        },
        handleColumnChange,
      )
      // DELETE без фильтра: если old без board_id, фильтрованная подписка молчит.
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'columns',
        },
        handleColumnChange,
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        handleTaskChange,
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          if (hasSubscribedOnce) {
            scheduleResync()
          }
          hasSubscribedOnce = true
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          scheduleResync()
        }
      })

    return () => {
      if (resyncTimer) {
        clearTimeout(resyncTimer)
      }
      void supabase.removeChannel(channel)
    }
  }, [boardId, columnIdsKey])
}
