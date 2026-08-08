import { useEffect, useState } from 'react'

export type MobileOS = 'ios' | 'android' | null

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function detectMobileOS(): MobileOS {
  const ua = window.navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return null
}

function detectStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

/**
 * Gatea la app en navegador móvil (fuera de la PWA instalada): en vez de
 * exponer la funcionalidad completa, la pantalla debe mostrar solo la
 * descarga (Android, vía beforeinstallprompt) o el instructivo "agregar a
 * inicio" (iOS, que no soporta instalación programática). Desktop y la PWA
 * ya instalada (display-mode standalone) nunca se gatean.
 */
export function usePwaInstallGate() {
  const [os] = useState<MobileOS>(() => (typeof window === 'undefined' ? null : detectMobileOS()))
  const [isStandalone, setIsStandalone] = useState(() =>
    typeof window === 'undefined' ? false : detectStandalone(),
  )
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = () => setIsStandalone(detectStandalone())
    media.addEventListener('change', handleDisplayModeChange)

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    const handleAppInstalled = () => setIsStandalone(true)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      media.removeEventListener('change', handleDisplayModeChange)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const isMobile = os !== null
  const showGate = isMobile && !isStandalone

  async function promptInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') setIsStandalone(true)
    setInstallPrompt(null)
  }

  return { os, showGate, canPromptInstall: installPrompt !== null, promptInstall }
}
