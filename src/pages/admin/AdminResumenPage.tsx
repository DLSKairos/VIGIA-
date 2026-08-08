import { EstadoBadge } from '../../components/domain/EstadoBadge'
import { KpiCard } from '../../components/domain/KpiCard'
import { NoAptoFlag } from '../../components/domain/NoAptoFlag'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'

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

function IconClock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function IconGauge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 15a8 8 0 1 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 15l4-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

const ALERTAS_DEMO = [
  { trabajador: 'Óscar Ramírez', cert: 'Well control combinado', estado: 'vencido' as const, detalle: 'venció hace 6 días' },
  { trabajador: 'Diego Cárdenas', cert: 'Espacios confinados entrante', estado: 'faltante' as const, detalle: 'nunca registrada' },
  { trabajador: 'Julián Torres', cert: 'Alturas trabajador autorizado', estado: 'critico' as const, detalle: '10 días' },
  { trabajador: 'Andrés Gaviria', cert: 'Brigadas integrales', estado: 'por_vencer' as const, detalle: '25 días' },
]

/**
 * Resumen admin (spec sección 10.2, opcional): tarjetas rápidas + centro de
 * notificaciones. Shell visual con datos de ejemplo — Fase 3 conecta con
 * `useVigiaStore` + `lib/metrics.ts` para que refleje el estado real.
 */
export default function AdminResumenPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-950">Resumen</h1>
        <p className="mt-1 text-sm text-slate-500">Estado general de certificaciones a la fecha simulada.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label="Trabajadores" value={6} icon={<IconUsers className="h-5 w-5" />} tone="brand" />
        <KpiCard label="% cumplimiento" value={83} suffix="%" icon={<IconGauge className="h-5 w-5" />} tone="success" />
        <KpiCard label="No aptos" value={2} icon={<IconBlockCircle className="h-5 w-5" />} tone="danger" />
        <KpiCard label="Próximas a vencer" value={3} icon={<IconClock className="h-5 w-5" />} tone="warning" />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Centro de notificaciones</CardTitle>
            <CardDescription>Certificaciones a 30 y 15 días, y vencidas — agrupadas por trabajador</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-slate-100">
            {ALERTAS_DEMO.map((alerta) => (
              <li key={`${alerta.trabajador}-${alerta.cert}`} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{alerta.trabajador}</p>
                  <p className="text-sm text-slate-500">{alerta.cert}</p>
                </div>
                <EstadoBadge estado={alerta.estado} detalle={alerta.detalle} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <NoAptoFlag noApto variant="banner" className="max-w-xl" />
    </div>
  )
}
