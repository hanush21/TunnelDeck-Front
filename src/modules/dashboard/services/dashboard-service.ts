import { z } from 'zod'
import { httpRequest } from '@/shared/lib/http-client'
import type { DashboardSummaryDTO } from '@/modules/dashboard/types/dashboard'

const dashboardSummaryApiSchema = z.object({
  backendHealth: z.string().optional(),
  backend_status: z.string().optional(),
  tunnelStatus: z.string().optional(),
  tunnel_status: z.string().optional(),
  totalContainers: z.number().int().nonnegative().optional(),
  total_containers: z.number().int().nonnegative().optional(),
  totalPublicHostnames: z.number().int().nonnegative().optional(),
  total_public_hostnames: z.number().int().nonnegative().optional(),
})

export function mapDashboardSummaryDto(payload: unknown): DashboardSummaryDTO {
  const parsed = dashboardSummaryApiSchema.parse(payload)

  return {
    backendHealth: parsed.backendHealth ?? parsed.backend_status ?? 'unknown',
    tunnelStatus: parsed.tunnelStatus ?? parsed.tunnel_status ?? 'unknown',
    totalContainers: parsed.totalContainers ?? parsed.total_containers ?? 0,
    totalPublicHostnames: parsed.totalPublicHostnames ?? parsed.total_public_hostnames ?? 0,
  }
}

export async function getDashboardSummary() {
  const payload = await httpRequest<unknown>('/dashboard/summary')
  return mapDashboardSummaryDto(payload)
}
