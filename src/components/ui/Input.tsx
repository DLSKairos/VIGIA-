import { type InputHTMLAttributes, type ReactNode, forwardRef, useId } from 'react'
import { cn } from './cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  iconLeft?: ReactNode
}

/**
 * Input de texto base. Label asociado vía `htmlFor`/`id` (accesibilidad),
 * estado de error visible con `aria-invalid` + `aria-describedby`, altura
 * mínima 44px táctil.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, iconLeft, id, className, required, ...props },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const helperId = `${inputId}-helper`
  const errorId = `${inputId}-error`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-800">
          {label}
          {required && (
            <span className="ml-0.5 text-estado-vencido" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        {iconLeft && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400" aria-hidden="true">
            {iconLeft}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'h-11 w-full rounded-vigia-sm border bg-white px-3 text-sm text-ink-900 placeholder:text-slate-400',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40',
            error ? 'border-estado-vencido focus:border-estado-vencido' : 'border-slate-300 focus:border-brand-500',
            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
            Boolean(iconLeft) && 'pl-9',
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={errorId} className="text-xs font-medium text-estado-vencido">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})
