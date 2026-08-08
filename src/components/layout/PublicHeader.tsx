import { Link } from 'react-router-dom'
import { VigiaWordmark } from '../brand/VigiaLogo'
import { PageContainer } from './PageContainer'

/**
 * Header de la vista pública ("/"): wordmark VIGÍA + tagline (spec sección
 * 1 y 13). VIGÍA es un producto de Kairos — sin logo/branding de TDCO.
 */
export function PublicHeader() {
  return (
    <header className="border-b border-ink-800 bg-ink-950">
      <PageContainer width="wide" className="flex h-16 items-center justify-between sm:h-20">
        <VigiaWordmark tone="light" withTagline />
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium text-brand-300 sm:inline">Un producto de Kairos</span>
          <Link
            to="/login"
            className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-vigia-sm border border-ink-600 px-4 text-sm font-semibold text-white transition-colors hover:border-brand-500 hover:bg-ink-800 focus-visible:outline-brand-400"
          >
            Ingresar
          </Link>
        </div>
      </PageContainer>
    </header>
  )
}
