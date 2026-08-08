import { Link } from 'react-router-dom'
import { VigiaMark } from '../components/brand/VigiaLogo'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
      <VigiaMark className="h-14 w-14 text-ink-900 opacity-70" />
      <div>
        <p className="font-mono text-sm font-semibold uppercase tracking-widest text-brand-600">Error 404</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-950 sm:text-3xl">Esta zona no está vigilada</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">La página que buscas no existe o cambió de lugar.</p>
      </div>
      <Link
        to="/"
        className="mt-2 inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-vigia-sm bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        Volver al dashboard
      </Link>
    </div>
  )
}
