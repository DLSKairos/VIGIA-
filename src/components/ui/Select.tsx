import { type SelectHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from './cn'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  /** Texto del option deshabilitado inicial (ej. "Selecciona un cargo"). */
  placeholder?: string
}

/**
 * Select nativo estilizado (mejor soporte de accesibilidad/teclado/mobile
 * que un combobox custom para el alcance de este MVP).
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, helperText, options, placeholder, id, className, required, ...props },
  ref,
) {
  const autoId = useId()
  const selectId = id ?? autoId
  const helperId = `${selectId}-helper`
  const errorId = `${selectId}-error`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-ink-800">
          {label}
          {required && (
            <span className="ml-0.5 text-estado-vencido" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'h-11 w-full appearance-none rounded-vigia-sm border bg-white px-3 pr-9 text-sm text-ink-900',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40',
            error ? 'border-estado-vencido focus:border-estado-vencido' : 'border-slate-300 focus:border-brand-500',
            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
            className,
          )}
          defaultValue={props.defaultValue ?? (placeholder ? '' : undefined)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
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
