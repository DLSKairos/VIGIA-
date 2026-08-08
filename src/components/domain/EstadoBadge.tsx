import type { ReactElement } from 'react'
import type { EstadoCert } from '../../types/domain'
import { cn } from '../ui/cn'

export interface EstadoMeta {
  label: string
  /** Clases del badge "solid" (tablero, legible a distancia). */
  solidClass: string
  /** Clases del badge "soft" (chip discreto, ej. dentro de tablas densas). */
  softClass: string
  /** Color plano del punto/ícono (para gráficas, leyendas). */
  dotClass: string
  /** Hex del color base — para usar en Recharts (fill no acepta var(--token) siempre de forma fiable). */
  hex: string
  Icon: (props: { className?: string }) => ReactElement
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconAlertTriangle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M10.6 4.2 2.9 18a1.8 1.8 0 0 0 1.55 2.7h15.1A1.8 1.8 0 0 0 21.1 18L13.4 4.2a1.8 1.8 0 0 0-3.1 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 10v4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function IconQuestion({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M9.2 9a2.8 2.8 0 1 1 4.3 2.4c-.9.6-1.5 1.1-1.5 2.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * Fuente de verdad visual del semáforo de estados (spec sección 7). Cada
 * estado trae, además del color, un ícono distinto — el color NUNCA es el
 * único indicador (accesibilidad para daltonismo).
 */
export const ESTADO_META: Record<EstadoCert, EstadoMeta> = {
  vigente: {
    label: 'Vigente',
    solidClass: 'bg-estado-vigente text-white',
    softClass: 'bg-estado-vigente-soft-bg text-estado-vigente-soft-fg',
    dotClass: 'bg-estado-vigente',
    hex: '#15803D',
    Icon: IconCheck,
  },
  por_vencer: {
    label: 'Por vencer',
    solidClass: 'bg-estado-por_vencer text-ink-950',
    softClass: 'bg-estado-por_vencer-soft-bg text-estado-por_vencer-soft-fg',
    dotClass: 'bg-estado-por_vencer',
    hex: '#F2B705',
    Icon: IconClock,
  },
  critico: {
    label: 'Crítico',
    solidClass: 'bg-estado-critico text-white',
    softClass: 'bg-estado-critico-soft-bg text-estado-critico-soft-fg',
    dotClass: 'bg-estado-critico',
    hex: '#C2410C',
    Icon: IconAlertTriangle,
  },
  vencido: {
    label: 'Vencido',
    solidClass: 'bg-estado-vencido text-white',
    softClass: 'bg-estado-vencido-soft-bg text-estado-vencido-soft-fg',
    dotClass: 'bg-estado-vencido',
    hex: '#B91C1C',
    Icon: IconX,
  },
  faltante: {
    label: 'Faltante',
    solidClass: 'bg-estado-faltante text-white ring-1 ring-inset ring-estado-faltante-accent/70',
    softClass: 'bg-estado-faltante-soft-bg text-estado-faltante-soft-fg ring-1 ring-inset ring-estado-faltante-accent/40',
    dotClass: 'bg-estado-faltante',
    hex: '#44403C',
    Icon: IconQuestion,
  },
}

export interface EstadoBadgeProps {
  estado: EstadoCert
  /** Texto adicional, ej. "12 días" — se antepone al label. */
  detalle?: string
  size?: 'sm' | 'md' | 'lg'
  /** 'solid' (tablero, alto contraste) o 'soft' (chip discreto en tablas). */
  variant?: 'solid' | 'soft'
  className?: string
}

/**
 * Única fuente de verdad visual de los 5 estados de certificación
 * (spec sección 7). Úsese en TODA la app en vez de reimplementar el
 * semáforo — dashboard, tablas de trabajadores, detalle, notificaciones.
 */
export function EstadoBadge({ estado, detalle, size = 'md', variant = 'solid', className }: EstadoBadgeProps) {
  const meta = ESTADO_META[estado]
  const Icon = meta.Icon

  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : size === 'lg' ? 'px-3.5 py-2 text-sm gap-2' : 'px-2.5 py-1 text-xs gap-1.5'
  const iconSize = size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        variant === 'solid' ? meta.solidClass : meta.softClass,
        sizeClasses,
        className,
      )}
    >
      <Icon className={cn(iconSize, 'shrink-0')} />
      {meta.label}
      {detalle && <span className="opacity-80">· {detalle}</span>}
    </span>
  )
}
