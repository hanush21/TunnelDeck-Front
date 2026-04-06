import { z } from 'zod'

const hostnameRegex = /^(?=.{3,255}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export const exposureSchema = z.object({
  hostname: z.string().regex(hostnameRegex, 'Enter a valid hostname (for example api.example.com).'),
  protocol: z.enum(['http', 'https']),
  containerId: z.string().min(1, 'Select a container.'),
  port: z.number().int().min(1).max(65535),
})

export type ExposureSchema = z.infer<typeof exposureSchema>
