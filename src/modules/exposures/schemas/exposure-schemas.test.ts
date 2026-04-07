import { describe, expect, it } from 'vitest'
import { exposureSchema } from './exposure-schemas'

describe('exposureSchema', () => {
  it('accepts a valid exposure payload', () => {
    const result = exposureSchema.safeParse({
      hostname: 'Api.Example.com',
      protocol: 'https',
      containerName: 'api',
      targetHost: 'localhost',
      port: 443,
      enabled: true,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.hostname).toBe('api.example.com')
    }
  })

  it('rejects invalid hostname, host and port', () => {
    const result = exposureSchema.safeParse({
      hostname: 'invalid-hostname',
      protocol: 'https',
      containerName: '',
      targetHost: 'http://localhost/path',
      port: 70000,
      enabled: true,
    })

    expect(result.success).toBe(false)
  })
})
