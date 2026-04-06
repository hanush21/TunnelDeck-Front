import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Lock, Mail } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { loginSchema, type LoginSchema } from '@/modules/auth/schemas/login-schema'
import { useAuth } from '@/modules/auth/hooks/use-auth'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

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
    <div className="mx-auto flex min-h-svh max-w-6xl items-center justify-center px-4 py-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="hidden border-primary/25 bg-gradient-to-b from-primary/15 to-card lg:block">
          <CardHeader>
            <CardTitle className="text-3xl">TunnelDeck</CardTitle>
            <CardDescription>Secure exposure management for your Docker services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-muted-foreground">
            <p>Use your Firebase-backed admin account to access containers, exposures and audit trail.</p>
            <div className="space-y-3 rounded-lg border bg-card/80 p-4">
              <p className="font-medium text-foreground">Security model</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Backend validates Firebase ID token and admin whitelist.
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Critical mutations are enforced with TOTP.
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  No user management is exposed in this panel.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Authenticate with Email/Password or Google account.</CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="admin@company.com" type="email" {...register('email')} />
                {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" placeholder="••••••••" type="password" {...register('password')} />
                {errors.password ? <p className="text-xs text-destructive">{errors.password.message}</p> : null}
              </div>

              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Signing in...' : 'Sign in with email'}
              </Button>

              <Button className="w-full" onClick={handleGoogleSignIn} type="button" variant="secondary">
                Continue with Google
              </Button>
            </CardContent>
          </form>
          <CardFooter className="text-xs text-muted-foreground">Only trusted admin accounts can access this app.</CardFooter>
        </Card>
      </div>
    </div>
  )
}
