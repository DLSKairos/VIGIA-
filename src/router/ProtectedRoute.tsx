import { Navigate, Outlet } from 'react-router-dom'
import { useVigiaStore } from '../store/useVigiaStore'

/**
 * Protege las rutas /admin/*: redirige a /login si `!isAuthenticated`.
 *
 * Limitación conocida y ACEPTADA en este MVP (spec sección 3, "100%
 * front-end, sin backend, sin API real"): `isAuthenticated` es solo un flag
 * en el store de front (persistido en localStorage). No hay verificación de
 * sesión real ni token: cualquiera con DevTools puede setearlo a `true`.
 * Esto es intencional para un demo comercial sin backend — no es un bug a
 * "arreglar" en fases siguientes, es un trade-off documentado del alcance.
 */
export default function ProtectedRoute() {
  const isAuthenticated = useVigiaStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
