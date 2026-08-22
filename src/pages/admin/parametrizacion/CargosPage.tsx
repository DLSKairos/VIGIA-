import { type FormEvent, useState } from 'react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { TBody, TD, TH, THead, TR, Table, TableContainer } from '../../../components/ui/Table'
import type { Cargo } from '../../../types/domain'
import { useVigiaStore } from '../../../store/useVigiaStore'

interface FormState {
  nombre: string
  certificacionesRequeridas: string[]
}

const FORM_VACIO: FormState = { nombre: '', certificacionesRequeridas: [] }

function IconPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Parametrización > Cargos (spec sección 10.2): ver/crear/editar, asignar
 * certificaciones requeridas (selección múltiple). CRUD simple sobre `catalogSlice`. */
export default function CargosPage() {
  const cargos = useVigiaStore((state) => state.cargos)
  const certificaciones = useVigiaStore((state) => state.certificaciones)
  const trabajadores = useVigiaStore((state) => state.trabajadores)
  const agregarCargo = useVigiaStore((state) => state.agregarCargo)
  const actualizarCargo = useVigiaStore((state) => state.actualizarCargo)
  const eliminarCargo = useVigiaStore((state) => state.eliminarCargo)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(FORM_VACIO)
  const [error, setError] = useState<string | null>(null)
  const [borrarObjetivo, setBorrarObjetivo] = useState<Cargo | null>(null)

  function abrirNuevo() {
    setEditingId(null)
    setForm(FORM_VACIO)
    setError(null)
    setModalOpen(true)
  }

  function abrirEditar(cargo: Cargo) {
    setEditingId(cargo.id)
    setForm({ nombre: cargo.nombre, certificacionesRequeridas: cargo.certificacionesRequeridas })
    setError(null)
    setModalOpen(true)
  }

  function toggleCert(certId: string) {
    setForm((f) => ({
      ...f,
      certificacionesRequeridas: f.certificacionesRequeridas.includes(certId)
        ? f.certificacionesRequeridas.filter((id) => id !== certId)
        : [...f.certificacionesRequeridas, certId],
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nombre = form.nombre.trim()
    if (!nombre) {
      setError('El nombre es obligatorio.')
      return
    }

    if (editingId) {
      actualizarCargo(editingId, { nombre, certificacionesRequeridas: form.certificacionesRequeridas })
    } else {
      agregarCargo({ id: crypto.randomUUID(), nombre, certificacionesRequeridas: form.certificacionesRequeridas })
    }
    setModalOpen(false)
  }

  function trabajadoresConEsteCargo(cargoId: string) {
    return trabajadores.filter((t) => t.cargoId === cargoId)
  }

  function confirmarBorrado() {
    if (!borrarObjetivo) return
    eliminarCargo(borrarObjetivo.id)
    setBorrarObjetivo(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display tracking-display-lg text-2xl font-bold text-ink-950">Cargos</h1>
          <p className="mt-1 text-sm text-slate-500">Ver, crear y editar cargos operativos y sus certificaciones requeridas.</p>
        </div>
        <Button iconLeft={<IconPlus className="h-4 w-4" />} onClick={abrirNuevo}>
          Nuevo cargo
        </Button>
      </div>

      {cargos.length === 0 ? (
        <EmptyState title="Sin cargos en el catálogo" description="Crea el primer cargo para poder asignarlo a trabajadores operativos." />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Cargo</TH>
                <TH>Certificaciones requeridas</TH>
                <TH>Trabajadores</TH>
                <TH className="text-right">Acciones</TH>
              </TR>
            </THead>
            <TBody>
              {cargos.map((cargo) => (
                <TR key={cargo.id}>
                  <TD className="font-medium text-ink-900">{cargo.nombre}</TD>
                  <TD>
                    <div className="flex flex-wrap gap-1">
                      {cargo.certificacionesRequeridas.length === 0 ? (
                        <span className="text-slate-400">Ninguna</span>
                      ) : (
                        cargo.certificacionesRequeridas.map((certId) => {
                          const cert = certificaciones.find((c) => c.id === certId)
                          if (!cert) return null
                          return (
                            <Badge key={certId} tone={cert.tipo === 'ingreso' ? 'danger' : 'info'} size="sm">
                              {cert.nombre}
                            </Badge>
                          )
                        })
                      )}
                    </div>
                  </TD>
                  <TD className="font-mono">{trabajadoresConEsteCargo(cargo.id).length}</TD>
                  <TD>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => abrirEditar(cargo)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-estado-vencido hover:bg-estado-vencido-soft-bg" onClick={() => setBorrarObjetivo(cargo)}>
                        Eliminar
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar cargo' : 'Nuevo cargo'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="form-cargo">
              Guardar
            </Button>
          </>
        }
      >
        <form id="form-cargo" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Nombre del cargo"
            required
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder="Ej. Soldador"
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-800">Certificaciones requeridas</span>
            {certificaciones.length === 0 ? (
              <p className="text-sm text-slate-500">No hay certificaciones en el catálogo todavía.</p>
            ) : (
              <div className="flex flex-col gap-2 rounded-vigia-sm border border-slate-200 p-3">
                {certificaciones.map((cert) => (
                  <label key={cert.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-800">
                    <input
                      type="checkbox"
                      checked={form.certificacionesRequeridas.includes(cert.id)}
                      onChange={() => toggleCert(cert.id)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-600 focus:ring-brand-500/40"
                    />
                    {cert.nombre}
                    <Badge tone={cert.tipo === 'ingreso' ? 'danger' : 'info'} size="sm">
                      {cert.tipo === 'ingreso' ? 'Ingreso' : 'Permanencia'}
                    </Badge>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm font-medium text-estado-vencido">{error}</p>}
        </form>
      </Modal>

      <Modal
        open={borrarObjetivo !== null}
        onClose={() => setBorrarObjetivo(null)}
        title="¿Eliminar cargo?"
        size="sm"
        description={
          borrarObjetivo && trabajadoresConEsteCargo(borrarObjetivo.id).length > 0
            ? `${trabajadoresConEsteCargo(borrarObjetivo.id).length} trabajador(es) tienen este cargo asignado y quedarán sin certificaciones requeridas.`
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
