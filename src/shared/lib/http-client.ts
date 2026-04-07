import { env } from '@/shared/config/env'
import type { ApiErrorCode } from '@/shared/types/api'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type TokenProvider = () => Promise<string | null>

let authTokenProvider: TokenProvider = async () => null

type RequestOptions = {
  method?: RequestMethod
  auth?: boolean
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
}

export class ApiError extends Error {
  public readonly code: ApiErrorCode
  public readonly status: number
  public readonly details?: unknown

  constructor(
    code: ApiErrorCode,
    status: number,
    details?: unknown,
    message?: string,
  ) {
    super(message ?? 'Unexpected API error')
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

export function setAuthTokenProvider(provider: TokenProvider) {
  authTokenProvider = provider
}

const buildUrl = (path: string) => {
  const base = env.VITE_API_BASE_URL.endsWith('/') ? env.VITE_API_BASE_URL : `${env.VITE_API_BASE_URL}/`
  const baseUrl = new URL(base)
  const basePath = baseUrl.pathname.replace(/\/+$/, '')

  const normalizedPath = path.startsWith('/api/') ? path : `/api/v1${path.startsWith('/') ? path : `/${path}`}`
  const shouldStripApiPrefix = basePath.endsWith('/api/v1') && normalizedPath.startsWith('/api/v1/')
  const relativePath = shouldStripApiPrefix ? normalizedPath.replace('/api/v1/', '') : normalizedPath.replace(/^\//, '')

  return new URL(relativePath, base).toString()
}

const inferErrorCode = (status: number, payload: unknown): ApiErrorCode => {
  const detail =
    typeof payload === 'object' && payload !== null && 'detail' in payload ? String(payload.detail).toLowerCase() : ''

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'code' in payload &&
    payload.code === 'TOTP_REQUIRED'
  ) {
    return 'TOTP_REQUIRED'
  }

  if (status === 403 && (detail.includes('totp') || detail.includes('x-totp-code'))) {
    return 'TOTP_REQUIRED'
  }

  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 422) return 'VALIDATION_ERROR'
  return 'UNKNOWN'
}

async function safeJsonParse(response: Response) {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function httpRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers, auth = true, signal } = options

  const nextHeaders = new Headers(headers)

  if (auth) {
    const token = await authTokenProvider()
    if (token) {
      nextHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  if (body !== undefined && !(body instanceof FormData)) {
    nextHeaders.set('Content-Type', 'application/json')
  }

  let response: Response

  try {
    response = await fetch(buildUrl(path), {
      method,
      headers: nextHeaders,
      body: body !== undefined && !(body instanceof FormData) ? JSON.stringify(body) : (body as BodyInit),
      signal,
    })
  } catch (error) {
    throw new ApiError('UNKNOWN', 0, error, 'Network error while contacting backend')
  }

  const payload = await safeJsonParse(response)

  if (!response.ok) {
    const code = inferErrorCode(response.status, payload)
    const message =
      typeof payload === 'object' && payload !== null && 'detail' in payload
        ? String(payload.detail)
        : typeof payload === 'object' && payload !== null && 'message' in payload
          ? String(payload.message)
        : `Request failed with status ${response.status}`

    throw new ApiError(code, response.status, payload, message)
  }

  return payload as T
}
