import { useState } from 'react'
import { ComplianceBarChart } from '../components/domain/ComplianceBarChart'
import { EstadoBadge } from '../components/domain/EstadoBadge'
import { EstadoDonutChart } from '../components/domain/EstadoDonutChart'
import { KpiCard } from '../components/domain/KpiCard'
import { NoAptoFlag } from '../components/domain/NoAptoFlag'
import { PageContainer } from '../components/layout/PageContainer'
import { PublicFooter } from '../components/layout/PublicFooter'
import { PublicHeader } from '../components/layout/PublicHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Select } from '../components/ui/Select'
import { taladrosSeed } from '../data/seed/taladros.seed'

type FiltroTipo = 'todos' | 'taladro' | 'trabajador'

/** Nombres de los 6 trabajadores de seed (spec sección 14) — solo para poblar
 * visualmente el filtro; el drill-down real lo conecta Fase 3. */
const TRABAJADORES_DEMO = [
  'Carlos Mendoza',
  'Andrés Gaviria',
  'Julián Torres',
  'Óscar Ramírez',
  'Diego Cárdenas',
  'Laura Ríos',
]

const FILTRO_TABS: { value: FiltroTipo; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'taladro', label: 'Por taladro' },
  { value: 'trabajador', label: 'Por trabajador' },
]

function IconUsers({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 19c.6-3.4 3-5.2 6-5.2s5.4 1.8 6 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 8.2a3 3 0 1 1 2.4 4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 13.8c2.6.3 4.4 1.9 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconClipboard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="5" y="4.5" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 4.5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 11h7M8.5 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconGauge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 15a8 8 0 1 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 15l4-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconBadgeCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 3.5 19 6v5.5c0 4.4-3 7.6-7 8.9-4-1.3-7-4.5-7-8.9V6l7-2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBlockCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.9 6.9l10.2 10.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M10.6 4.2 2.9 18a1.8 1.8 0 0 0 1.55 2.7h15.1A1.8 1.8 0 0 0 21.1 18L13.4 4.2a1.8 1.8 0 0 0-3.1 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 10v4.2M12 17.3h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Vista pública ("/", sin login) — vitrina de métricas (spec sección 10.1,
 * inspirada en el dashboard del ICCU). Shell visual con datos de ejemplo:
 * Fase 3 conecta `lib/metrics.ts` + el store para que los números y
 * gráficas reflejen el estado real/simulado.
 */
export default function DashboardPage() {
  const [filtro, setFiltro] = useState<FiltroTipo>('todos')
  const [taladroSel, setTaladroSel] = useState(taladrosSeed[0]?.id ?? '')
  const [trabajadorSel, setTrabajadorSel] = useState(TRABAJADORES_DEMO[0])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-1">
        <PageContainer width="wide" className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-10">
          {/* Encabezado + filtros */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-ink-950 sm:text-3xl">Panorama general</h1>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Certificaciones al día, en riesgo y vencidas — actualizado en vivo con la fecha simulada.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filtrar dashboard"
              className="flex w-full gap-1 rounded-vigia-md border border-slate-200 bg-white p-1 sm:w-auto"
            >
              {FILTRO_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={filtro === tab.value}
                  onClick={() => setFiltro(tab.value)}
                  className={`h-10 flex-1 cursor-pointer rounded-vigia-sm px-3 text-sm font-semibold transition-colors sm:flex-none ${
                    filtro === tab.value ? 'bg-ink-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-ink-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filtro !== 'todos' && (
            <Card>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                {filtro === 'taladro' ? (
                  <Select
                    label="Taladro"
                    className="sm:max-w-xs"
                    value={taladroSel}
                    onChange={(e) => setTaladroSel(e.target.value)}
                    options={taladrosSeed.map((t) => ({ value: t.id, label: t.nombre }))}
                  />
                ) : (
                  <Select
                    label="Trabajador"
                    className="sm:max-w-xs"
                    value={trabajadorSel}
                    onChange={(e) => setTrabajadorSel(e.target.value)}
                    options={TRABAJADORES_DEMO.map((nombre) => ({ value: nombre, label: nombre }))}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {filtro === 'trabajador' ? (
            <WorkerDrillDownMock nombre={trabajadorSel} />
          ) : (
            <>
              {/* Grid de KPIs */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <KpiCard label="Trabajadores" value={6} icon={<IconUsers className="h-5 w-5" />} tone="brand" sublabel="5 operativos · 1 administrativo" />
                <KpiCard label="% de cumplimiento" value={83} suffix="%" icon={<IconGauge className="h-5 w-5" />} tone="success" sublabel="Σ cumplidas / Σ requeridas" />
                <KpiCard label="Personas certificadas" value={60} suffix="%" icon={<IconBadgeCheck className="h-5 w-5" />} tone="brand" sublabel="3 de 5 operativos al 100%" />
                <KpiCard label="No aptos para taladro" value={2} icon={<IconBlockCircle className="h-5 w-5" />} tone="danger" sublabel="Requisito de ingreso vencido/faltante" />
                <KpiCard label="Certificaciones requeridas" value={19} icon={<IconClipboard className="h-5 w-5" />} sublabel="Según cargo de cada operativo" />
                <KpiCard label="Certificaciones cumplidas" value={16} icon={<IconBadgeCheck className="h-5 w-5" />} tone="success" sublabel="Vigentes, por vencer o críticas" />
                <KpiCard label="Próximas a vencer" value={3} icon={<IconClock className="h-5 w-5" />} tone="warning" sublabel="≤ 30 días para vencer" />
                <KpiCard label="Vencidas" value={2} icon={<IconAlert className="h-5 w-5" />} tone="danger" sublabel="Requieren renovación inmediata" />
              </div>

              {/* Gráficas */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <div>
                      <CardTitle>Cumplimiento por taladro</CardTitle>
                      <CardDescription>% de certificaciones cumplidas sobre las requeridas</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ComplianceBarChart />
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div>
                      <CardTitle>Distribución de estados</CardTitle>
                      <CardDescription>Todas las certificaciones requeridas</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <EstadoDonutChart />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </PageContainer>
      </main>

      <PublicFooter />
    </div>
  )
}

/** Drill-down mock por trabajador (spec sección 10.1). Datos hardcodeados a
 * modo de ejemplo visual — Fase 3 los deriva de `getCertificacionesEstadoTrabajador`. */
function WorkerDrillDownMock({ nombre }: { nombre: string }) {
  const noApto = nombre === 'Óscar Ramírez' || nombre === 'Diego Cárdenas'

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{nombre}</CardTitle>
          <CardDescription>Soldador · Rig 3003</CardDescription>
        </div>
        <NoAptoFlag noApto={noApto} variant="pill" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="% cumplimiento" value={noApto ? 67 : 100} suffix="%" tone={noApto ? 'danger' : 'success'} />
          <KpiCard label="Requeridas" value={3} />
          <KpiCard label="Cumplidas" value={noApto ? 2 : 3} tone="success" />
          <KpiCard label="Próx. a vencer" value={0} tone="warning" />
        </div>

        {noApto && <NoAptoFlag noApto />}

        <ul className="divide-y divide-slate-100 rounded-vigia-md border border-slate-200">
          <li className="flex items-center justify-between gap-3 p-3 text-sm">
            <span className="text-ink-800">Alturas trabajador autorizado</span>
            <EstadoBadge estado="vigente" variant="soft" size="sm" />
          </li>
          <li className="flex items-center justify-between gap-3 p-3 text-sm">
            <span className="text-ink-800">Espacios confinados entrante</span>
            <EstadoBadge estado={noApto ? 'faltante' : 'vigente'} variant="soft" size="sm" />
          </li>
          <li className="flex items-center justify-between gap-3 p-3 text-sm">
            <span className="text-ink-800">Brigadas integrales</span>
            <EstadoBadge estado="por_vencer" detalle="25 días" variant="soft" size="sm" />
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
