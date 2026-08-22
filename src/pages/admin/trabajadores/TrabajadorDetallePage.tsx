import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CertificadoAdjunto } from '../../../components/domain/CertificadoAdjunto'
import { EstadoBadge } from '../../../components/domain/EstadoBadge'
import { KpiCard } from '../../../components/domain/KpiCard'
import { NoAptoFlag } from '../../../components/domain/NoAptoFlag'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import { DatePicker } from '../../../components/ui/DatePicker'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Modal } from '../../../components/ui/Modal'
import { useHoySimulada } from '../../../hooks/useHoySimulada'
import { useTrabajadorConEstado } from '../../../hooks/useTrabajadorConEstado'
import { toISODateString } from '../../../lib/dates'
import { useVigiaStore } from '../../../store/useVigiaStore'
import type { ArchivoSimulado, CertificacionConEstado } from '../../../types/domain'

function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function formatearDetalle(cert: CertificacionConEstado): string | undefined {
  if (cert.diasRestantes === undefined) return undefined
  return cert.estado === 'vencido' ? `hace ${Math.abs(cert.diasRestantes)} días` : `${cert.diasRestantes} días`
}

/** Detalle de trabajador (spec sección 10.2): certificaciones con estado y
 * días restantes, acción "Renovar" por certificación. Si el trabajador
 * estaba No apto y se renueva el requisito de ingreso causante, pasa a
 * "apto" en vivo (gratis: `useTrabajadorConEstado` recalcula con `useMemo`
 * en cada cambio de `trabajadores`). */
export default function TrabajadorDetallePage() {
  const { id } = useParams<{ id: string }>()
  const detalle = useTrabajadorConEstado(id)
  const renovarCertificacion = useVigiaStore((state) => state.renovarCertificacion)

  const [certEnRenovacion, setCertEnRenovacion] = useState<CertificacionConEstado | null>(null)

  if (!detalle) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            title="Trabajador no encontrado"
            description="El trabajador que buscas no existe o fue eliminado."
            action={
              <Link to="/admin/trabajadores">
                <Button variant="outline">Volver a la lista</Button>
              </Link>
            }
          />
        </CardContent>
      </Card>
    )
  }

  const { trabajador, cargo, taladro, certsConEstado, metricas } = detalle
  const proximasAVencer = certsConEstado.filter((c) => c.estado === 'por_vencer' || c.estado === 'critico').length
  const vencidas = certsConEstado.filter((c) => c.estado === 'vencido').length

  function handleRenovar(certId: string, fechaInicioVigencia: string, archivo?: ArchivoSimulado) {
    renovarCertificacion(trabajador.id, certId, fechaInicioVigencia, archivo)
    setCertEnRenovacion(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/admin/trabajadores" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-ink-900">
        <IconArrowLeft className="h-4 w-4" />
        Volver a trabajadores
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display tracking-display-lg text-2xl font-bold text-ink-950">{trabajador.nombre}</h1>
            <Badge tone={trabajador.tipo === 'operativo' ? 'brand' : 'neutral'}>{trabajador.tipo === 'operativo' ? 'Operativo' : 'Administrativo'}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Documento {trabajador.documento}
            {trabajador.tipo === 'operativo' && ` · ${cargo?.nombre ?? 'Sin cargo'} · ${taladro?.nombre ?? 'Sin taladro'}`}
          </p>
        </div>
        {trabajador.tipo === 'operativo' && <NoAptoFlag noApto={metricas.noApto} variant="pill" />}
      </div>

      {trabajador.tipo === 'administrativo' ? (
        <Card>
          <CardContent>
            <EmptyState
              title="Sin catálogo de certificaciones"
              description="Los trabajadores administrativos no tienen certificaciones asociadas en este MVP."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <NoAptoFlag noApto={metricas.noApto} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard label="% cumplimiento" value={Math.round(metricas.porcentajeCumplimiento)} suffix="%" tone={metricas.noApto ? 'danger' : 'success'} />
            <KpiCard label="Requeridas" value={metricas.requeridas} />
            <KpiCard label="Cumplidas" value={metricas.cumplidas} tone="success" />
            <KpiCard label="Próx. a vencer" value={proximasAVencer} tone="warning" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Certificaciones</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {certsConEstado.length === 0 ? (
                <EmptyState title="Sin certificaciones requeridas" description="El cargo asignado no tiene certificaciones en el catálogo." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {certsConEstado.map((cert) => (
                    <li key={cert.certId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{cert.nombre}</p>
                        <p className="text-xs text-slate-500">{cert.tipo === 'ingreso' ? 'Ingreso' : 'Permanencia'} · vigencia {cert.vigenciaMeses} meses</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <EstadoBadge estado={cert.estado} detalle={formatearDetalle(cert)} variant="soft" />
                        <Button variant="outline" size="sm" onClick={() => setCertEnRenovacion(cert)}>
                          {cert.estado === 'faltante' ? 'Registrar' : 'Renovar'}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {vencidas > 0 && (
            <p className="text-xs font-medium text-estado-vencido">
              {vencidas} certificación{vencidas === 1 ? '' : 'es'} vencida{vencidas === 1 ? '' : 's'} sin actualizar.
            </p>
          )}
        </>
      )}

      <RenovarCertificacionModal cert={certEnRenovacion} onClose={() => setCertEnRenovacion(null)} onConfirmar={handleRenovar} />
    </div>
  )
}

interface RenovarCertificacionModalProps {
  cert: CertificacionConEstado | null
  onClose: () => void
  onConfirmar: (certId: string, fechaInicioVigencia: string, archivo?: ArchivoSimulado) => void
}

function RenovarCertificacionModal({ cert, onClose, onConfirmar }: RenovarCertificacionModalProps) {
  const hoySimulada = useHoySimulada()
  const [fecha, setFecha] = useState('')
  const [archivo, setArchivo] = useState<ArchivoSimulado | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  const certId = cert?.certId

  // Reinicia el formulario cada vez que se abre para una certificación
  // distinta (o se cierra), usando `certId` como dependencia.
  useEffect(() => {
    setFecha(toISODateString(hoySimulada))
    setArchivo(undefined)
    setError(null)
    // Deliberadamente NO depende de `hoySimulada`: solo debe resetear el
    // formulario al abrir/cambiar de certificación, no cada vez que se
    // mueve la fecha simulada mientras el modal está abierto (perdería lo
    // que el usuario ya escribió).
  }, [certId])

  if (!cert) return null

  function handleSubmit() {
    if (!cert) return
    if (!fecha) {
      setError('Selecciona la fecha de inicio de vigencia.')
      return
    }
    onConfirmar(cert.certId, fecha, archivo)
  }

  return (
    <Modal
      open={cert !== null}
      onClose={onClose}
      title={cert.estado === 'faltante' ? `Registrar certificado — ${cert.nombre}` : `Renovar — ${cert.nombre}`}
      description="Certificado simulado: no se sube ningún archivo real, solo se guarda el nombre."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Guardar</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <DatePicker label="Nueva fecha de inicio de vigencia" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <CertificadoAdjunto value={archivo} onChange={setArchivo} helperText="Opcional en este demo — simulado, no se sube nada real." />
        {error && <p className="text-sm font-medium text-estado-vencido">{error}</p>}
      </div>
    </Modal>
  )
}
