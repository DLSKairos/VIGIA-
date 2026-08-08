import type { HTMLAttributes } from 'react'
import { cn } from './cn'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  size?: BadgeSize
  /** Punto de color a la izquierda del texto (además del fondo). */
  dot?: boolean
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-100 text-brand-800',
  success: 'bg-estado-vigente-soft-bg text-estado-vigente-soft-fg',
  warning: 'bg-estado-por_vencer-soft-bg text-estado-por_vencer-soft-fg',
  danger: 'bg-estado-vencido-soft-bg text-estado-vencido-soft-fg',
  info: 'bg-sky-100 text-sky-800',
}

const DOT_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-500',
  brand: 'bg-brand-600',
  success: 'bg-estado-vigente',
  warning: 'bg-estado-por_vencer',
  danger: 'bg-estado-vencido',
  info: 'bg-sky-600',
}

/**
 * Badge genérico del sistema de diseño (chip pequeño de estado/etiqueta).
 * Para el semáforo de certificaciones usar `EstadoBadge`
 * (`components/domain/EstadoBadge.tsx`), que es la única fuente de verdad
 * visual de los 5 estados — este componente es su base compartida.
 */
export function Badge({ tone = 'neutral', size = 'sm', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT_CLASSES[tone])} aria-hidden="true" />}
      {children}
    </span>
  )
}
