import { z } from 'zod'

const hostnameRegex = /^(?=.{3,255}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/

const targetHostRegex = /^(?!https?:\/\/)(?!.*\/)[a-zA-Z0-9.-]+$/

export const exposureSchema = z.object({
  hostname: z
    .string()
    .trim()
    .toLowerCase()
    .regex(hostnameRegex, 'Enter a valid hostname (for example api.example.com).'),
  protocol: z.enum(['http', 'https']),
  containerName: z.string().min(1, 'Select a container.'),
  targetHost: z.string().trim().regex(targetHostRegex, 'Target host must not include scheme or path.'),
  port: z.number().int().min(1).max(65535),
  enabled: z.boolean(),
})

export type ExposureSchema = z.infer<typeof exposureSchema>
