import { Navigate, createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/app/guards/ProtectedRoute'
import { AppShell } from '@/app/layouts/AppShell'
import { AuditPage } from '@/modules/audit/pages/AuditPage'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { ContainersPage } from '@/modules/containers/pages/ContainersPage'
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage'
import { ExposuresPage } from '@/modules/exposures/pages/ExposuresPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: '/containers',
            element: <ContainersPage />,
          },
          {
            path: '/exposures',
            element: <ExposuresPage />,
          },
          {
            path: '/audit',
            element: <AuditPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to="/" />,
  },
])
