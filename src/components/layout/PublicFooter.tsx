import { VigiaMark } from '../brand/VigiaLogo'
import { PageContainer } from './PageContainer'

/** Pie de página público: atribución a Kairos (spec: VIGÍA es un producto de Kairos, no de TDCO). */
export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6">
      <PageContainer
        width="wide"
        className="flex flex-col items-center justify-between gap-3 text-center text-xs text-slate-500 sm:flex-row sm:text-left"
      >
        <div className="flex items-center gap-2">
          <VigiaMark className="h-5 w-5 text-ink-900" />
          <span>
            <strong className="font-semibold text-ink-800">VIGÍA</strong> — un producto de Kairos.
          </span>
        </div>
        <span>Hecho con orgullo en Colombia.</span>
      </PageContainer>
    </footer>
  )
}
