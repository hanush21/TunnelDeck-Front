import { z } from 'zod'
import type { AuditEntryDTO } from '@/modules/audit/types/audit'
import { httpRequest } from '@/shared/lib/http-client'

const auditEntryApiSchema = z.object({
  id: z.string(),
  actor: z.string(),
  action: z.string(),
  target: z.string(),
  timestamp: z.string().optional(),
  created_at: z.string().optional(),
  status: z.string(),
})

const auditListApiSchema = z.array(auditEntryApiSchema)

export function mapAuditEntryDto(payload: unknown): AuditEntryDTO {
  const parsed = auditEntryApiSchema.parse(payload)

  return {
    id: parsed.id,
    actor: parsed.actor,
    action: parsed.action,
    target: parsed.target,
    timestamp: parsed.timestamp ?? parsed.created_at ?? new Date(0).toISOString(),
    status: parsed.status,
  }
}

export async function getAuditEntries() {
  const payload = await httpRequest<unknown>('/audit')
  return auditListApiSchema.parse(payload).map(mapAuditEntryDto)
}
