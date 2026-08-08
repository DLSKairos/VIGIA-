import type { ReactNode } from 'react'
import { usePwaInstallGate } from '../../hooks/usePwaInstallGate'
import { VigiaWordmark } from '../brand/VigiaLogo'
import { Button } from '../ui/Button'

/**
 * Envuelve la app entera. En navegador móvil (Android/iPhone) sin la PWA
 * instalada, reemplaza toda la funcionalidad por la pantalla de descarga/
 * instructivo — el router nunca llega a montarse. Desktop y la PWA ya
 * instalada (modo standalone) pasan directo a los hijos.
 */
export function InstallGate({ children }: { children: ReactNode }) {
  const { os, showGate, canPromptInstall, promptInstall } = usePwaInstallGate()

  if (!showGate) return <>{children}</>

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-950 px-6 py-10 text-center">
      <VigiaWordmark tone="light" withTagline className="mb-8" />
      <div className="w-full max-w-sm rounded-vigia-lg border border-ink-700 bg-ink-900 p-6 shadow-vigia-lifted">
        {os === 'android' ? (
          <AndroidInstall canPrompt={canPromptInstall} onInstall={promptInstall} />
        ) : (
          <IosInstall />
        )}
      </div>
    </div>
  )
}

function AndroidInstall({ canPrompt, onInstall }: { canPrompt: boolean; onInstall: () => void }) {
  return (
    <>
      <h1 className="font-display text-xl font-bold text-white">Instalá la app VIGÍA</h1>
      <p className="mt-2 text-sm text-ink-200">
        Para usar VIGÍA desde tu celular, instalá la app en tu pantalla de inicio.
      </p>
      {canPrompt ? (
        <Button variant="primary" size="lg" fullWidth className="mt-6" onClick={onInstall}>
          Descargar app
        </Button>
      ) : (
        <div className="mt-6 rounded-vigia-sm border border-ink-600 bg-ink-800 p-4 text-left text-sm text-ink-100">
          <p className="font-semibold text-white">Instalá manualmente:</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-4">
            <li>
              Tocá el menú <span className="font-mono">⋮</span> de tu navegador.
            </li>
            <li>Elegí "Instalar app" o "Agregar a pantalla de inicio".</li>
            <li>Confirmá tocando "Instalar".</li>
          </ol>
        </div>
      )}
    </>
  )
}

function IosInstall() {
  return (
    <>
      <h1 className="font-display text-xl font-bold text-white">Agregá VIGÍA a tu inicio</h1>
      <p className="mt-2 text-sm text-ink-200">
        Safari no permite instalar apps directamente. Seguí estos pasos:
      </p>
      <ol className="mt-6 space-y-3 text-left text-sm text-ink-100">
        <li className="flex items-start gap-3">
          <StepNumber>1</StepNumber>
          <span>
            Tocá el ícono <strong className="text-white">Compartir</strong>{' '}
            <ShareIcon className="inline h-4 w-4 align-text-bottom" /> en la barra inferior de Safari.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <StepNumber>2</StepNumber>
          <span>
            Deslizá hacia abajo y elegí <strong className="text-white">"Agregar a inicio"</strong>.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <StepNumber>3</StepNumber>
          <span>
            Tocá <strong className="text-white">"Agregar"</strong> arriba a la derecha.
          </span>
        </li>
      </ol>
    </>
  )
}

function StepNumber({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
      {children}
    </span>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 3v12" strokeLinecap="round" />
      <path d="M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="5" y="11" width="14" height="10" rx="2" />
    </svg>
  )
}
