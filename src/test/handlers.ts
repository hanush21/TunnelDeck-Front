import { HttpResponse, http } from 'msw'

const API_BASE = 'http://localhost:8080'

export const handlers = [
  http.get(`${API_BASE}/dashboard/summary`, () =>
    HttpResponse.json({
      backendHealth: 'healthy',
      tunnelStatus: 'active',
      totalContainers: 2,
      totalPublicHostnames: 1,
    }),
  ),
  http.get(`${API_BASE}/containers`, () =>
    HttpResponse.json([
      {
        id: 'container-1',
        name: 'api',
        image: 'nginx:latest',
        status: 'running',
        ports: ['80:80'],
        uptime: '3h',
      },
      {
        id: 'container-2',
        name: 'worker',
        image: 'node:20',
        status: 'paused',
        ports: [],
        uptime: '1h',
      },
    ]),
  ),
  http.get(`${API_BASE}/exposures`, () => HttpResponse.json([])),
  http.post(`${API_BASE}/exposures`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>

    if (!body.totpCode) {
      return HttpResponse.json({ code: 'TOTP_REQUIRED', message: 'TOTP required' }, { status: 401 })
    }

    return HttpResponse.json({
      id: 'exp-1',
      hostname: body.hostname,
      protocol: body.protocol,
      containerId: body.containerId,
      port: body.port,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }),
  http.patch(`${API_BASE}/exposures/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>

    if (!body.totpCode) {
      return HttpResponse.json({ code: 'TOTP_REQUIRED', message: 'TOTP required' }, { status: 401 })
    }

    return HttpResponse.json({
      id: params.id,
      hostname: body.hostname,
      protocol: body.protocol,
      containerId: body.containerId,
      port: body.port,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }),
  http.delete(`${API_BASE}/exposures/:id`, async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>

    if (!body.totpCode) {
      return HttpResponse.json({ code: 'TOTP_REQUIRED', message: 'TOTP required' }, { status: 401 })
    }

    return HttpResponse.json({}, { status: 200 })
  }),
  http.get(`${API_BASE}/audit`, () =>
    HttpResponse.json([
      {
        id: 'audit-1',
        actor: 'admin@demo.com',
        action: 'CREATE_EXPOSURE',
        target: 'api.example.com',
        timestamp: new Date().toISOString(),
        status: 'success',
      },
    ]),
  ),
]
