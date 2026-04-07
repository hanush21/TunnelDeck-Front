import { describe, expect, it } from 'vitest'
import { mapAuditEntryDto } from '@/modules/audit/services/audit-service'
import { mapContainerDto } from '@/modules/containers/services/containers-service'
import { mapDashboardSummaryDto } from '@/modules/dashboard/services/dashboard-service'
import { mapExposureDto } from '@/modules/exposures/services/exposures-service'

describe('DTO mappers', () => {
  it('maps dashboard summary from nested contract shape', () => {
    const dto = mapDashboardSummaryDto({
      exposures: { total: 3, enabled: 2 },
      containers: { total: 10, running: 7 },
      cloudflared: {
        service_name: 'cloudflared',
        status: 'active',
        is_active: true,
        config_exists: true,
      },
    })

    expect(dto).toEqual({
      totalContainers: 10,
      runningContainers: 7,
      totalExposures: 3,
      enabledExposures: 2,
      cloudflaredStatus: 'active',
      cloudflaredActive: true,
      cloudflaredConfigExists: true,
    })
  })

  it('maps container published ports and uptime', () => {
    const dto = mapContainerDto({
      id: 'container-1',
      name: 'api',
      image: 'nginx',
      state: 'running',
      status: 'running',
      published_ports: [
        {
          container_port: '80/tcp',
          host_ip: '0.0.0.0',
          host_port: '8080',
        },
      ],
      created_at: '2026-01-01T00:00:00.000Z',
      started_at: '2026-01-01T00:10:00.000Z',
    })

    expect(dto.ports).toEqual(['0.0.0.0:8080 -> 80/tcp'])
    expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('maps exposure response contract', () => {
    const dto = mapExposureDto({
      id: 1,
      container_name: 'my-service',
      hostname: 'app.example.com',
      service_type: 'https',
      target_host: 'localhost',
      target_port: 443,
      enabled: true,
      created_by: 'admin@example.com',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z',
    })

    expect(dto.id).toBe('1')
    expect(dto.containerName).toBe('my-service')
    expect(dto.protocol).toBe('https')
    expect(dto.targetHost).toBe('localhost')
  })

  it('maps audit contract entries', () => {
    const dto = mapAuditEntryDto({
      id: 10,
      actor_email: 'admin@demo.com',
      action: 'exposure.delete',
      resource_type: 'exposure',
      resource_id: '1',
      success: false,
      details: { hostname: 'app.example.com' },
      error_message: 'some failure',
      created_at: '2026-01-01T00:00:00.000Z',
    })

    expect(dto.actor).toBe('admin@demo.com')
    expect(dto.target).toBe('app.example.com')
    expect(dto.status).toContain('failed')
  })
})
