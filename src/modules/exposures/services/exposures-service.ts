import { z } from 'zod'
import type { ExposureDTO, ExposureMutationInput } from '@/modules/exposures/types/exposure'
import { httpRequest } from '@/shared/lib/http-client'

const exposureApiSchema = z.object({
  id: z.string(),
  hostname: z.string(),
  protocol: z.enum(['http', 'https']),
  containerId: z.string().optional(),
  container_id: z.string().optional(),
  port: z.number().int().positive(),
  status: z.string(),
  createdAt: z.string().optional(),
  created_at: z.string().optional(),
  updatedAt: z.string().optional(),
  updated_at: z.string().optional(),
})

const exposureListApiSchema = z.array(exposureApiSchema)

export function mapExposureDto(payload: unknown): ExposureDTO {
  const parsed = exposureApiSchema.parse(payload)

  return {
    id: parsed.id,
    hostname: parsed.hostname,
    protocol: parsed.protocol,
    containerId: parsed.containerId ?? parsed.container_id ?? '',
    port: parsed.port,
    status: parsed.status,
    createdAt: parsed.createdAt ?? parsed.created_at ?? new Date(0).toISOString(),
    updatedAt: parsed.updatedAt ?? parsed.updated_at ?? new Date(0).toISOString(),
  }
}

export async function getExposures() {
  const payload = await httpRequest<unknown>('/exposures')
  return exposureListApiSchema.parse(payload).map(mapExposureDto)
}

export async function createExposure(input: ExposureMutationInput) {
  const payload = await httpRequest<unknown>('/exposures', {
    method: 'POST',
    body: input,
  })

  return mapExposureDto(payload)
}

export async function updateExposure(exposureId: string, input: ExposureMutationInput) {
  const payload = await httpRequest<unknown>(`/exposures/${exposureId}`, {
    method: 'PATCH',
    body: input,
  })

  return mapExposureDto(payload)
}

export async function deleteExposure(exposureId: string, totpCode?: string) {
  await httpRequest(`/exposures/${exposureId}`, {
    method: 'DELETE',
    body: totpCode ? { totpCode } : undefined,
  })
}
