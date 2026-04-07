# TunnelDeck Frontend Context

## Snapshot actual (2026-04-07)
MVP funcional en React + TypeScript + Vite, modular por dominio, con UI basada en componentes estilo shadcn y contrato de API ya alineado al backend actual (`/api/v1`).

Estado verificado:
- `npm run lint` OK
- `npm run test:run` OK (16/16)
- `npm run build` OK (con warnings CSS/chunk-size no bloqueantes)

---

## Objetivo del producto
Panel admin privado para operar exposiciones públicas de servicios Docker sin usar terminal.

El frontend hace:
- identidad (Firebase Auth)
- experiencia de administración (dashboard, containers, exposures, audit)
- validaciones de UX (Zod)

El backend decide:
- autorización real (allowlist admin)
- validaciones finales
- verificación TOTP
- ejecución operativa (Docker/cloudflared)

---

## Estado por módulo

### Auth (`src/modules/auth`) - Hecho
- login Email/Password
- login Google
- logout
- sesión Firebase reactiva (`onAuthStateChanged`)
- provider global de token para requests protegidos

### Dashboard (`src/modules/dashboard`) - Hecho
- consume `GET /dashboard/summary`
- muestra:
  - total/running containers
  - total/enabled exposures
  - estado cloudflared (status, active, config_exists)
- estados UI: loading, error, forbidden, success

### Containers (`src/modules/containers`) - Hecho
- consume `GET /containers`
- mapea `published_ports`, `state`, `status`, timestamps y uptime
- estados UI: loading, error, empty, forbidden, success

### Exposures (`src/modules/exposures`) - Hecho
- `GET /exposures`
- `POST /exposures` (Auth + `X-TOTP-Code`)
- `PUT /exposures/{id}` (Auth + `X-TOTP-Code`)
- `DELETE /exposures/{id}` (Auth + `X-TOTP-Code`)
- formulario con Zod:
  - hostname (normaliza a lowercase)
  - protocol (`http|https`)
  - containerName
  - targetHost
  - port
  - enabled
- flujo TOTP backend-driven:
  - mutación sin TOTP
  - si backend devuelve 403 por TOTP, abre modal
  - reintenta mutación con header `X-TOTP-Code`

### Security (`src/modules/security`) - Hecho parcial
- modal de TOTP
- validación código 6 dígitos
- pendiente: servicio dedicado para `POST /security/verify-totp` (ahora no se usa en frontend)

### Audit (`src/modules/audit`) - Hecho
- consume `GET /audit?limit=100`
- mapea `entries[]` a DTO de UI
- estados UI: loading, error, empty, forbidden, success

---

## Routing actual
- `/login`
- `/`
- `/containers`
- `/exposures`
- `/audit`

Todas las rutas salvo `/login` están detrás de `ProtectedRoute`.

---

## Infraestructura compartida

### HTTP client (`src/shared/lib/http-client.ts`)
- base desde `VITE_API_BASE_URL`
- prefija `/api/v1` automáticamente
- evita doble prefijo si base ya incluye `/api/v1`
- adjunta `Authorization: Bearer <firebase_id_token>` en requests protegidos
- errores tipados:
  - `UNAUTHORIZED`
  - `FORBIDDEN`
  - `VALIDATION_ERROR`
  - `TOTP_REQUIRED`
  - `UNKNOWN`
- detección `TOTP_REQUIRED` por:
  - `payload.code === "TOTP_REQUIRED"`
  - o `403` con `detail` relacionado a TOTP / `X-TOTP-Code`

### Data fetching
- TanStack Query global
- invalidación tras mutaciones de exposures:
  - `exposures`
  - `dashboardSummary`

### UI base
- componentes usados: `button`, `card`, `table`, `dialog`, `input`, `select`, `badge`, `skeleton`, `sonner`
- estados comunes reutilizables:
  - `LoadingState`
  - `ErrorState`
  - `EmptyState`
  - `PermissionDeniedState`

---

## Contrato API implementado en frontend
Base esperada en env: `VITE_API_BASE_URL` (ejemplo `http://localhost:8000`).
El cliente construye paths bajo `/api/v1`.

Endpoints usados activamente:
- `GET /dashboard/summary`
- `GET /containers`
- `GET /exposures`
- `POST /exposures`
- `PUT /exposures/{id}`
- `DELETE /exposures/{id}`
- `GET /audit?limit=100`

Endpoints del contrato backend aún no consumidos en UI:
- `GET /auth/me`
- `GET /health/cloudflared` (el estado llega por summary, pero no endpoint dedicado)
- `GET /containers/{container_id}`
- `POST /security/verify-totp`

---

## Testing
Stack:
- Vitest
- React Testing Library
- MSW
- JSDOM

Cobertura actual:
- schemas Zod
- mappers DTO
- `ProtectedRoute`
- auth header en HTTP client
- `403` permission denied
- flujo TOTP requerido y reintento con header
- smoke tests de dashboard/containers/exposures/audit

---

## Variables de entorno requeridas
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_BASE_URL`

`src/shared/config/env.ts` aplica validación/fail-fast fuera de modo test.

---

## Pendiente para continuar
1. Implementar servicios opcionales pendientes del contrato:
   - `GET /auth/me`
   - `GET /containers/{container_id}`
   - `POST /security/verify-totp` (si se decide flujo preventivo además del backend-driven actual).
2. Mejorar UX de seguridad:
   - diálogo de confirmación antes de delete en exposures.
3. Hardening de errores:
   - mapear explícitamente `409` (hostname duplicado) y `503` (docker unavailable) a mensajes más específicos.
4. Optimización de build:
   - aplicar code splitting por rutas para reducir warning de chunk grande.

---

## Fuera de alcance (MVP)
- gestión de usuarios/admins
- signup
- comunicación directa con Docker/Cloudflare desde frontend
- ejecución de comandos/shell
- edición libre de YAML o infraestructura avanzada fuera de exposures
