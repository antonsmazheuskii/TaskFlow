import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTasks } from '../hooks/useTasks'
import { renderHookWithQuery } from '../test/renderHookWithQuery'
import type { Task } from '../types/task'

vi.mock('../providers/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}))

vi.mock('../services/tasksService', () => ({
  fetchTasksByBoardId: vi.fn(),
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  moveTaskToColumn: vi.fn(),
  reorderTasksInColumn: vi.fn(),
  updateTaskDetails: vi.fn(),
}))

import {
  createTask as createTaskRequest,
  deleteTask as deleteTaskRequest,
  fetchTasksByBoardId,
  updateTaskDetails as updateTaskDetailsRequest,
} from '../services/tasksService'

const fetchTasksMock = vi.mocked(fetchTasksByBoardId)
const createTaskMock = vi.mocked(createTaskRequest)
const deleteTaskMock = vi.mocked(deleteTaskRequest)
const updateTaskDetailsMock = vi.mocked(updateTaskDetailsRequest)

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    column_id: 'column-1',
    title: 'First task',
    description: null,
    priority: 'medium',
    due_date: null,
    assignee_id: null,
    position: 0,
    created_by: 'user-1',
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads tasks for board id', async () => {
    const tasks = [makeTask(), makeTask({ id: 'task-2', title: 'Second', position: 1 })]
    fetchTasksMock.mockResolvedValue(tasks)

    const { result } = renderHookWithQuery(() => useTasks('board-1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tasks).toEqual(tasks)
    expect(result.current.error).toBeNull()
    expect(fetchTasksMock).toHaveBeenCalledWith('board-1')
  })

  it('skips fetch when board id is missing', async () => {
    const { result } = renderHookWithQuery(() => useTasks(undefined))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tasks).toEqual([])
    expect(fetchTasksMock).not.toHaveBeenCalled()
  })

  it('applies realtime insert and delete', async () => {
    fetchTasksMock.mockResolvedValue([makeTask()])

    const { result } = renderHookWithQuery(() => useTasks('board-1'))

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1)
    })

    const incoming = makeTask({ id: 'task-rt', title: 'Realtime' })
    result.current.applyRealtimeInsert(incoming)

    await waitFor(() => {
      expect(result.current.tasks.map((task) => task.id)).toEqual([
        'task-1',
        'task-rt',
      ])
    })

    result.current.applyRealtimeDelete('task-1')

    await waitFor(() => {
      expect(result.current.tasks.map((task) => task.id)).toEqual(['task-rt'])
    })
  })

  it('creates task and rolls back failed delete', async () => {
    const existing = makeTask()
    const created = makeTask({ id: 'task-new', title: 'Created', position: 1 })
    fetchTasksMock.mockResolvedValue([existing])
    createTaskMock.mockResolvedValue(created)
    deleteTaskMock.mockRejectedValue(new Error('Удаление недоступно.'))

    const { result } = renderHookWithQuery(() => useTasks('board-1'))

    await waitFor(() => {
      expect(result.current.tasks).toEqual([existing])
    })

    await result.current.createTask('column-1', 'Created')

    await waitFor(() => {
      expect(result.current.tasks).toEqual([existing, created])
    })

    await expect(result.current.deleteTask(created.id)).rejects.toThrow(
      'Удаление недоступно.',
    )

    await waitFor(() => {
      expect(result.current.tasks).toEqual([existing, created])
    })
  })

  it('optimistically updates task details then syncs server payload', async () => {
    const existing = makeTask()
    const updated = makeTask({
      title: 'Updated',
      description: 'Done',
      priority: 'high',
    })
    fetchTasksMock.mockResolvedValue([existing])
    updateTaskDetailsMock.mockResolvedValue(updated)

    const { result } = renderHookWithQuery(() => useTasks('board-1'))

    await waitFor(() => {
      expect(result.current.tasks).toEqual([existing])
    })

    await result.current.updateTaskDetails(existing.id, {
      title: 'Updated',
      description: 'Done',
      priority: 'high',
      due_date: null,
      assignee_id: null,
    })

    await waitFor(() => {
      expect(result.current.tasks).toEqual([updated])
    })
  })
})
