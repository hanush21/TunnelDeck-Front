import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, Shield } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { loginSchema, type LoginSchema } from '@/modules/auth/schemas/login-schema'
import { useAuth } from '@/modules/auth/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  const navigate = useNavigate()
  const { loginWithEmailPassword, loginWithGoogle, user, isLoading } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, navigate, user])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await loginWithEmailPassword(values.email, values.password)
      navigate('/', { replace: true })
    } catch {
      toast.error('Login failed', {
        description: 'Invalid email/password or account is not authorized.',
      })
    }
  })

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle()
      navigate('/', { replace: true })
    } catch {
      toast.error('Google sign-in failed', {
        description: 'The authentication request was not completed.',
      })
    }
  }

  return (
    <div className="flex min-h-svh">
      {/* Left panel */}
      <div className="hidden flex-1 flex-col justify-between border-r border-border bg-card px-10 py-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">TunnelDeck</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Secure Exposure Console</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Backend-authorized control plane for Docker service exposure via Cloudflare tunnels.
          </p>
          <ul className="space-y-2 pt-2">
            <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              Firebase ID token validated against admin allowlist
            </li>
            <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              Mutations gated behind TOTP verification
            </li>
            <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              No signup — admin accounts only
            </li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">Only trusted admin accounts can access this panel.</p>
      </div>

      {/* Right panel - login form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:max-w-sm">
        <div className="w-full max-w-xs space-y-7">
          <div className="flex items-center gap-2.5 lg:hidden">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">TunnelDeck</span>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">Authenticate with your admin account.</p>
          </div>

          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
              <Input
                autoComplete="email"
                id="email"
                placeholder="admin@company.com"
                type="email"
                {...register('email')}
              />
              {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
              <Input
                autoComplete="current-password"
                id="password"
                placeholder="••••••••"
                type="password"
                {...register('password')}
              />
              {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
            </div>

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">or</span>
            </div>
          </div>

          <Button className="w-full" onClick={handleGoogleSignIn} type="button" variant="outline">
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  )
}
