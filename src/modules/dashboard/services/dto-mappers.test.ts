import { describe, expect, it } from 'vitest'
import { mapAuditEntryDto } from '@/modules/audit/services/audit-service'
import { mapContainerDto } from '@/modules/containers/services/containers-service'
import { mapDashboardSummaryDto } from '@/modules/dashboard/services/dashboard-service'
import { mapExposureDto } from '@/modules/exposures/services/exposures-service'

describe('DTO mappers', () => {
  it('maps dashboard summary with snake_case fallback', () => {
    const dto = mapDashboardSummaryDto({
      backend_status: 'healthy',
      tunnel_status: 'active',
      total_containers: 7,
      total_public_hostnames: 5,
    })

    expect(dto).toEqual({
      backendHealth: 'healthy',
      tunnelStatus: 'active',
      totalContainers: 7,
      totalPublicHostnames: 5,
    })
  })

  it('maps container ports from string', () => {
    const dto = mapContainerDto({
      id: 'container-1',
      name: 'api',
      image: 'nginx',
      status: 'running',
      ports: '80:80',
      uptime: 30,
    })

    expect(dto.ports).toEqual(['80:80'])
    expect(dto.uptime).toBe('30')
  })

  it('maps exposure container_id fallback', () => {
    const dto = mapExposureDto({
      id: 'exp-1',
      hostname: 'api.example.com',
      protocol: 'https',
      container_id: 'container-1',
      port: 443,
      status: 'active',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
    })

    expect(dto.containerId).toBe('container-1')
    expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('maps audit timestamp fallback', () => {
    const dto = mapAuditEntryDto({
      id: 'audit-1',
      actor: 'admin@demo.com',
      action: 'DELETE_EXPOSURE',
      target: 'api.example.com',
      created_at: '2026-01-01T00:00:00.000Z',
      status: 'success',
    })

    expect(dto.timestamp).toBe('2026-01-01T00:00:00.000Z')
  })
})
