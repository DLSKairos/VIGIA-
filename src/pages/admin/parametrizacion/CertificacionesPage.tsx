import { type FormEvent, useState } from 'react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Select } from '../../../components/ui/Select'
import { TBody, TD, TH, THead, TR, Table, TableContainer } from '../../../components/ui/Table'
import { EmptyState } from '../../../components/ui/EmptyState'
import type { Certificacion, TipoCertificacion } from '../../../types/domain'
import { useVigiaStore } from '../../../store/useVigiaStore'

const TIPO_OPTIONS: { value: TipoCertificacion; label: string }[] = [
  { value: 'ingreso', label: 'Ingreso (bloquea si falta/vence)' },
  { value: 'permanencia', label: 'Permanencia (solo alerta)' },
]

interface FormState {
  nombre: string
  tipo: TipoCertificacion
  vigenciaMeses: string
}

const FORM_VACIO: FormState = { nombre: '', tipo: 'ingreso', vigenciaMeses: '12' }

function IconPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Parametrización > Certificaciones (catálogo, spec sección 10.2): nombre,
 * tipo (ingreso/permanencia), vigencia en meses. CRUD simple sobre `catalogSlice`. */
export default function CertificacionesPage() {
  const certificaciones = useVigiaStore((state) => state.certificaciones)
  const cargos = useVigiaStore((state) => state.cargos)
  const agregarCertificacion = useVigiaStore((state) => state.agregarCertificacion)
  const actualizarCertificacion = useVigiaStore((state) => state.actualizarCertificacion)
  const eliminarCertificacion = useVigiaStore((state) => state.eliminarCertificacion)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(FORM_VACIO)
  const [error, setError] = useState<string | null>(null)
  const [borrarObjetivo, setBorrarObjetivo] = useState<Certificacion | null>(null)

  function abrirNueva() {
    setEditingId(null)
    setForm(FORM_VACIO)
    setError(null)
    setModalOpen(true)
  }

  function abrirEditar(cert: Certificacion) {
    setEditingId(cert.id)
    setForm({ nombre: cert.nombre, tipo: cert.tipo, vigenciaMeses: String(cert.vigenciaMeses) })
    setError(null)
    setModalOpen(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nombre = form.nombre.trim()
    const vigenciaMeses = Number(form.vigenciaMeses)

    if (!nombre) {
      setError('El nombre es obligatorio.')
      return
    }
    if (!Number.isFinite(vigenciaMeses) || vigenciaMeses <= 0) {
      setError('La vigencia debe ser un número de meses mayor a 0.')
      return
    }

    if (editingId) {
      actualizarCertificacion(editingId, { nombre, tipo: form.tipo, vigenciaMeses })
    } else {
      agregarCertificacion({ id: crypto.randomUUID(), nombre, tipo: form.tipo, vigenciaMeses })
    }
    setModalOpen(false)
  }

  function cargosQueLaUsan(certId: string) {
    return cargos.filter((cargo) => cargo.certificacionesRequeridas.includes(certId))
  }

  function confirmarBorrado() {
    if (!borrarObjetivo) return
    eliminarCertificacion(borrarObjetivo.id)
    setBorrarObjetivo(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display tracking-display-lg text-2xl font-bold text-ink-950">Certificaciones</h1>
          <p className="mt-1 text-sm text-slate-500">Catálogo parametrizable: nombre, tipo y vigencia en meses.</p>
        </div>
        <Button iconLeft={<IconPlus className="h-4 w-4" />} onClick={abrirNueva}>
          Nueva certificación
        </Button>
      </div>

      {certificaciones.length === 0 ? (
        <EmptyState title="Sin certificaciones en el catálogo" description="Crea la primera certificación para poder asignarla a un cargo." />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Nombre</TH>
                <TH>Tipo</TH>
                <TH>Vigencia</TH>
                <TH>Usada por</TH>
                <TH className="text-right">Acciones</TH>
              </TR>
            </THead>
            <TBody>
              {certificaciones.map((cert) => {
                const usadaPor = cargosQueLaUsan(cert.id)
                return (
                  <TR key={cert.id}>
                    <TD className="font-medium text-ink-900">{cert.nombre}</TD>
                    <TD>
                      <Badge tone={cert.tipo === 'ingreso' ? 'danger' : 'info'}>{cert.tipo === 'ingreso' ? 'Ingreso' : 'Permanencia'}</Badge>
                    </TD>
                    <TD className="font-mono">{cert.vigenciaMeses} meses</TD>
                    <TD className="text-slate-500">{usadaPor.length > 0 ? usadaPor.map((c) => c.nombre).join(', ') : '—'}</TD>
                    <TD>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => abrirEditar(cert)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="text-estado-vencido hover:bg-estado-vencido-soft-bg" onClick={() => setBorrarObjetivo(cert)}>
                          Eliminar
                        </Button>
                      </div>
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        </TableContainer>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar certificación' : 'Nueva certificación'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="form-certificacion">
              Guardar
            </Button>
          </>
        }
      >
        <form id="form-certificacion" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Nombre"
            required
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder="Ej. Alturas trabajador autorizado"
          />
          <Select
            label="Tipo"
            required
            options={TIPO_OPTIONS}
            value={form.tipo}
            onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoCertificacion }))}
          />
          <Input
            label="Vigencia (meses)"
            type="number"
            min={1}
            required
            value={form.vigenciaMeses}
            onChange={(e) => setForm((f) => ({ ...f, vigenciaMeses: e.target.value }))}
          />
          {error && <p className="text-sm font-medium text-estado-vencido">{error}</p>}
        </form>
      </Modal>

      <Modal
        open={borrarObjetivo !== null}
        onClose={() => setBorrarObjetivo(null)}
        title="¿Eliminar certificación?"
        size="sm"
        description={
          borrarObjetivo && cargosQueLaUsan(borrarObjetivo.id).length > 0
            ? `${cargosQueLaUsan(borrarObjetivo.id).length} cargo(s) la exigen actualmente: ${cargosQueLaUsan(borrarObjetivo.id)
                .map((c) => c.nombre)
                .join(', ')}. Dejarán de requerirla.`
            : undefined
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setBorrarObjetivo(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarBorrado}>
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Se eliminará <strong>{borrarObjetivo?.nombre}</strong> del catálogo. Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  )
}
