import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { ExposuresPage } from './ExposuresPage'
import { server } from '@/test/server'
import { renderWithQueryClient } from '@/test/utils'

const API_HOST = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')
const API_BASE = `${API_HOST}/api/v1`

describe('ExposuresPage', () => {
  it('opens TOTP modal and retries mutation with X-TOTP-Code header', async () => {
    const user = userEvent.setup()
    let receivedTotpCode: string | null = null

    server.use(
      http.post(`${API_BASE}/exposures`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        const totp = request.headers.get('x-totp-code')

        if (!totp) {
          return HttpResponse.json({ detail: 'Missing X-TOTP-Code header' }, { status: 403 })
        }

        receivedTotpCode = totp

        return HttpResponse.json(
          {
            id: 1,
            container_name: String(body.container_name),
            hostname: String(body.hostname),
            service_type: String(body.service_type),
            target_host: String(body.target_host),
            target_port: Number(body.target_port),
            enabled: Boolean(body.enabled),
            created_by: 'admin@demo.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { status: 201 },
        )
      }),
    )

    renderWithQueryClient(<ExposuresPage />)

    const createButton = await screen.findByRole('button', { name: /create first exposure/i })
    await user.click(createButton)

    await user.type(screen.getByLabelText('Hostname'), 'api.example.com')
    await user.clear(screen.getByLabelText('Target port'))
    await user.type(screen.getByLabelText('Target port'), '443')
    await user.clear(screen.getByLabelText('Target host'))
    await user.type(screen.getByLabelText('Target host'), 'localhost')

    const comboboxes = screen.getAllByRole('combobox')
    await user.click(comboboxes[1])
    const containerOptions = await screen.findAllByText(/api \(nginx:latest\)/i)
    await user.click(containerOptions[containerOptions.length - 1])

    await user.click(screen.getByRole('button', { name: /save exposure/i }))

    expect(await screen.findByRole('heading', { name: /TOTP verification required/i })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/TOTP code/i), '123456')
    await user.click(screen.getByRole('button', { name: /verify and continue/i }))

    await waitFor(() => expect(receivedTotpCode).toBe('123456'))
  })
})
