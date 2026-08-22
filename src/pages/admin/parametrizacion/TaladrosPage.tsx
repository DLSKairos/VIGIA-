import { type FormEvent, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { TBody, TD, TH, THead, TR, Table, TableContainer } from '../../../components/ui/Table'
import type { Taladro } from '../../../types/domain'
import { useVigiaStore } from '../../../store/useVigiaStore'

function IconPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Parametrización > Taladros (spec sección 10.2): lista con edición simple
 * del nombre y alta de nuevos taladros. Sin eliminar por defecto para no
 * dejar trabajadores huérfanos de `taladroId` — el MVP no lo exige. */
export default function TaladrosPage() {
  const taladros = useVigiaStore((state) => state.taladros)
  const trabajadores = useVigiaStore((state) => state.trabajadores)
  const agregarTaladro = useVigiaStore((state) => state.agregarTaladro)
  const actualizarTaladro = useVigiaStore((state) => state.actualizarTaladro)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState<string | null>(null)

  function abrirNuevo() {
    setEditingId(null)
    setNombre('')
    setError(null)
    setModalOpen(true)
  }

  function abrirEditar(taladro: Taladro) {
    setEditingId(taladro.id)
    setNombre(taladro.nombre)
    setError(null)
    setModalOpen(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nombreLimpio = nombre.trim()
    if (!nombreLimpio) {
      setError('El nombre es obligatorio.')
      return
    }

    if (editingId) {
      actualizarTaladro(editingId, { nombre: nombreLimpio })
    } else {
      agregarTaladro({ id: crypto.randomUUID(), nombre: nombreLimpio })
    }
    setModalOpen(false)
  }

  function contarTrabajadores(taladroId: string) {
    return trabajadores.filter((t) => t.taladroId === taladroId).length
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display tracking-display-lg text-2xl font-bold text-ink-950">Taladros</h1>
          <p className="mt-1 text-sm text-slate-500">Lista de taladros de la operación (edición simple del nombre).</p>
        </div>
        <Button iconLeft={<IconPlus className="h-4 w-4" />} onClick={abrirNuevo}>
          Nuevo taladro
        </Button>
      </div>

      {taladros.length === 0 ? (
        <EmptyState title="Sin taladros registrados" description="Crea el primer taladro para poder asignarlo a trabajadores operativos." />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Taladro</TH>
                <TH>Trabajadores asignados</TH>
                <TH className="text-right">Acciones</TH>
              </TR>
            </THead>
            <TBody>
              {taladros.map((taladro) => (
                <TR key={taladro.id}>
                  <TD className="font-medium text-ink-900">{taladro.nombre}</TD>
                  <TD className="font-mono">{contarTrabajadores(taladro.id)}</TD>
                  <TD>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => abrirEditar(taladro)}>
                        Editar
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
        title={editingId ? 'Editar taladro' : 'Nuevo taladro'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="form-taladro">
              Guardar
            </Button>
          </>
        }
      >
        <form id="form-taladro" onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input label="Nombre del taladro" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Rig 4001" />
          {error && <p className="text-sm font-medium text-estado-vencido">{error}</p>}
        </form>
      </Modal>
    </div>
  )
}
