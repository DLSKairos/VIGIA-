import type { ReactNode } from 'react'
import { cn } from './cn'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/** Estado vacío reutilizable (listas/tablas sin resultados, filtros sin match). */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}>
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400" aria-hidden="true">
          {icon}
        </div>
      )}
      <div>
        <p className="font-display text-sm font-semibold text-ink-800">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
