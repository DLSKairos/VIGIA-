import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { EstadoBadge } from '../domain/EstadoBadge'
import { type Alerta, useNotificaciones } from '../../hooks/useNotificaciones'
import { useVigiaStore } from '../../store/useVigiaStore'

function IconBell({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M6 9.5a6 6 0 1 1 12 0c0 3.4 1 5 1.6 5.7.3.35.05.9-.4.9H4.8c-.45 0-.7-.55-.4-.9C5 14.5 6 12.9 6 9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function formatearDetalle(alerta: Alerta): string | undefined {
  if (alerta.diasRestantes === undefined) return undefined
  return alerta.estado === 'vencido' ? `hace ${Math.abs(alerta.diasRestantes)} d` : `${alerta.diasRestantes} d`
}

/**
 * Campana de notificaciones del admin (spec sección 8): contador de
 * certificaciones a 30 días, a 15 días y vencidas, con panel desplegable
 * agrupado y enlace directo al trabajador. Conectada a `uiSlice`
 * (`notifPanelOpen`/`toggleNotifPanel`) para que el estado del panel sea
 * accesible desde cualquier parte si se necesita en el futuro.
 */
export function NotifBell() {
  const alertas = useNotificaciones()
  const open = useVigiaStore((state) => state.notifPanelOpen)
  const toggle = useVigiaStore((state) => state.toggleNotifPanel)
  const setOpen = useVigiaStore((state) => state.setNotifPanelOpen)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, setOpen])

  const total = alertas.length

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Notificaciones${total > 0 ? ` (${total} alertas pendientes)` : ' (sin alertas pendientes)'}`}
        className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-vigia-sm text-ink-200 transition-colors hover:bg-ink-800 hover:text-white"
      >
        <IconBell className="h-5 w-5" />
        {total > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-estado-vencido px-1 font-mono text-[10px] font-bold leading-none text-white">
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notificaciones"
          className="absolute right-0 top-full z-40 mt-2 w-[22rem] max-w-[92vw] overflow-hidden rounded-vigia-md border border-slate-200 bg-white text-left shadow-vigia-lifted"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-ink-900">Notificaciones</p>
            <p className="text-xs text-slate-500">Certificaciones a 30 días, a 15 días y vencidas</p>
          </div>

          {total === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">Todo al día. Sin alertas pendientes.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {alertas.map((alerta) => (
                <li key={`${alerta.trabajadorId}-${alerta.certId}`}>
                  <Link
                    to={`/admin/trabajadores/${alerta.trabajadorId}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-900">{alerta.trabajadorNombre}</p>
                      <p className="truncate text-xs text-slate-500">{alerta.certNombre}</p>
                    </div>
                    <EstadoBadge estado={alerta.estado} detalle={formatearDetalle(alerta)} size="sm" variant="soft" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
