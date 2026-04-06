import { screen } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { AuditPage } from '@/modules/audit/pages/AuditPage'
import { ContainersPage } from '@/modules/containers/pages/ContainersPage'
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage'
import { ExposuresPage } from '@/modules/exposures/pages/ExposuresPage'
import { server } from '@/test/server'
import { renderWithQueryClient } from '@/test/utils'

describe('MVP page smoke states', () => {
  it('renders dashboard success state', async () => {
    renderWithQueryClient(<DashboardPage />)

    expect(await screen.findByText(/System Summary/i)).toBeInTheDocument()
    expect(screen.getByText(/Backend Health/i)).toBeInTheDocument()
  })

  it('renders containers empty state', async () => {
    server.use(http.get('http://localhost:8080/containers', () => HttpResponse.json([])))

    renderWithQueryClient(<ContainersPage />)

    expect(await screen.findByText(/No containers/i)).toBeInTheDocument()
  })

  it('renders exposures empty state', async () => {
    renderWithQueryClient(<ExposuresPage />)

    expect(await screen.findByText(/No exposures/i)).toBeInTheDocument()
  })

  it('renders audit success state', async () => {
    renderWithQueryClient(<AuditPage />)

    expect(await screen.findByText(/Recent administrative actions/i)).toBeInTheDocument()
    expect(screen.getByText(/admin@demo.com/i)).toBeInTheDocument()
  })
})
