import { z } from 'zod'

export const totpSchema = z.object({
  totpCode: z.string().regex(/^\d{6}$/, 'Enter a 6-digit TOTP code.'),
})

export type TotpSchema = z.infer<typeof totpSchema>
