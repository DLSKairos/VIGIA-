import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { VigiaWordmark } from '../components/brand/VigiaLogo'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useVigiaStore } from '../store/useVigiaStore'

/**
 * Login del panel admin (spec sección 5.5 y 10.2). Las credenciales se
 * muestran como pista a propósito: es un demo comercial y quien lo
 * presenta no es el desarrollador.
 */
export default function LoginPage() {
  const isAuthenticated = useVigiaStore((state) => state.isAuthenticated)
  const login = useVigiaStore((state) => state.login)
  const reabrirPopupAlertas = useVigiaStore((state) => state.reabrirPopupAlertas)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    // Pequeño delay artificial para que el estado "loading" del botón se
    // alcance a percibir en la demo (login real es instantáneo, sin red).
    window.setTimeout(() => {
      const ok = login(email, password)
      if (ok) {
        // El pop-up-resumen de alertas (spec sección 8) debe reaparecer en
        // cada login nuevo, aunque ya se haya descartado en una sesión
        // anterior sin recargar la página (popupAlertasDescartado no
        // persiste entre refrescos, pero sí sobrevive a un logout/login
        // dentro de la misma sesión de la pestaña).
        reabrirPopupAlertas()
        navigate('/admin')
      } else {
        setError('Correo o contraseña incorrectos.')
        setLoading(false)
      }
    }, 250)
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink-950 sm:flex-row">
      {/* Panel izquierdo — identidad (oculto en mobile para priorizar el form) */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-ink-950 p-10 sm:flex lg:p-14">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl"
          aria-hidden="true"
        />
        <Link to="/" className="w-fit">
          <VigiaWordmark tone="light" withTagline />
        </Link>
        <div className="relative max-w-md">
          <p className="font-display text-2xl font-bold leading-snug text-white lg:text-3xl">
            Vigila cada certificación. Avisa antes de que venza. No deja entrar al taladro a quien no está apto.
          </p>
          <p className="mt-4 text-sm text-brand-200">Panel administrativo — Gestión Humana, Entrenamiento externo.</p>
        </div>
        <p className="relative text-xs text-ink-400">VIGÍA — un producto de Kairos.</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-6 sm:rounded-l-vigia-xl sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 sm:hidden">
            <Link to="/" className="w-fit">
              <VigiaWordmark tone="dark" withTagline />
            </Link>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-600"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver al inicio
          </Link>

          <h1 className="mt-4 font-display tracking-display-lg text-2xl font-bold text-ink-950">Ingresar al panel</h1>
          <p className="mt-1 text-sm text-slate-500">Usa tus credenciales de administrador para continuar.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <Input
              label="Correo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="admin@vigia.co"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />

            {error && (
              <p role="alert" className="rounded-vigia-sm bg-estado-vencido-soft-bg px-3 py-2 text-sm font-medium text-estado-vencido-soft-fg">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth size="lg" loading={loading} className="mt-1">
              Ingresar
            </Button>
          </form>

          <div className="mt-6 rounded-vigia-md border border-dashed border-brand-300 bg-brand-50 px-4 py-3 text-xs text-brand-800">
            <p className="font-semibold">Credenciales de demo</p>
            <p className="mt-0.5 font-mono">admin@vigia.co · Vigia2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}
