import type { CertificacionConEstado, EstadoCert, Trabajador } from '../types/domain'
import { calcularNoApto } from './noApto'

/** Estados que SÍ cuentan como "cumplida" (spec sección 12). Una certificación
 * vencida o faltante NUNCA suma como cumplida, aunque exista el registro. */
const ESTADOS_CUMPLE: ReadonlySet<EstadoCert> = new Set(['vigente', 'por_vencer', 'critico'])

/** requeridas(trabajador) = nº de certificaciones que exige su cargo.
 * Administrativo = 0 (certsConEstado siempre viene [] para administrativos,
 * ver lib/estado.ts). */
export function contarRequeridas(certsConEstado: CertificacionConEstado[]): number {
  return certsConEstado.length
}

/** cumplidas(trabajador) = nº de requeridas registradas y vigentes/por_vencer/critico. */
export function contarCumplidas(certsConEstado: CertificacionConEstado[]): number {
  return certsConEstado.filter((cert) => ESTADOS_CUMPLE.has(cert.estado)).length
}

/** % cumplimiento = cumplidas / requeridas * 100. 0 si requeridas es 0
 * (evita división por cero, ej. administrativos). */
export function calcularPorcentajeCumplimiento(requeridas: number, cumplidas: number): number {
  if (requeridas === 0) return 0
  return (cumplidas / requeridas) * 100
}

export interface MetricasTrabajador {
  requeridas: number
  cumplidas: number
  porcentajeCumplimiento: number
  noApto: boolean
}

export function calcularMetricasTrabajador(
  trabajador: Trabajador,
  certsConEstado: CertificacionConEstado[],
): MetricasTrabajador {
  const requeridas = contarRequeridas(certsConEstado)
  const cumplidas = contarCumplidas(certsConEstado)

  return {
    requeridas,
    cumplidas,
    porcentajeCumplimiento: calcularPorcentajeCumplimiento(requeridas, cumplidas),
    noApto: calcularNoApto(certsConEstado, trabajador.tipo),
  }
}

export interface TrabajadorConCertsEstado {
  trabajador: Trabajador
  certsConEstado: CertificacionConEstado[]
}

export interface MetricasAgregadas {
  numTrabajadores: number
  /** Σ requeridas de todos los trabajadores del grupo (taladro o global). */
  requeridas: number
  /** Σ cumplidas de todos los trabajadores del grupo. */
  cumplidas: number
  /** Σcumplidas / Σrequeridas * 100 (spec sección 12: agregado, NO promedio de %). */
  porcentajeCumplimiento: number
  /** Trabajadores operativos con cumplidas === requeridas && requeridas > 0.
   * Los administrativos quedan excluidos naturalmente porque requeridas = 0. */
  personasCertificadas: number
  porcentajePersonasCertificadas: number
  /** Nº de trabajadores con bandera "No apto para taladro". */
  noAptos: number
  /** Nº de certificaciones (no trabajadores) en estado por_vencer o critico (<=30 días). */
  proximasAVencer: number
  /** Nº de certificaciones en estado vencido. */
  vencidas: number
  /** Distribución de TODAS las certificaciones requeridas por estado, para la dona. */
  distribucionEstados: Record<EstadoCert, number>
}

export function calcularMetricasAgregadas(items: TrabajadorConCertsEstado[]): MetricasAgregadas {
  const distribucionEstados: Record<EstadoCert, number> = {
    vigente: 0,
    por_vencer: 0,
    critico: 0,
    vencido: 0,
    faltante: 0,
  }

  let requeridas = 0
  let cumplidas = 0
  let personasCertificadas = 0
  let noAptos = 0

  for (const { trabajador, certsConEstado } of items) {
    const metricas = calcularMetricasTrabajador(trabajador, certsConEstado)

    requeridas += metricas.requeridas
    cumplidas += metricas.cumplidas
    if (metricas.requeridas > 0 && metricas.cumplidas === metricas.requeridas) {
      personasCertificadas += 1
    }
    if (metricas.noApto) noAptos += 1

    for (const cert of certsConEstado) {
      distribucionEstados[cert.estado] += 1
    }
  }

  return {
    numTrabajadores: items.length,
    requeridas,
    cumplidas,
    porcentajeCumplimiento: calcularPorcentajeCumplimiento(requeridas, cumplidas),
    personasCertificadas,
    porcentajePersonasCertificadas:
      items.length > 0 ? (personasCertificadas / items.length) * 100 : 0,
    noAptos,
    proximasAVencer: distribucionEstados.por_vencer + distribucionEstados.critico,
    vencidas: distribucionEstados.vencido,
    distribucionEstados,
  }
}
