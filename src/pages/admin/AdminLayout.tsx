import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, useReducedMotion } from 'framer-motion'
import { type ReactElement, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AlertasPopup } from '../../components/domain/AlertasPopup'
import { AdminHeader } from '../../components/layout/AdminHeader'
import { DemoBar } from '../../components/layout/DemoBar'
import { NotifBell } from '../../components/layout/NotifBell'
import { PageContainer } from '../../components/layout/PageContainer'
import { Button } from '../../components/ui/Button'
import { cn } from '../../components/ui/cn'
import { Modal } from '../../components/ui/Modal'
import { parseFechaISO, toISODateString } from '../../lib/dates'
import { useVigiaStore } from '../../store/useVigiaStore'

interface NavItem {
  to: string
  label: string
  end?: boolean
  icon: (props: { className?: string }) => ReactElement
}

interface NavSection {
  label: string
  items: NavItem[]
}

function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 19c.6-3.4 3-5.2 6-5.2s5.4 1.8 6 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 8.2a3 3 0 1 1 2.4 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 13.8c2.6.3 4.4 1.9 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconUserPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 19c.6-3.4 3-5.2 6-5.2s5.4 1.8 6 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 8v6M15 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconHardHat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 16.5c0-4.7 3.6-8.5 8-8.5s8 3.8 8 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 16.5h18v1.7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1.7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 8V5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconCertificate({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.5" y="4" width="17" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.5 8h4M13.5 11.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7.5 20.5 9 17.3l1.5 3.2M15 20.5l-1.5-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconRig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 3v13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 8.5h8M6 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 21l7-4.5 7 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: '',
    items: [{ to: '/admin', label: 'Resumen', end: true, icon: IconHome }],
  },
  {
    label: 'Trabajadores',
    items: [
      { to: '/admin/trabajadores', label: 'Lista de trabajadores', end: true, icon: IconUsers },
      { to: '/admin/trabajadores/nuevo', label: 'Registrar trabajador', icon: IconUserPlus },
    ],
  },
  {
    label: 'Parametrización',
    items: [
      { to: '/admin/parametrizacion/cargos', label: 'Cargos', icon: IconHardHat },
      { to: '/admin/parametrizacion/certificaciones', label: 'Certificaciones', icon: IconCertificate },
      { to: '/admin/parametrizacion/taladros', label: 'Taladros', icon: IconRig },
    ],
  },
]

const ALL_ITEMS = NAV_SECTIONS.flatMap((section) => section.items)

/**
 * Shell del panel admin (spec sección 10.2): header con marca + campana de
 * notificaciones, barra de demo siempre visible (sección 9), navegación a
 * Parametrización/Trabajadores y zona de contenido. Responsive: sidebar
 * vertical en desktop, nav de chips horizontal en mobile.
 */
export default function AdminLayout() {
  const logout = useVigiaStore((state) => state.logout)
  const hoySimuladaISO = useVigiaStore((state) => state.hoySimulada)
  const moverFecha = useVigiaStore((state) => state.moverFecha)
  const setFechaSimulada = useVigiaStore((state) => state.setFechaSimulada)
  const volverAHoy = useVigiaStore((state) => state.volverAHoy)
  const restablecerDemo = useVigiaStore((state) => state.restablecerDemo)
  const navigate = useNavigate()

  const [confirmRestablecerOpen, setConfirmRestablecerOpen] = useState(false)
  const prefiereMovimientoReducido = useReducedMotion()
  const transicionPillNav = prefiereMovimientoReducido ? { duration: 0 } : { type: 'spring' as const, stiffness: 500, damping: 40 }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const hoySimuladaDate = new Date(hoySimuladaISO)

  function handleCambiarFecha(fechaISODateOnly: string) {
    // El date picker de la barra de demo entrega 'yyyy-MM-dd' (solo fecha).
    // Se parsea en hora LOCAL con `parseFechaISO` (nunca `new Date(str)`,
    // ver nota de off-by-one en lib/dates.ts) y se guarda como ISO datetime
    // completo, el mismo formato que usa el resto de `demoSlice`.
    setFechaSimulada(parseFechaISO(fechaISODateOnly).toISOString())
  }

  function handleRestablecerDemo() {
    restablecerDemo()
    setConfirmRestablecerOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AdminHeader onLogout={handleLogout} notifSlot={<NotifBell />} />
      <DemoBar
        fechaSimuladaLabel={format(hoySimuladaDate, "dd MMM yyyy", { locale: es })}
        fechaSimuladaISO={toISODateString(hoySimuladaDate)}
        onCambiarFecha={handleCambiarFecha}
        onAvanzar15Dias={() => moverFecha(15, 'dias')}
        onAvanzar30Dias={() => moverFecha(30, 'dias')}
        onAvanzar1Mes={() => moverFecha(1, 'meses')}
        onVolverAHoy={volverAHoy}
        onRestablecerDemo={() => setConfirmRestablecerOpen(true)}
      />

      <AlertasPopup />

      <Modal
        open={confirmRestablecerOpen}
        onClose={() => setConfirmRestablecerOpen(false)}
        title="¿Restablecer demo?"
        description="Se vuelven a sembrar los datos originales (catálogo y trabajadores) y se pierden todos los cambios hechos durante esta demo."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmRestablecerOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleRestablecerDemo}>
              Sí, restablecer
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Esta acción no se puede deshacer. La sesión de administrador se mantiene activa.</p>
      </Modal>

      {/* Nav mobile: chips horizontales con scroll */}
      <nav aria-label="Navegación admin" className="border-b border-slate-200 bg-white md:hidden">
        <div className="flex gap-2 overflow-x-auto px-4 py-2.5">
          {ALL_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold whitespace-nowrap',
                  isActive ? 'border-brand-600 text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="mobile-nav-pill"
                      className="absolute inset-0 rounded-full bg-brand-600"
                      transition={transicionPillNav}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-[100rem] flex-1">
        {/* Sidebar desktop */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block">
          <nav aria-label="Navegación admin" className="flex flex-col gap-5 p-4">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label || 'root'}>
                {section.label && (
                  <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {section.label}
                  </p>
                )}
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-vigia-sm px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive ? 'bg-ink-950 text-white' : 'text-ink-700 hover:bg-slate-100',
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <PageContainer width="wide" className="py-6 sm:py-8">
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </div>
  )
}
