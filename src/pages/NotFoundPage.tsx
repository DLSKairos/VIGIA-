import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900">404 — página no encontrada</h1>
      <Link to="/" className="mt-2 inline-block text-neutral-500 underline">
        Volver al dashboard
      </Link>
    </div>
  )
}
