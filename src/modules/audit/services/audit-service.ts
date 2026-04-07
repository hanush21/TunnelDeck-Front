import { z } from 'zod'
import type { AuditEntryDTO } from '@/modules/audit/types/audit'
import { httpRequest } from '@/shared/lib/http-client'

const auditEntryApiSchema = z.object({
  id: z.union([z.number().int(), z.string()]),
  actor_email: z.string(),
  action: z.string(),
  resource_type: z.string(),
  resource_id: z.string(),
  success: z.boolean(),
  details: z.record(z.string(), z.unknown()).nullable().optional(),
  error_message: z.string().nullable().optional(),
  created_at: z.string(),
})

const auditResponseSchema = z.object({
  entries: z.array(auditEntryApiSchema),
})

export function mapAuditEntryDto(payload: unknown): AuditEntryDTO {
  const parsed = auditEntryApiSchema.parse(payload)

  const detailsTarget =
    parsed.details && typeof parsed.details.hostname === 'string'
      ? String(parsed.details.hostname)
      : `${parsed.resource_type}:${parsed.resource_id}`

  return {
    id: String(parsed.id),
    actor: parsed.actor_email,
    action: parsed.action,
    target: detailsTarget,
    timestamp: parsed.created_at,
    status: parsed.success ? 'success' : `failed${parsed.error_message ? `: ${parsed.error_message}` : ''}`,
  }
}

export async function getAuditEntries(limit = 100) {
  const payload = await httpRequest<unknown>(`/audit?limit=${limit}`)
  const parsed = auditResponseSchema.parse(payload)
  return parsed.entries.map(mapAuditEntryDto)
}
