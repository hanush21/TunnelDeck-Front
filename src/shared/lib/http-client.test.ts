import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpRequest, setAuthTokenProvider } from './http-client'

describe('httpRequest', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('attaches firebase bearer token for protected requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ id: 'x' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    setAuthTokenProvider(async () => 'firebase-token')

    await httpRequest('/containers')

    expect(fetchSpy).toHaveBeenCalledTimes(1)

    const requestOptions = fetchSpy.mock.calls[0][1] as RequestInit
    const headers = requestOptions.headers as Headers

    expect(headers.get('Authorization')).toBe('Bearer firebase-token')
  })
})
