import { z } from 'zod'
import type { ExposureDTO, ExposureMutationInput } from '@/modules/exposures/types/exposure'
import { httpRequest } from '@/shared/lib/http-client'

const exposureApiSchema = z.object({
  id: z.union([z.number().int(), z.string()]),
  container_name: z.string(),
  hostname: z.string(),
  service_type: z.enum(['http', 'https']),
  target_host: z.string(),
  target_port: z.number().int().positive(),
  enabled: z.boolean(),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

const exposureListResponseSchema = z.object({
  items: z.array(exposureApiSchema),
})

const toPayload = (input: ExposureMutationInput) => ({
  container_name: input.containerName,
  hostname: input.hostname,
  service_type: input.protocol,
  target_host: input.targetHost,
  target_port: input.port,
  enabled: input.enabled,
})

export function mapExposureDto(payload: unknown): ExposureDTO {
  const parsed = exposureApiSchema.parse(payload)

  return {
    id: String(parsed.id),
    containerName: parsed.container_name,
    hostname: parsed.hostname,
    protocol: parsed.service_type,
    targetHost: parsed.target_host,
    port: parsed.target_port,
    enabled: parsed.enabled,
    createdBy: parsed.created_by,
    createdAt: parsed.created_at,
    updatedAt: parsed.updated_at,
  }
}

export async function getExposures() {
  const payload = await httpRequest<unknown>('/exposures')
  const parsed = exposureListResponseSchema.parse(payload)
  return parsed.items.map(mapExposureDto)
}

export async function createExposure(input: ExposureMutationInput) {
  const payload = await httpRequest<unknown>('/exposures', {
    method: 'POST',
    body: toPayload(input),
    headers: input.totpCode ? { 'X-TOTP-Code': input.totpCode } : undefined,
  })

  return mapExposureDto(payload)
}

export async function updateExposure(exposureId: string, input: ExposureMutationInput) {
  const payload = await httpRequest<unknown>(`/exposures/${exposureId}`, {
    method: 'PUT',
    body: toPayload(input),
    headers: input.totpCode ? { 'X-TOTP-Code': input.totpCode } : undefined,
  })

  return mapExposureDto(payload)
}

export async function deleteExposure(exposureId: string, totpCode?: string) {
  await httpRequest(`/exposures/${exposureId}`, {
    method: 'DELETE',
    headers: totpCode ? { 'X-TOTP-Code': totpCode } : undefined,
  })
}
