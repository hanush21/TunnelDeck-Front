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
      {/* Left panel - branding */}
      <div className="hidden flex-1 flex-col justify-between border-r border-border bg-sidebar p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold leading-none text-foreground">TunnelDeck</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Control Panel</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Secure Exposure Console</h1>
            <p className="mt-3 text-muted-foreground">
              Minimal, reliable, backend-authorized control plane for service exposure.
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-5">
            <p className="text-sm font-medium text-foreground">Security model</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Backend validates Firebase ID token against an admin allowlist.
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Critical mutations are protected with TOTP verification.
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                No user management or signup is exposed in this panel.
              </li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/60">Only trusted admin accounts can access this panel.</p>
      </div>

      {/* Right panel - login form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:max-w-md">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold leading-none text-foreground">TunnelDeck</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Control Panel</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">Authenticate with your admin account.</p>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                autoComplete="email"
                id="email"
                placeholder="admin@company.com"
                type="email"
                {...register('email')}
              />
              {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
              {isSubmitting ? 'Signing in...' : 'Sign in with email'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <Button className="w-full" onClick={handleGoogleSignIn} type="button" variant="outline">
            Continue with Google
          </Button>

          <p className="text-center text-xs text-muted-foreground/60">
            Only authorized admin accounts can access this application.
          </p>
        </div>
      </div>
    </div>
  )
}
