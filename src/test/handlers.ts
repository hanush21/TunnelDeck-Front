import { HttpResponse, http } from 'msw'

const API_HOST = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')
const API_BASE = `${API_HOST}/api/v1`

const exposureResponse = {
  id: 1,
  container_name: 'api',
  hostname: 'api.example.com',
  service_type: 'https',
  target_host: 'localhost',
  target_port: 443,
  enabled: true,
  created_by: 'admin@demo.com',
  created_at: '2026-04-07T10:15:30',
  updated_at: '2026-04-07T10:15:30',
}

export const handlers = [
  http.get(`${API_BASE}/dashboard/summary`, () =>
    HttpResponse.json({
      exposures: { total: 1, enabled: 1 },
      containers: { total: 2, running: 1 },
      cloudflared: {
        service_name: 'cloudflared',
        status: 'active',
        is_active: true,
        config_exists: true,
      },
    }),
  ),

  http.get(`${API_BASE}/containers`, () =>
    HttpResponse.json({
      items: [
        {
          id: 'container-1',
          name: 'api',
          image: 'nginx:latest',
          state: 'running',
          status: 'running',
          published_ports: [
            {
              container_port: '80/tcp',
              host_ip: '0.0.0.0',
              host_port: '8080',
            },
          ],
          labels: {},
          networks: ['bridge'],
          created_at: '2026-04-07T10:15:30+00:00',
          started_at: '2026-04-07T10:20:00+00:00',
        },
        {
          id: 'container-2',
          name: 'worker',
          image: 'node:20',
          state: 'exited',
          status: 'exited',
          published_ports: [],
          labels: {},
          networks: ['bridge'],
          created_at: '2026-04-07T10:15:30+00:00',
          started_at: null,
        },
      ],
    }),
  ),

  http.get(`${API_BASE}/exposures`, () => HttpResponse.json({ items: [] })),

  http.post(`${API_BASE}/exposures`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const totp = request.headers.get('x-totp-code')

    if (!totp) {
      return HttpResponse.json({ detail: 'Missing X-TOTP-Code header' }, { status: 403 })
    }

    return HttpResponse.json(
      {
        ...exposureResponse,
        container_name: String(body.container_name),
        hostname: String(body.hostname),
        service_type: String(body.service_type),
        target_host: String(body.target_host),
        target_port: Number(body.target_port),
        enabled: Boolean(body.enabled),
      },
      { status: 201 },
    )
  }),

  http.put(`${API_BASE}/exposures/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const totp = request.headers.get('x-totp-code')

    if (!totp) {
      return HttpResponse.json({ detail: 'Missing X-TOTP-Code header' }, { status: 403 })
    }

    return HttpResponse.json({
      ...exposureResponse,
      id: Number(params.id),
      container_name: String(body.container_name),
      hostname: String(body.hostname),
      service_type: String(body.service_type),
      target_host: String(body.target_host),
      target_port: Number(body.target_port),
      enabled: Boolean(body.enabled),
    })
  }),

  http.delete(`${API_BASE}/exposures/:id`, ({ request }) => {
    const totp = request.headers.get('x-totp-code')

    if (!totp) {
      return HttpResponse.json({ detail: 'Missing X-TOTP-Code header' }, { status: 403 })
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API_BASE}/audit`, () =>
    HttpResponse.json({
      entries: [
        {
          id: 10,
          actor_email: 'admin@demo.com',
          action: 'exposure.create',
          resource_type: 'exposure',
          resource_id: '1',
          success: true,
          details: {
            hostname: 'api.example.com',
          },
          error_message: null,
          created_at: '2026-04-07T10:15:30',
        },
      ],
    }),
  ),
]
