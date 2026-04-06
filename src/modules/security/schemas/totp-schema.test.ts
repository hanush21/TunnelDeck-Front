import { describe, expect, it } from 'vitest'
import { totpSchema } from './totp-schema'

describe('totpSchema', () => {
  it('accepts a six-digit code', () => {
    const result = totpSchema.safeParse({ totpCode: '123456' })
    expect(result.success).toBe(true)
  })

  it('rejects non 6-digit code', () => {
    const result = totpSchema.safeParse({ totpCode: '12ab' })
    expect(result.success).toBe(false)
  })
})
