import { screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { ContainersPage } from './ContainersPage'
import { server } from '@/test/server'
import { renderWithQueryClient } from '@/test/utils'

const API_HOST = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')
const API_BASE = `${API_HOST}/api/v1`

describe('ContainersPage', () => {
  it('renders permission-denied state on 403 response', async () => {
    server.use(
      http.get(`${API_BASE}/containers`, () =>
        HttpResponse.json({ detail: 'User is not in admin allowlist' }, { status: 403 }),
      ),
    )

    renderWithQueryClient(<ContainersPage />)

    expect(await screen.findByText(/Permission denied/i)).toBeInTheDocument()
  })
})
