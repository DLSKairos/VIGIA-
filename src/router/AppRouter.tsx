import { Route, Routes } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import AdminLayout from '../pages/admin/AdminLayout'
import AdminResumenPage from '../pages/admin/AdminResumenPage'
import CargosPage from '../pages/admin/parametrizacion/CargosPage'
import CertificacionesPage from '../pages/admin/parametrizacion/CertificacionesPage'
import TaladrosPage from '../pages/admin/parametrizacion/TaladrosPage'
import TrabajadorDetallePage from '../pages/admin/trabajadores/TrabajadorDetallePage'
import TrabajadorNuevoPage from '../pages/admin/trabajadores/TrabajadorNuevoPage'
import TrabajadoresListPage from '../pages/admin/trabajadores/TrabajadoresListPage'
import ProtectedRoute from './ProtectedRoute'

/**
 * Rutas declarativas simples (sin data-router: no hay backend/loaders que
 * lo justifiquen). Ver spec sección 10 para el mapa de vistas.
 */
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminResumenPage />} />
          <Route path="parametrizacion/cargos" element={<CargosPage />} />
          <Route path="parametrizacion/certificaciones" element={<CertificacionesPage />} />
          <Route path="parametrizacion/taladros" element={<TaladrosPage />} />
          <Route path="trabajadores" element={<TrabajadoresListPage />} />
          <Route path="trabajadores/nuevo" element={<TrabajadorNuevoPage />} />
          <Route path="trabajadores/:id" element={<TrabajadorDetallePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
