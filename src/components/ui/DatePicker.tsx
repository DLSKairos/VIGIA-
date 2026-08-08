import { type InputHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from './cn'

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
}

/**
 * Wrapper estilizado sobre `<input type="date">` (spec: "puede ser un
 * wrapper simple"). Mantiene el picker nativo del navegador/OS (mejor
 * accesibilidad y soporte mobile que reimplementar un calendario).
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { label, error, helperText, id, className, required, ...props },
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
      <input
        ref={ref}
        type="date"
        id={inputId}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          'h-11 w-full rounded-vigia-sm border bg-white px-3 text-sm text-ink-900',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40',
          'scheme-light',
          error ? 'border-estado-vencido focus:border-estado-vencido' : 'border-slate-300 focus:border-brand-500',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
          className,
        )}
        {...props}
      />
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
