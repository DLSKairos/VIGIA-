import { cn } from './cn'

export interface StepperStep {
  label: string
  description?: string
}

export interface StepperProps {
  steps: StepperStep[]
  /** Índice (0-based) del paso actual. */
  currentStep: number
}

/**
 * Stepper horizontal para el asistente de registro de trabajador (spec
 * sección 11, feature estrella). En mobile colapsa a "Paso N de M" +
 * barra de progreso para no romper el layout en pantallas angostas.
 */
export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div>
      {/* Mobile: progreso compacto */}
      <div className="sm:hidden">
        <p className="text-sm font-medium text-ink-800">
          Paso {currentStep + 1} de {steps.length} — {steps[currentStep]?.label}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: pasos con conectores */}
      <ol className="hidden items-start sm:flex" aria-label="Progreso del registro">
        {steps.map((step, index) => {
          const status = index < currentStep ? 'complete' : index === currentStep ? 'current' : 'upcoming'
          return (
            <li key={step.label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span
                  aria-current={status === 'current' ? 'step' : undefined}
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                    status === 'complete' && 'border-brand-600 bg-brand-600 text-white',
                    status === 'current' && 'border-brand-600 bg-white text-brand-700',
                    status === 'upcoming' && 'border-slate-300 bg-white text-slate-400',
                  )}
                >
                  {status === 'complete' ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    'max-w-28 text-xs font-medium',
                    status === 'upcoming' ? 'text-slate-400' : 'text-ink-800',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 -mt-5 h-0.5 flex-1 rounded-full transition-colors',
                    status === 'complete' ? 'bg-brand-600' : 'bg-slate-200',
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
