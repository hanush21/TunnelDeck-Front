import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { ExposuresPage } from './ExposuresPage'
import { server } from '@/test/server'
import { renderWithQueryClient } from '@/test/utils'

describe('ExposuresPage', () => {
  it('opens TOTP modal and retries mutation with code after TOTP_REQUIRED', async () => {
    const user = userEvent.setup()
    let receivedTotpCode: string | null = null

    server.use(
      http.post('http://localhost:8080/exposures', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>

        if (!body.totpCode) {
          return HttpResponse.json({ code: 'TOTP_REQUIRED', message: 'TOTP required' }, { status: 401 })
        }

        receivedTotpCode = String(body.totpCode)

        return HttpResponse.json({
          id: 'exp-1',
          hostname: body.hostname,
          protocol: body.protocol,
          containerId: body.containerId,
          port: body.port,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }),
    )

    renderWithQueryClient(<ExposuresPage />)

    const createButton = await screen.findByRole('button', { name: /create first exposure/i })
    await user.click(createButton)

    await user.type(screen.getByLabelText('Hostname'), 'api.example.com')
    await user.clear(screen.getByLabelText('Port'))
    await user.type(screen.getByLabelText('Port'), '443')

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
