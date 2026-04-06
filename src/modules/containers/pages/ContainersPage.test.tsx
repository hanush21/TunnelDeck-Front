import { screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { ContainersPage } from './ContainersPage'
import { server } from '@/test/server'
import { renderWithQueryClient } from '@/test/utils'

describe('ContainersPage', () => {
  it('renders permission-denied state on 403 response', async () => {
    server.use(
      http.get('http://localhost:8080/containers', () =>
        HttpResponse.json({ message: 'Forbidden' }, { status: 403 }),
      ),
    )

    renderWithQueryClient(<ContainersPage />)

    expect(await screen.findByText(/Permission denied/i)).toBeInTheDocument()
  })
})
