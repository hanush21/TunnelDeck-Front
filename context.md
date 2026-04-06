# TunnelDeck Frontend Context

## Snapshot actual (2026-04-06)
Este repositorio ya tiene un MVP funcional implementado con React + TypeScript + Vite, arquitectura modular por dominio y tests.

Estado verificado localmente:
- `npm run build` OK
- `npm run lint` OK
- `npm run test:run` OK

---

## Objetivo del producto
TunnelDeck es un panel privado para administración de exposiciones públicas de servicios en contenedores Docker.

El frontend permite a un admin autenticado:
- iniciar sesión con Firebase Auth
- ver contenedores detectados
- ver hostnames/subdominios expuestos
- crear/editar/eliminar exposiciones
- confirmar acciones sensibles con TOTP (backend-driven)
- consultar resumen de salud y auditoría

Frontend desplegable como app estática. Toda lógica privilegiada vive en backend.

---

## Alcance implementado

### 1) Auth (`modules/auth`)
Responsabilidades implementadas:
- login Email/Password
- login Google Sign-In
- logout
- suscripción a sesión Firebase
- exposición de estado auth a toda la app
- obtención de Firebase ID token para requests protegidos

Archivos clave:
- `src/modules/auth/context/AuthProvider.tsx`
- `src/modules/auth/services/auth-service.ts`
- `src/modules/auth/pages/LoginPage.tsx`

### 2) Dashboard (`modules/dashboard`)
Responsabilidades implementadas:
- vista resumen
- cards de salud de backend/tunnel
- total de contenedores
- total de hostnames públicos
- estados: loading/error/forbidden/success

### 3) Containers (`modules/containers`)
Responsabilidades implementadas:
- listado de contenedores
- nombre, imagen, estado, puertos, uptime
- estados: loading/error/empty/forbidden/success

### 4) Exposures (`modules/exposures`)
Responsabilidades implementadas:
- listado de exposiciones
- create exposure
- edit exposure
- delete exposure
- validación de formulario con Zod
- manejo backend-driven de `TOTP_REQUIRED`
- reintento de mutación tras confirmar código TOTP

### 5) Security (`modules/security`)
Responsabilidades implementadas:
- modal TOTP
- validación de código TOTP (6 dígitos)

### 6) Audit (`modules/audit`)
Responsabilidades implementadas:
- listado de acciones recientes
- actor, acción, target, timestamp, status
- estados: loading/error/empty/forbidden/success

---

## Routing actual
- `/login`
- `/` (dashboard)
- `/containers`
- `/exposures`
- `/audit`

Las rutas protegidas están detrás de `ProtectedRoute`.

Archivo:
- `src/app/router/index.tsx`

---

## Arquitectura y organización

Estructura real:
- `src/app`: providers, guards, router, layout
- `src/modules`: dominios (`auth`, `dashboard`, `containers`, `exposures`, `security`, `audit`)
- `src/shared`: UI base, estados comunes, config, cliente HTTP, tipos, constantes
- `src/test`: setup de tests + MSW

Principios activos:
- lógica de datos por dominio (services por módulo)
- sin llamadas API dispersas en componentes de presentación
- DTOs tipados + mappers tolerantes a camelCase/snake_case

---

## Infraestructura compartida

### HTTP client central
Archivo:
- `src/shared/lib/http-client.ts`

Comportamiento:
- usa `VITE_API_BASE_URL`
- adjunta `Authorization: Bearer <firebase_id_token>` por defecto
- errores tipados: `UNAUTHORIZED | FORBIDDEN | VALIDATION_ERROR | TOTP_REQUIRED | UNKNOWN`

### Query / cache
- TanStack Query con `QueryClient` global
- invalidaciones usadas en mutaciones de exposures para refrescar `exposures` y `dashboardSummary`

### UI y estados
- componentes UI reutilizables (estilo shadcn sobre Radix): button, card, table, dialog, select, input, badge, skeleton
- estados reutilizables: loading, error, empty, permission denied
- toasts con `sonner`

---

## Contrato temporal de API (actual)
> Es un contrato provisional hasta disponer de OpenAPI/backend contract definitivo.

Endpoints usados por frontend:
- `GET /dashboard/summary`
- `GET /containers`
- `GET /exposures`
- `POST /exposures`
- `PATCH /exposures/:id`
- `DELETE /exposures/:id`
- `GET /audit`

Notas:
- Mappers aceptan algunas variantes snake_case/camelCase para reducir retrabajo inicial.
- Flujo TOTP depende de que backend responda error semántico con `code: "TOTP_REQUIRED"`.

---

## Seguridad y límites del frontend

Se mantiene:
- frontend solo prueba identidad (Firebase)
- autorización final siempre en backend
- sin secretos privilegiados en cliente
- sin comunicación directa con Docker/Cloudflare desde frontend
- sin ejecución de comandos/shell desde frontend
- sin UI de gestión de usuarios/admins

---

## Validación de formularios (Zod)

Implementado en cliente (UX):
- login: email/password
- exposure: hostname, protocol, containerId, port
- totp: código de 6 dígitos

Backend sigue siendo la fuente de verdad.

---

## Variables de entorno
Archivo ejemplo:
- `.env.example`

Esperadas:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_BASE_URL`

`src/shared/config/env.ts` hace fail-fast fuera de modo test si falta/config inválida.

---

## Tooling y comandos

Scripts npm:
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run test`
- `npm run test:run`

Testing stack:
- Vitest + React Testing Library + MSW + JSDOM

Cobertura funcional actual de tests:
- schemas Zod
- mappers DTO
- guard de ruta protegida
- auth header en cliente HTTP
- estado `403` permission denied
- flujo TOTP requerido y reintento de mutación
- smoke tests de páginas principales

---

## Pendiente para siguiente fase

1. **Contrato backend oficial**
   - sustituir contrato temporal por OpenAPI/contrato real
   - ajustar mappers y tipos definitivos

2. **Refinamiento UX de exposiciones**
   - mostrar nombre de contenedor en tabla (no solo `containerId`) si backend lo entrega o mediante join local
   - añadir confirm dialog explícito para delete (si se requiere UX adicional)

3. **Optimización de bundle**
   - hay warning de chunk grande en build
   - considerar code-splitting por rutas

4. **Hardening de errores backend**
   - estandarizar shape de errores (`code`, `message`, `details`) para mejorar feedback de UI

---

## No objetivo en este repo (por ahora)
- gestión de usuarios/admins
- signup público
- edición directa de Docker/cloudflared/Cloudflare
- consola/terminal embebida
- YAML libre o infraestructura avanzada fuera de exposición de servicios
