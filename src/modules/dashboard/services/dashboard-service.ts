import { z } from 'zod'
import { httpRequest } from '@/shared/lib/http-client'
import type { DashboardSummaryDTO } from '@/modules/dashboard/types/dashboard'

const dashboardSummaryApiSchema = z.object({
  exposures: z.object({
    total: z.number().int().nonnegative(),
    enabled: z.number().int().nonnegative(),
  }),
  containers: z.object({
    total: z.number().int().nonnegative(),
    running: z.number().int().nonnegative(),
  }),
  cloudflared: z.object({
    service_name: z.string(),
    status: z.string(),
    is_active: z.boolean(),
    config_exists: z.boolean(),
  }),
})

export function mapDashboardSummaryDto(payload: unknown): DashboardSummaryDTO {
  const parsed = dashboardSummaryApiSchema.parse(payload)

  return {
    totalContainers: parsed.containers.total,
    runningContainers: parsed.containers.running,
    totalExposures: parsed.exposures.total,
    enabledExposures: parsed.exposures.enabled,
    cloudflaredStatus: parsed.cloudflared.status,
    cloudflaredActive: parsed.cloudflared.is_active,
    cloudflaredConfigExists: parsed.cloudflared.config_exists,
  }
}

export async function getDashboardSummary() {
  const payload = await httpRequest<unknown>('/dashboard/summary')
  return mapDashboardSummaryDto(payload)
}
