import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import type { User } from 'firebase/auth'
import {
  getCurrentIdToken,
  signInWithEmailPassword,
  signInWithGoogle,
  signOutSession,
  subscribeToAuthState,
} from '@/modules/auth/services/auth-service'
import type { AuthUser } from '@/modules/auth/types/auth'
import { setAuthTokenProvider } from '@/shared/lib/http-client'

export type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  loginWithEmailPassword: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const mapUser = (firebaseUser: User): AuthUser => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
})

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setAuthTokenProvider(() => getCurrentIdToken())

    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser ? mapUser(firebaseUser) : null)
      setIsLoading(false)
    })

    return () => {
      unsubscribe()
      setAuthTokenProvider(async () => null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      loginWithEmailPassword: async (email, password) => {
        await signInWithEmailPassword(email, password)
      },
      loginWithGoogle: async () => {
        await signInWithGoogle()
      },
      logout: async () => {
        await signOutSession()
      },
      getIdToken: async (forceRefresh) => getCurrentIdToken(forceRefresh),
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
