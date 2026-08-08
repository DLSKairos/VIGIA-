import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useVigiaStore } from '../../store/useVigiaStore'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded px-3 py-2 text-sm ${
    isActive ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
  }`

/**
 * Shell del panel admin: nav lateral + <Outlet /> para las sub-rutas.
 * Sin diseño final — layout mínimo para que la navegación de /admin/*
 * funcione de punta a punta en esta fase de scaffold.
 */
export default function AdminLayout() {
  const logout = useVigiaStore((state) => state.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-neutral-200 p-4">
        <p className="mb-4 text-lg font-semibold text-neutral-900">VIGÍA admin</p>
        <nav className="space-y-1">
          <NavLink to="/admin" end className={linkClass}>
            Resumen
          </NavLink>
          <NavLink to="/admin/trabajadores" className={linkClass}>
            Trabajadores
          </NavLink>
          <NavLink to="/admin/trabajadores/nuevo" className={linkClass}>
            Registrar trabajador
          </NavLink>
          <NavLink to="/admin/parametrizacion/cargos" className={linkClass}>
            Cargos
          </NavLink>
          <NavLink to="/admin/parametrizacion/certificaciones" className={linkClass}>
            Certificaciones
          </NavLink>
          <NavLink to="/admin/parametrizacion/taladros" className={linkClass}>
            Taladros
          </NavLink>
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 text-sm text-neutral-500 underline"
        >
          Cerrar sesión
        </button>
      </aside>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
