import { describe, expect, it } from 'vitest'
import { exposureSchema } from './exposure-schemas'

describe('exposureSchema', () => {
  it('accepts a valid exposure payload', () => {
    const result = exposureSchema.safeParse({
      hostname: 'api.example.com',
      protocol: 'https',
      containerId: 'container-1',
      port: 443,
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid hostname and port', () => {
    const result = exposureSchema.safeParse({
      hostname: 'invalid-hostname',
      protocol: 'https',
      containerId: '',
      port: 70000,
    })

    expect(result.success).toBe(false)
  })
})
