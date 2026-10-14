import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBoards } from '../hooks/useBoards'
import { renderHookWithQuery } from '../test/renderHookWithQuery'
import type { Board } from '../types/board'

vi.mock('../services/boardsService', () => ({
  fetchMyBoards: vi.fn(),
  createBoard: vi.fn(),
  deleteBoard: vi.fn(),
}))

import {
  createBoard as createBoardRequest,
  deleteBoard as deleteBoardRequest,
  fetchMyBoards,
} from '../services/boardsService'

const fetchMyBoardsMock = vi.mocked(fetchMyBoards)
const createBoardMock = vi.mocked(createBoardRequest)
const deleteBoardMock = vi.mocked(deleteBoardRequest)

function makeBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: 'board-1',
    title: 'Demo Board',
    owner_id: 'user-1',
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('useBoards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads boards into cache', async () => {
    const boards = [makeBoard(), makeBoard({ id: 'board-2', title: 'Second' })]
    fetchMyBoardsMock.mockResolvedValue(boards)

    const { result } = renderHookWithQuery(() => useBoards())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.boards).toEqual(boards)
    expect(result.current.error).toBeNull()
    expect(fetchMyBoardsMock).toHaveBeenCalledTimes(1)
  })

  it('exposes fetch error message', async () => {
    fetchMyBoardsMock.mockRejectedValue(new Error('Нет доступа.'))

    const { result } = renderHookWithQuery(() => useBoards())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.boards).toEqual([])
    expect(result.current.error).toBe('Нет доступа.')
  })

  it('prepends created board and removes deleted board', async () => {
    const existing = makeBoard()
    const created = makeBoard({ id: 'board-new', title: 'New Board' })
    fetchMyBoardsMock.mockResolvedValue([existing])
    createBoardMock.mockResolvedValue(created)
    deleteBoardMock.mockResolvedValue(undefined)

    const { result } = renderHookWithQuery(() => useBoards())

    await waitFor(() => {
      expect(result.current.boards).toEqual([existing])
    })

    await result.current.createBoard('New Board')

    await waitFor(() => {
      expect(result.current.boards).toEqual([created, existing])
    })

    await result.current.deleteBoard(created.id)

    await waitFor(() => {
      expect(result.current.boards).toEqual([existing])
    })

    expect(createBoardMock).toHaveBeenCalledWith(
      'New Board',
      expect.anything(),
    )
    expect(deleteBoardMock).toHaveBeenCalledWith(
      created.id,
      expect.anything(),
    )
  })
})
