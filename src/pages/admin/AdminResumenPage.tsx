import { Link } from 'react-router-dom'
import { EstadoBadge } from '../../components/domain/EstadoBadge'
import { KpiCard } from '../../components/domain/KpiCard'
import { NoAptoFlag } from '../../components/domain/NoAptoFlag'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { useNotificaciones } from '../../hooks/useNotificaciones'
import { useTrabajadoresConEstado } from '../../hooks/useTrabajadoresConEstado'
import { calcularMetricasAgregadas, calcularMetricasTrabajador } from '../../lib/metrics'

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

function formatearDetalle(estado: 'por_vencer' | 'critico' | 'vencido', dias?: number): string | undefined {
  if (dias === undefined) return undefined
  return estado === 'vencido' ? `hace ${Math.abs(dias)} días` : `${dias} días`
}

/**
 * Resumen admin (spec sección 10.2, opcional): tarjetas rápidas + centro de
 * notificaciones + lista de No aptos, todo derivado en vivo de
 * `useTrabajadoresConEstado` / `useNotificaciones`.
 */
export default function AdminResumenPage() {
  const items = useTrabajadoresConEstado()
  const notificaciones = useNotificaciones()
  const metricas = calcularMetricasAgregadas(items)

  const noAptos = items.filter(({ trabajador, certsConEstado }) => calcularMetricasTrabajador(trabajador, certsConEstado).noApto)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-950">Resumen</h1>
        <p className="mt-1 text-sm text-slate-500">Estado general de certificaciones a la fecha simulada.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label="Trabajadores" value={metricas.numTrabajadores} icon={<IconUsers className="h-5 w-5" />} tone="brand" />
        <KpiCard label="% cumplimiento" value={Math.round(metricas.porcentajeCumplimiento)} suffix="%" icon={<IconGauge className="h-5 w-5" />} tone="success" />
        <KpiCard label="No aptos" value={metricas.noAptos} icon={<IconBlockCircle className="h-5 w-5" />} tone="danger" />
        <KpiCard label="Próximas a vencer" value={metricas.proximasAVencer} icon={<IconClock className="h-5 w-5" />} tone="warning" />
      </div>

      {noAptos.length > 0 && (
        <div className="flex flex-col gap-2">
          <NoAptoFlag noApto variant="banner" />
          <div className="flex flex-wrap gap-2">
            {noAptos.map(({ trabajador }) => (
              <Link
                key={trabajador.id}
                to={`/admin/trabajadores/${trabajador.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-estado-vencido transition-colors hover:bg-estado-vencido-soft-bg"
              >
                {trabajador.nombre}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Centro de notificaciones</CardTitle>
            <CardDescription>Certificaciones a 30 y 15 días, y vencidas — agrupadas por trabajador</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {notificaciones.length === 0 ? (
            <EmptyState title="Sin alertas pendientes" description="Todas las certificaciones están al día a la fecha simulada." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {notificaciones.map((alerta) => (
                <li key={`${alerta.trabajadorId}-${alerta.certId}`}>
                  <Link
                    to={`/admin/trabajadores/${alerta.trabajadorId}`}
                    className="flex flex-col gap-2 p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{alerta.trabajadorNombre}</p>
                      <p className="text-sm text-slate-500">{alerta.certNombre}</p>
                    </div>
                    <EstadoBadge estado={alerta.estado} detalle={formatearDetalle(alerta.estado, alerta.diasRestantes)} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
