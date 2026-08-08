import { Link } from 'react-router-dom'
import { type Alerta, useNotificaciones } from '../../hooks/useNotificaciones'
import { useVigiaStore } from '../../store/useVigiaStore'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { EstadoBadge } from './EstadoBadge'

const MAX_VISIBLES = 12

function formatearDetalle(alerta: Alerta): string | undefined {
  if (alerta.diasRestantes === undefined) return undefined
  return alerta.estado === 'vencido' ? `hace ${Math.abs(alerta.diasRestantes)} días` : `${alerta.diasRestantes} días`
}

/**
 * Pop-up-resumen de alertas al iniciar sesión (spec sección 8): certifica-
 * ciones por vencer (a 30/15 días) y vencidas, en un modal descartable.
 * Controlado por `uiSlice.popupAlertasDescartado` — `LoginPage` reabre el
 * flag (`reabrirPopupAlertas`) en cada login exitoso para que reaparezca
 * cada vez que alguien entra, aunque ya lo hayan descartado en una sesión
 * anterior sin recargar la página.
 */
export function AlertasPopup() {
  const descartado = useVigiaStore((state) => state.popupAlertasDescartado)
  const descartar = useVigiaStore((state) => state.descartarPopupAlertas)
  const alertas = useNotificaciones()

  const open = !descartado && alertas.length > 0
  const visibles = alertas.slice(0, MAX_VISIBLES)
  const restantes = alertas.length - visibles.length

  return (
    <Modal
      open={open}
      onClose={descartar}
      title="Alertas de certificaciones"
      description={`${alertas.length} certificación${alertas.length === 1 ? '' : 'es'} por vencer o vencidas a la fecha simulada.`}
      size="lg"
      footer={
        <Button onClick={descartar} autoFocus>
          Entendido
        </Button>
      }
    >
      <ul className="flex flex-col divide-y divide-slate-100">
        {visibles.map((alerta) => (
          <li key={`${alerta.trabajadorId}-${alerta.certId}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <Link
                to={`/admin/trabajadores/${alerta.trabajadorId}`}
                onClick={descartar}
                className="truncate text-sm font-semibold text-ink-900 hover:text-brand-700 hover:underline"
              >
                {alerta.trabajadorNombre}
              </Link>
              <p className="truncate text-sm text-slate-500">{alerta.certNombre}</p>
            </div>
            <EstadoBadge estado={alerta.estado} detalle={formatearDetalle(alerta)} size="sm" />
          </li>
        ))}
      </ul>
      {restantes > 0 && <p className="mt-3 text-xs font-medium text-slate-500">y {restantes} más — revisa el centro de notificaciones.</p>}
    </Modal>
  )
}
