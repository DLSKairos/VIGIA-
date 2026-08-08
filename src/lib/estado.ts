import type { Cargo, Certificacion, CertificacionConEstado, EstadoCert, Trabajador } from '../types/domain'
import { UMBRAL_CRITICO_DIAS, UMBRAL_POR_VENCER_DIAS, UMBRAL_VENCIDO_DIAS } from './constants'
import { calcularDiasRestantes, calcularFechaVencimiento, parseFechaISO } from './dates'

/**
 * Clasifica un estado a partir de los días restantes (spec sección 7,
 * límites inclusivos hacia abajo):
 *   > 30        -> vigente
 *   15 < d <= 30 -> por_vencer
 *   0  < d <= 15 -> critico
 *   d <= 0       -> vencido
 *
 * No maneja 'faltante': ese estado no depende de días, se asigna aparte
 * cuando no existe un CertTrabajador para una certificación requerida.
 */
export function calcularEstadoPorDias(diasRestantes: number): EstadoCert {
  if (diasRestantes > UMBRAL_POR_VENCER_DIAS) return 'vigente'
  if (diasRestantes > UMBRAL_CRITICO_DIAS) return 'por_vencer'
  if (diasRestantes > UMBRAL_VENCIDO_DIAS) return 'critico'
  return 'vencido'
}

/**
 * Calcula el estado de CADA certificación que el CARGO del trabajador exige
 * (no solo las que el trabajador ya tiene registradas). Esto es lo que
 * permite detectar 'faltante': si una certificación requerida no tiene
 * CertTrabajador asociado, se reporta con estado 'faltante' y
 * diasRestantes/fechas undefined.
 *
 * - Administrativo -> [] (sin catálogo de certificaciones en el MVP).
 * - Operativo sin cargo asignado (dato inconsistente) -> [].
 * - Si una certId requerida por el cargo ya no existe en el catálogo
 *   (por ejemplo, se borró desde Parametrización) se ignora de forma
 *   defensiva en vez de romper el cálculo.
 */
export function getCertificacionesEstadoTrabajador(
  trabajador: Trabajador,
  catalogoCerts: Certificacion[],
  cargo: Cargo | undefined,
  hoySimulada: Date,
): CertificacionConEstado[] {
  if (trabajador.tipo === 'administrativo') return []
  if (!cargo) return []

  return cargo.certificacionesRequeridas.flatMap((certId): CertificacionConEstado[] => {
    const certificacion = catalogoCerts.find((c) => c.id === certId)
    if (!certificacion) return []

    const registro = trabajador.certificaciones.find((c) => c.certId === certId)

    if (!registro) {
      return [
        {
          certId: certificacion.id,
          nombre: certificacion.nombre,
          tipo: certificacion.tipo,
          vigenciaMeses: certificacion.vigenciaMeses,
          estado: 'faltante',
          fechaInicioVigencia: undefined,
          fechaVencimiento: undefined,
          diasRestantes: undefined,
        },
      ]
    }

    const fechaInicioVigencia = parseFechaISO(registro.fechaInicioVigencia)
    const fechaVencimiento = calcularFechaVencimiento(fechaInicioVigencia, certificacion.vigenciaMeses)
    const diasRestantes = calcularDiasRestantes(fechaVencimiento, hoySimulada)
    const estado = calcularEstadoPorDias(diasRestantes)

    return [
      {
        certId: certificacion.id,
        nombre: certificacion.nombre,
        tipo: certificacion.tipo,
        vigenciaMeses: certificacion.vigenciaMeses,
        fechaInicioVigencia,
        fechaVencimiento,
        diasRestantes,
        estado,
        archivo: registro.archivo,
      },
    ]
  })
}
