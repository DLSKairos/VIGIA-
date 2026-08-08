import type { ReactNode } from 'react'
import { Button } from '../ui/Button'

export interface DemoBarProps {
  /** Fecha simulada ya formateada para mostrar (ej. "07 ago 2026"). Fase 3 la calcula desde el store. */
  fechaSimuladaLabel?: string
  onAvanzar15Dias?: () => void
  onAvanzar30Dias?: () => void
  onAvanzar1Mes?: () => void
  onVolverAHoy?: () => void
  onRestablecerDemo?: () => void
}

/**
 * Botón "chip" propio de la barra de demo (fondo oscuro). NO reutiliza el
 * variant="outline" del `Button` compartido a propósito: ese variant fija
 * `text-ink-900` (pensado para fondos claros) y, por cómo Tailwind resuelve
 * utilidades en conflicto (orden de la hoja generada, no orden de clases en
 * el DOM), un `className` override de color no tiene garantía de ganar —
 * en la práctica el texto quedaba invisible sobre `bg-ink-900`.
 */
function DemoBarButton({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 min-w-11 cursor-pointer rounded-vigia-sm border border-ink-600 bg-ink-800 px-3 text-sm font-medium text-ink-100 transition-colors hover:border-brand-500 hover:bg-ink-700 hover:text-white"
    >
      {children}
    </button>
  )
}

/**
 * Barra de demo (spec sección 9): visible y etiquetada como "modo demo",
 * para que quien presenta (no el desarrollador) controle la fecha
 * simulada y pueda restablecer los datos. Shell visual — Fase 3 conecta
 * los handlers al `demoSlice` del store.
 */
export function DemoBar({
  fechaSimuladaLabel = 'hoy',
  onAvanzar15Dias,
  onAvanzar30Dias,
  onAvanzar1Mes,
  onVolverAHoy,
  onRestablecerDemo,
}: DemoBarProps) {
  return (
    <div className="border-b border-brand-800 bg-ink-900">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" aria-hidden="true" />
            Modo demo
          </span>
          <span className="text-sm text-ink-200">
            Fecha simulada:{' '}
            <time className="font-mono font-semibold text-white">{fechaSimuladaLabel}</time>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DemoBarButton onClick={onAvanzar15Dias}>+15 días</DemoBarButton>
          <DemoBarButton onClick={onAvanzar30Dias}>+30 días</DemoBarButton>
          <DemoBarButton onClick={onAvanzar1Mes}>+1 mes</DemoBarButton>
          <DemoBarButton onClick={onVolverAHoy}>Volver a hoy</DemoBarButton>
          <Button variant="danger" size="sm" onClick={onRestablecerDemo}>
            Restablecer demo
          </Button>
        </div>
      </div>
    </div>
  )
}
