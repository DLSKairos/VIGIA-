import type { ReactNode } from 'react'
import { cn } from '../ui/cn'

export interface KpiCardProps {
  label: string
  /** Valor grande. Se renderiza en fuente mono (lectura tipo instrumento). */
  value: string | number
  /** Sufijo pegado al valor, ej. "%". */
  suffix?: string
  icon?: ReactNode
  /** Texto pequeño bajo el valor (ej. "18 de 27 trabajadores"). */
  sublabel?: string
  tone?: 'default' | 'brand' | 'danger' | 'warning' | 'success'
  className?: string
}

const TONE_ICON_CLASSES: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'bg-slate-100 text-ink-700',
  brand: 'bg-brand-100 text-brand-700',
  danger: 'bg-estado-vencido-soft-bg text-estado-vencido-soft-fg',
  warning: 'bg-estado-por_vencer-soft-bg text-estado-por_vencer-soft-fg',
  success: 'bg-estado-vigente-soft-bg text-estado-vigente-soft-fg',
}

/**
 * Tarjeta KPI grande para el dashboard público (spec sección 10.1,
 * inspirado en el dashboard del ICCU: "tarjetas KPI grandes"). El número
 * usa la fuente mono de la marca — lectura tipo instrumento de tablero.
 */
export function KpiCard({ label, value, suffix, icon, sublabel, tone = 'default', className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-vigia-lg border border-slate-200 bg-white p-4 shadow-vigia-card sm:p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">{label}</p>
        {icon && (
          <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-vigia-sm', TONE_ICON_CLASSES[tone])} aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <p className="font-mono text-3xl font-bold tabular-nums text-ink-950 sm:text-4xl">
        {value}
        {suffix && <span className="ml-0.5 text-xl text-slate-400 sm:text-2xl">{suffix}</span>}
      </p>
      {sublabel && <p className="text-xs text-slate-500 sm:text-sm">{sublabel}</p>}
    </div>
  )
}
