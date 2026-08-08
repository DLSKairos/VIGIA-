import { type FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useVigiaStore } from '../store/useVigiaStore'

/**
 * Login del panel admin (spec sección 5.5 y 10.2). Funcionalmente completo
 * (conectado al store) pero SIN diseño final — eso lo hace el agente de
 * UX/UI en la fase siguiente. Las credenciales se muestran como pista
 * porque es un demo comercial y quien lo presenta no es el desarrollador.
 */
export default function LoginPage() {
  const isAuthenticated = useVigiaStore((state) => state.isAuthenticated)
  const login = useVigiaStore((state) => state.login)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const ok = login(email, password)
    if (ok) {
      navigate('/admin')
    } else {
      setError('Correo o contraseña incorrectos.')
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Ingresar — VIGÍA admin</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Correo
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2"
            autoComplete="username"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2"
            autoComplete="current-password"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          className="mt-2 rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
        >
          Ingresar
        </button>
      </form>

      <p className="text-xs text-neutral-400">
        Demo — admin@vigia.co / Vigia2026
      </p>
    </div>
  )
}
