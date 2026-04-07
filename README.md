# TunnelDeck Frontend

Frontend MVP para administrar exposiciones públicas de servicios Docker desde un panel web (sin terminal), con autenticación Firebase y backend como fuente de verdad.

## Stack
- React 19
- TypeScript
- Vite
- Tailwind + componentes estilo shadcn
- TanStack Query
- React Hook Form + Zod
- Firebase Auth
- Vitest + RTL + MSW

## Requisitos
- Node.js 20+
- npm
- Backend TunnelDeck corriendo
- Proyecto Firebase configurado (Auth habilitado: Email/Password y Google)

## Setup
1. Instala dependencias:
```bash
npm install
```
2. Crea tu `.env` desde `.env.example`:
```bash
cp .env.example .env
```
3. Completa variables:
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=http://localhost:8000
```
4. Arranca en desarrollo:
```bash
npm run dev
```

## Scripts
- `npm run dev`: desarrollo
- `npm run build`: build producción
- `npm run preview`: previsualizar build
- `npm run lint`: lint
- `npm run test`: tests watch
- `npm run test:run`: tests una pasada

## Rutas MVP
- `/login`
- `/`
- `/containers`
- `/exposures`
- `/audit`

Las rutas protegidas pasan por `ProtectedRoute` y requieren sesión Firebase activa.

## Contrato API usado (actual)
Base URL esperada: `VITE_API_BASE_URL`, con prefijo automático `/api/v1`.

Endpoints integrados:
- `GET /dashboard/summary`
- `GET /containers`
- `GET /exposures`
- `POST /exposures` (Auth + `X-TOTP-Code`)
- `PUT /exposures/{id}` (Auth + `X-TOTP-Code`)
- `DELETE /exposures/{id}` (Auth + `X-TOTP-Code`)
- `GET /audit?limit=100`

Notas:
- Requests protegidos envían `Authorization: Bearer <firebase_id_token>`.
- El frontend detecta TOTP requerido por respuesta backend y abre modal para reintento con `X-TOTP-Code`.

## Estructura
```text
src/
  app/        # providers, guards, router, layout
  modules/    # auth, dashboard, containers, exposures, security, audit
  shared/     # config, cliente HTTP, tipos, estados reutilizables
  test/       # setup Vitest + MSW handlers
```

## Estado actual
- MVP funcional implementado con flujo completo de exposición (create/edit/delete + TOTP backend-driven).
- Estados UI cubiertos: loading, error, empty, success, disabled, permission-denied.
- Verificación local actual:
  - `npm run lint` OK
  - `npm run test:run` OK
  - `npm run build` OK

## Pendientes principales
- Integrar endpoints no usados aún:
  - `GET /auth/me`
  - `GET /containers/{container_id}`
  - `POST /security/verify-totp` (si se decide validación previa explícita)
- Mejorar mensajes UX para errores `409` y `503`.
- Aplicar code splitting por rutas para reducir warning de chunk grande.

## Seguridad
- No guardar secretos privilegiados en frontend.
- El frontend solo prueba identidad; backend decide autorización.
- No hay comunicación directa con Docker/Cloudflare desde cliente.
