import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NoAptoFlag } from '../../../components/domain/NoAptoFlag'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Input } from '../../../components/ui/Input'
import { TBody, TD, TH, THead, TR, Table, TableContainer } from '../../../components/ui/Table'
import { useTrabajadoresConEstado } from '../../../hooks/useTrabajadoresConEstado'
import { calcularMetricasTrabajador } from '../../../lib/metrics'
import { useVigiaStore } from '../../../store/useVigiaStore'

type FiltroTipo = 'todos' | 'operativo' | 'administrativo' | 'no_apto'

const FILTROS: { value: FiltroTipo; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'operativo', label: 'Operativos' },
  { value: 'administrativo', label: 'Administrativos' },
  { value: 'no_apto', label: 'No aptos' },
]

function IconUserPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 19c.6-3.4 3-5.2 6-5.2s5.4 1.8 6 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 8v6M15 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/** Lista de trabajadores (spec sección 10.2): estado apto/No apto, %
 * cumplimiento, alertas, búsqueda y filtro básico. Acceso a registro y a
 * detalle de cada trabajador. */
export default function TrabajadoresListPage() {
  const items = useTrabajadoresConEstado()
  const cargos = useVigiaStore((state) => state.cargos)
  const taladros = useVigiaStore((state) => state.taladros)

  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<FiltroTipo>('todos')

  const filtrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase()

    return items
      .map((item) => ({ ...item, metricas: calcularMetricasTrabajador(item.trabajador, item.certsConEstado) }))
      .filter(({ trabajador, metricas }) => {
        if (filtro === 'operativo' && trabajador.tipo !== 'operativo') return false
        if (filtro === 'administrativo' && trabajador.tipo !== 'administrativo') return false
        if (filtro === 'no_apto' && !metricas.noApto) return false
        if (query && !trabajador.nombre.toLowerCase().includes(query) && !trabajador.documento.includes(query)) return false
        return true
      })
  }, [items, filtro, busqueda])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-950">Trabajadores</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} trabajador{items.length === 1 ? '' : 'es'} registrado{items.length === 1 ? '' : 's'}.
          </p>
        </div>
        <Link to="/admin/trabajadores/nuevo">
          <Button iconLeft={<IconUserPlus className="h-4 w-4" />}>Registrar trabajador</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          iconLeft={<IconSearch className="h-4 w-4" />}
          placeholder="Buscar por nombre o documento…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="sm:max-w-xs"
        />
        <div role="tablist" aria-label="Filtrar trabajadores" className="flex flex-wrap gap-1 rounded-vigia-md border border-slate-200 bg-white p-1">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filtro === f.value}
              onClick={() => setFiltro(f.value)}
              className={`h-9 cursor-pointer rounded-vigia-sm px-3 text-sm font-semibold transition-colors ${
                filtro === f.value ? 'bg-ink-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-ink-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="Ningún trabajador coincide con la búsqueda o el filtro seleccionado."
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Nombre</TH>
                <TH>Documento</TH>
                <TH>Tipo</TH>
                <TH>Cargo · Taladro</TH>
                <TH>% Cumplimiento</TH>
                <TH>Estado</TH>
                <TH className="text-right">Acciones</TH>
              </TR>
            </THead>
            <TBody>
              {filtrados.map(({ trabajador, metricas }) => {
                const cargo = cargos.find((c) => c.id === trabajador.cargoId)
                const taladro = taladros.find((t) => t.id === trabajador.taladroId)
                return (
                  <TR key={trabajador.id}>
                    <TD className="font-medium text-ink-900">{trabajador.nombre}</TD>
                    <TD className="font-mono text-slate-600">{trabajador.documento}</TD>
                    <TD>
                      <Badge tone={trabajador.tipo === 'operativo' ? 'brand' : 'neutral'}>
                        {trabajador.tipo === 'operativo' ? 'Operativo' : 'Administrativo'}
                      </Badge>
                    </TD>
                    <TD className="text-slate-600">{trabajador.tipo === 'operativo' ? `${cargo?.nombre ?? '—'} · ${taladro?.nombre ?? '—'}` : '—'}</TD>
                    <TD className="font-mono">{trabajador.tipo === 'operativo' ? `${Math.round(metricas.porcentajeCumplimiento)}%` : '—'}</TD>
                    <TD>{trabajador.tipo === 'operativo' ? <NoAptoFlag noApto={metricas.noApto} variant="pill" /> : <Badge tone="neutral">Sin certificaciones</Badge>}</TD>
                    <TD>
                      <div className="flex justify-end">
                        <Link to={`/admin/trabajadores/${trabajador.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver detalle
                          </Button>
                        </Link>
                      </div>
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        </TableContainer>
      )}
    </div>
  )
}
