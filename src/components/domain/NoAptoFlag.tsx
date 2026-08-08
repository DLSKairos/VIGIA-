import { cn } from '../ui/cn'

function IconBlock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
      <path d="M6.5 6.5l11 11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function IconShieldCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 3.5 19 6v5.5c0 4.4-3 7.6-7 8.9-4-1.3-7-4.5-7-8.9V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export interface NoAptoFlagProps {
  noApto: boolean
  /** 'banner' = franja ancha (detalle de trabajador); 'pill' = compacto (listas/tarjetas). */
  variant?: 'banner' | 'pill'
  className?: string
}

/**
 * Bandera "No apto para taladro" (spec sección 7): debe ser IMPOSIBLE de no
 * ver. Solo se renderiza cuando `noApto` es true en variante banner (con
 * mensaje explícito); en 'pill' siempre ocupa su lugar para mostrar también
 * el estado positivo "Apto" (útil en listas, para contraste visual claro
 * entre quién sí y quién no puede entrar al taladro).
 */
export function NoAptoFlag({ noApto, variant = 'banner', className }: NoAptoFlagProps) {
  if (variant === 'pill') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide',
          noApto ? 'bg-estado-vencido text-white' : 'bg-estado-vigente-soft-bg text-estado-vigente-soft-fg',
          className,
        )}
      >
        {noApto ? <IconBlock className="h-3.5 w-3.5" /> : <IconShieldCheck className="h-3.5 w-3.5" />}
        {noApto ? 'No apto' : 'Apto'}
      </span>
    )
  }

  if (!noApto) return null

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 rounded-vigia-md border-2 border-red-700 bg-estado-vencido px-4 py-3 text-white shadow-vigia-lifted',
        className,
      )}
    >
      <IconBlock className="h-6 w-6 shrink-0" />
      <div>
        <p className="text-sm font-extrabold uppercase tracking-wide">No apto para taladro</p>
        <p className="text-xs text-red-100">
          Falta o venció una certificación de ingreso. No puede entrar al taladro hasta renovarla.
        </p>
      </div>
    </div>
  )
}
