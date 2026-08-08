/**
 * Monograma VIGÍA: un hexágono (silueta de insignia/certificación, guiño al
 * mundo HSE sin caer en el cliché de casco+llave) con un ojo vigilante en
 * el centro y una señal/beacon en la esquina — "el que observa para que
 * nadie salga lastimado" (VIGIA.md sección 1). Mismo trazado usado en
 * favicon e íconos PWA (`public/favicon.svg`).
 */
export function VigiaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="VIGÍA">
      <path
        d="M50 4 L89 28 L89 72 L50 96 L11 72 L11 28 Z"
        fill="currentColor"
        className="text-ink-900"
      />
      <path
        d="M50 4 L89 28 L89 72 L50 96 L11 72 L11 28 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-brand-500"
      />
      <path
        d="M27 50 C 38 34, 62 34, 73 50 C 62 66, 38 66, 27 50 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
        className="text-brand-400"
      />
      <circle cx="50" cy="50" r="9" fill="currentColor" className="text-brand-500" />
      <circle cx="50" cy="50" r="3.2" fill="currentColor" className="text-brand-50" />
      <circle cx="73" cy="24" r="5" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-brand-500" />
      <circle cx="73" cy="24" r="1.6" fill="currentColor" className="text-brand-500" />
    </svg>
  )
}

export interface VigiaWordmarkProps {
  /** 'light' = texto claro (para fondos oscuros, header público/admin). */
  tone?: 'light' | 'dark'
  /** Muestra el tagline debajo del wordmark (spec sección 1 y 13). */
  withTagline?: boolean
  className?: string
}

/** Wordmark completo: ícono + "VIGÍA" + tagline opcional. */
export function VigiaWordmark({ tone = 'dark', withTagline = false, className }: VigiaWordmarkProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <VigiaMark className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
      <div className="flex flex-col leading-none">
        <span
          className={`font-display text-lg font-extrabold tracking-tight sm:text-xl ${
            tone === 'light' ? 'text-white' : 'text-ink-900'
          }`}
        >
          VIGÍA
        </span>
        {withTagline && (
          <span className={`mt-0.5 text-xs font-medium ${tone === 'light' ? 'text-brand-200' : 'text-slate-500'}`}>
            Siempre al día, siempre en operación.
          </span>
        )}
      </div>
    </div>
  )
}
