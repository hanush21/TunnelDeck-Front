import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ProtectedRoute } from '@/app/guards/ProtectedRoute'
import { AuthContext, type AuthContextValue } from '@/modules/auth/context/AuthProvider'

const unauthenticatedContext: AuthContextValue = {
  user: null,
  isLoading: false,
  loginWithEmailPassword: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  getIdToken: async () => null,
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to /login', async () => {
    render(
      <AuthContext.Provider value={unauthenticatedContext}>
        <MemoryRouter initialEntries={['/containers']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<div>Protected content</div>} path="/containers" />
            </Route>
            <Route element={<div>Login screen</div>} path="/login" />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(await screen.findByText('Login screen')).toBeInTheDocument()
  })
})
