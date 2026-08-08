import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from './cn'

/**
 * Primitivas de tabla del sistema de diseño: scroll horizontal contenido en
 * mobile (nunca desborda la pantalla), encabezado sticky, filas con hover
 * y separación clara. Se usa tal cual en Trabajadores/Cargos/Certificaciones
 * (Fase 3 conecta los datos).
 */
export function TableContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('overflow-x-auto rounded-vigia-lg border border-slate-200 bg-white', className)}
      {...props}
    />
  )
}

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full min-w-[640px] border-collapse text-left text-sm', className)} {...props} />
}

export function THead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-slate-50', className)} {...props} />
}

export function TBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-slate-100', className)} {...props} />
}

export function TR({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('transition-colors hover:bg-slate-50', className)} {...props} />
}

export function TH({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500',
        className,
      )}
      {...props}
    />
  )
}

export function TD({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-middle text-ink-800', className)} {...props} />
}
