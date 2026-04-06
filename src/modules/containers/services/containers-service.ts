import { z } from 'zod'
import type { ContainerDTO } from '@/modules/containers/types/container'
import { httpRequest } from '@/shared/lib/http-client'

const containerApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  status: z.string(),
  ports: z.union([z.array(z.string()), z.string(), z.null()]).optional(),
  uptime: z.union([z.string(), z.number()]).optional(),
})

const containerListApiSchema = z.array(containerApiSchema)

export function mapContainerDto(payload: unknown): ContainerDTO {
  const parsed = containerApiSchema.parse(payload)

  return {
    id: parsed.id,
    name: parsed.name,
    image: parsed.image,
    status: parsed.status,
    ports: Array.isArray(parsed.ports)
      ? parsed.ports
      : typeof parsed.ports === 'string' && parsed.ports.length > 0
        ? [parsed.ports]
        : [],
    uptime: parsed.uptime ? String(parsed.uptime) : 'n/a',
  }
}

export async function getContainers() {
  const payload = await httpRequest<unknown>('/containers')
  return containerListApiSchema.parse(payload).map(mapContainerDto)
}
