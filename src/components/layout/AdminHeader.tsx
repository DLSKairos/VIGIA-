import type { ReactNode } from 'react'
import { VigiaWordmark } from '../brand/VigiaLogo'

export interface AdminHeaderProps {
  /** Nombre/correo del admin en sesión (hardcodeado en Fase 1). */
  userLabel?: string
  onLogout?: () => void
  /**
   * Slot de la campana de notificaciones (spec sección 8): Fase 3 conecta
   * acá el `NotifBell` real (contador de próximas a vencer/vencidas +
   * panel). Por defecto se muestra un placeholder visual con badge mock
   * para que el layout se vea completo desde ya.
   */
  notifSlot?: ReactNode
  /** Control del menú hamburguesa en mobile (para el nav lateral del AdminLayout). */
  onToggleNav?: () => void
}

function DefaultNotifBellPlaceholder() {
  return (
    <button
      type="button"
      aria-label="Notificaciones (3 alertas pendientes)"
      className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-vigia-sm text-ink-200 transition-colors hover:bg-ink-800 hover:text-white"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M6 9.5a6 6 0 1 1 12 0c0 3.4 1 5 1.6 5.7.3.35.05.9-.4.9H4.8c-.45 0-.7-.55-.4-.9C5 14.5 6 12.9 6 9.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-estado-vencido px-1 font-mono text-[10px] font-bold leading-none text-white">
        3
      </span>
    </button>
  )
}

/**
 * Header del panel admin: wordmark compacto + campana de notificaciones +
 * usuario/logout. La barra de demo (spec sección 9) vive aparte, justo
 * debajo (ver `DemoBar`), para que sea imposible perdérsela.
 */
export function AdminHeader({ userLabel = 'admin@vigia.co', onLogout, notifSlot, onToggleNav }: AdminHeaderProps) {
  return (
    <header className="border-b border-ink-800 bg-ink-950">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          {onToggleNav && (
            <button
              type="button"
              onClick={onToggleNav}
              aria-label="Abrir menú de navegación"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-vigia-sm text-white transition-colors hover:bg-ink-800 md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <VigiaWordmark tone="light" />
          <span className="ml-1 hidden rounded-full border border-ink-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-300 sm:inline">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {notifSlot ?? <DefaultNotifBellPlaceholder />}

          <div className="hidden items-center gap-2 border-l border-ink-700 pl-3 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white" aria-hidden="true">
              {userLabel.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-40 truncate text-sm text-ink-100">{userLabel}</span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex h-11 cursor-pointer items-center rounded-vigia-sm px-3 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-white"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
