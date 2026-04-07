import { z } from 'zod'

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
  VITE_FIREBASE_APP_ID: z.string().min(1),
  VITE_API_BASE_URL: z.string().url(),
})

const testDefaults = {
  VITE_FIREBASE_API_KEY: 'test-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'test-auth-domain',
  VITE_FIREBASE_PROJECT_ID: 'test-project-id',
  VITE_FIREBASE_APP_ID: 'test-app-id',
  VITE_API_BASE_URL: 'http://localhost:8000',
}

const parseEnv = () => {
  const parsed = envSchema.safeParse(import.meta.env)

  if (parsed.success) {
    return parsed.data
  }

  if (import.meta.env.MODE === 'test') {
    return testDefaults
  }

  const issues = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')
  throw new Error(`Invalid environment configuration: ${issues}`)
}

export const env = parseEnv()
