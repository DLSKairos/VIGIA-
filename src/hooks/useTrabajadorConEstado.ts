import { useMemo } from 'react'
import { getCertificacionesEstadoTrabajador } from '../lib/estado'
import { calcularMetricasTrabajador } from '../lib/metrics'
import type { Cargo, CertificacionConEstado, Taladro, Trabajador } from '../types/domain'
import type { MetricasTrabajador } from '../lib/metrics'
import { useVigiaStore } from '../store/useVigiaStore'
import { useHoySimulada } from './useHoySimulada'

export interface TrabajadorConEstadoDetalle {
  trabajador: Trabajador
  cargo?: Cargo
  taladro?: Taladro
  certsConEstado: CertificacionConEstado[]
  metricas: MetricasTrabajador
}

/**
 * Igual que `useTrabajadoresConEstado`, pero resuelto para UN solo
 * trabajador por id (detalle de trabajador, drill-down del dashboard). Evita
 * recalcular el catálogo completo cuando solo se necesita un registro.
 * Devuelve `null` si el id no corresponde a ningún trabajador (ej. entró un
 * id inválido por URL).
 */
export function useTrabajadorConEstado(trabajadorId: string | undefined): TrabajadorConEstadoDetalle | null {
  const trabajadores = useVigiaStore((state) => state.trabajadores)
  const cargos = useVigiaStore((state) => state.cargos)
  const taladros = useVigiaStore((state) => state.taladros)
  const certificaciones = useVigiaStore((state) => state.certificaciones)
  const hoySimulada = useHoySimulada()

  return useMemo(() => {
    const trabajador = trabajadores.find((t) => t.id === trabajadorId)
    if (!trabajador) return null

    const cargo = cargos.find((c) => c.id === trabajador.cargoId)
    const taladro = taladros.find((t) => t.id === trabajador.taladroId)
    const certsConEstado = getCertificacionesEstadoTrabajador(trabajador, certificaciones, cargo, hoySimulada)
    const metricas = calcularMetricasTrabajador(trabajador, certsConEstado)

    return { trabajador, cargo, taladro, certsConEstado, metricas }
  }, [trabajadores, cargos, taladros, certificaciones, hoySimulada, trabajadorId])
}
