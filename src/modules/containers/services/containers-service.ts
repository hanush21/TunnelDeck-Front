import { z } from 'zod'
import type { ContainerDTO } from '@/modules/containers/types/container'
import { httpRequest } from '@/shared/lib/http-client'

const containerApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  state: z.string(),
  status: z.string(),
  published_ports: z
    .array(
      z.object({
        container_port: z.string(),
        host_ip: z.string().nullable().optional(),
        host_port: z.string().nullable().optional(),
      }),
    )
    .optional(),
  created_at: z.string(),
  started_at: z.string().nullable().optional(),
})

const containersResponseSchema = z.object({
  items: z.array(containerApiSchema),
})

const getUptimeLabel = (startedAt: string | null) => {
  if (!startedAt) {
    return 'n/a'
  }

  const diff = Date.now() - new Date(startedAt).getTime()

  if (!Number.isFinite(diff) || diff <= 0) {
    return 'n/a'
  }

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

export function mapContainerDto(payload: unknown): ContainerDTO {
  const parsed = containerApiSchema.parse(payload)

  return {
    id: parsed.id,
    name: parsed.name,
    image: parsed.image,
    state: parsed.state,
    status: parsed.status,
    ports:
      parsed.published_ports?.map((port) => {
        const hostAddress = port.host_port ? `${port.host_ip ?? '0.0.0.0'}:${port.host_port}` : 'internal'
        return `${hostAddress} -> ${port.container_port}`
      }) ?? [],
    uptime: getUptimeLabel(parsed.started_at ?? null),
    createdAt: parsed.created_at,
    startedAt: parsed.started_at ?? null,
  }
}

export async function getContainers() {
  const payload = await httpRequest<unknown>('/containers')
  const parsed = containersResponseSchema.parse(payload)
  return parsed.items.map(mapContainerDto)
}
