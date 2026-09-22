import { useEffect, useRef } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'

type TaskRealtimeRow = {
  column_id?: string
}

function getTaskColumnId(
  payload: RealtimePostgresChangesPayload<TaskRealtimeRow>,
): string | null {
  const row = (payload.new ?? payload.old) as TaskRealtimeRow | null
  return row?.column_id ?? null
}

export function useBoardRealtime(
  boardId: string | undefined,
  columnIds: string[],
  onBoardChange: () => void,
) {
  const onBoardChangeRef = useRef(onBoardChange)
  onBoardChangeRef.current = onBoardChange

  const columnIdsKey = [...columnIds].sort().join(',')

  useEffect(() => {
    if (!boardId) {
      return
    }

    const columnIdSet = new Set(
      columnIdsKey.length > 0 ? columnIdsKey.split(',') : [],
    )

    const channel = supabase
      .channel(`board-realtime:${boardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${boardId}`,
        },
        () => {
          onBoardChangeRef.current()
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          const columnId = getTaskColumnId(payload)

          if (columnId && columnIdSet.has(columnId)) {
            onBoardChangeRef.current()
          }
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [boardId, columnIdsKey])
}
