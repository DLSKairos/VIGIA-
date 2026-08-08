import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { cn } from './cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Muestra spinner y deshabilita el botón (evita doble submit). */
  loading?: boolean
  /** Ícono a la izquierda del label (decorativo, aria-hidden). */
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-slate-200 disabled:text-slate-400',
  secondary:
    'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-700 disabled:bg-slate-200 disabled:text-slate-400',
  outline:
    'bg-transparent text-ink-900 border border-slate-300 hover:border-brand-500 hover:bg-brand-50 active:bg-brand-100 disabled:border-slate-200 disabled:text-slate-400 disabled:bg-transparent',
  ghost:
    'bg-transparent text-ink-800 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-400 disabled:bg-transparent',
  danger:
    'bg-estado-vencido text-white hover:bg-red-800 active:bg-red-900 disabled:bg-slate-200 disabled:text-slate-400',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5 min-w-11',
  md: 'h-11 px-4 text-sm gap-2 min-w-11',
  lg: 'h-12 px-6 text-base gap-2 min-w-11',
}

/**
 * Botón base del sistema de diseño VIGÍA. Estados normal/hover/focus/
 * disabled/loading cubiertos. Target táctil mínimo 44px de alto en todos
 * los tamaños (accesibilidad, sección 13 del spec).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    iconLeft,
    iconRight,
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={props.type ?? 'button'}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-vigia-sm font-medium transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:pointer-events-none',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : (
        iconLeft && (
          <span className="shrink-0" aria-hidden="true">
            {iconLeft}
          </span>
        )
      )}
      {children}
      {!loading && iconRight && (
        <span className="shrink-0" aria-hidden="true">
          {iconRight}
        </span>
      )}
    </button>
  )
})
