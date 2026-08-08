import { addDays, subMonths } from 'date-fns'
import type { CertTrabajador, Trabajador } from '../../types/domain'
import { toISODateString } from '../../lib/dates'

/**
 * Dada una `hoySimulada` y la vigencia (meses) de una certificación, calcula
 * la `fechaInicioVigencia` necesaria para que, calculada HOY, esa
 * certificación tenga exactamente `diasRestantesObjetivo` días restantes.
 *
 * fechaVencimientoObjetivo = hoySimulada + diasRestantesObjetivo
 * fechaInicioVigencia = fechaVencimientoObjetivo - vigenciaMeses
 */
function fechaInicioParaDiasRestantes(
  hoySimulada: Date,
  vigenciaMeses: number,
  diasRestantesObjetivo: number,
): Date {
  const fechaVencimientoObjetivo = addDays(hoySimulada, diasRestantesObjetivo)
  return subMonths(fechaVencimientoObjetivo, vigenciaMeses)
}

function certRegistrada(certId: string, fechaInicioVigencia: Date, nombreArchivo: string): CertTrabajador {
  return {
    certId,
    fechaInicioVigencia: toISODateString(fechaInicioVigencia),
    archivo: { nombre: nombreArchivo },
  }
}

/**
 * Reproduce EXACTAMENTE la tabla de seed de la sección 14 del spec.
 * Cada `fechaInicioVigencia` se calcula relativa a `hoySimulada` (el momento
 * del seed), nunca hardcodeada en el pasado, para que el demo siempre
 * arranque con los estados objetivo sin importar cuándo se ejecute.
 */
export function buildSeedTrabajadores(hoySimulada: Date): Trabajador[] {
  // "Vigente y holgada": certificado emitido hoy mismo. Con vigencias de
  // 12 a 36 meses, esto deja siempre muy por encima del umbral de 30 días.
  const emitidaHoy = hoySimulada

  const carlosMendoza: Trabajador = {
    id: 't1',
    nombre: 'Carlos Mendoza',
    documento: '1001234561',
    tipo: 'operativo',
    cargoId: 'g1', // Soldador
    taladroId: 'rig-2501',
    certificaciones: [
      certRegistrada('c1', emitidaHoy, 'alturas_carlos.pdf'),
      certRegistrada('c2', emitidaHoy, 'espacios_confinados_carlos.pdf'),
      certRegistrada('c5', emitidaHoy, 'brigadas_carlos.pdf'),
    ],
  }

  const andresGaviria: Trabajador = {
    id: 't2',
    nombre: 'Andrés Gaviria',
    documento: '1001234562',
    tipo: 'operativo',
    cargoId: 'g2', // Jefe de equipo
    taladroId: 'rig-2501',
    certificaciones: [
      certRegistrada('c1', emitidaHoy, 'alturas_andres.pdf'),
      certRegistrada('c3', emitidaHoy, 'espacios_supervisor_andres.pdf'),
      certRegistrada('c4', emitidaHoy, 'well_control_andres.pdf'),
      // Brigadas: por_vencer, ~25 días restantes
      certRegistrada(
        'c5',
        fechaInicioParaDiasRestantes(hoySimulada, 12, 25),
        'brigadas_andres.pdf',
      ),
      certRegistrada('c6', emitidaHoy, 'winches_andres.pdf'),
    ],
  }

  const julianTorres: Trabajador = {
    id: 't3',
    nombre: 'Julián Torres',
    documento: '1001234563',
    tipo: 'operativo',
    cargoId: 'g1', // Soldador
    taladroId: 'rig-3001',
    certificaciones: [
      // Alturas: crítico, ~10 días restantes
      certRegistrada(
        'c1',
        fechaInicioParaDiasRestantes(hoySimulada, 18, 10),
        'alturas_julian.pdf',
      ),
      certRegistrada('c2', emitidaHoy, 'espacios_confinados_julian.pdf'),
      certRegistrada('c5', emitidaHoy, 'brigadas_julian.pdf'),
    ],
  }

  const oscarRamirez: Trabajador = {
    id: 't4',
    nombre: 'Óscar Ramírez',
    documento: '1001234564',
    tipo: 'operativo',
    cargoId: 'g2', // Jefe de equipo
    taladroId: 'rig-3001',
    certificaciones: [
      certRegistrada('c1', emitidaHoy, 'alturas_oscar.pdf'),
      certRegistrada('c3', emitidaHoy, 'espacios_supervisor_oscar.pdf'),
      // Well control: VENCIDA (ingreso), ~20 días en el pasado -> No apto
      certRegistrada(
        'c4',
        fechaInicioParaDiasRestantes(hoySimulada, 24, -20),
        'well_control_oscar.pdf',
      ),
      certRegistrada('c5', emitidaHoy, 'brigadas_oscar.pdf'),
      certRegistrada('c6', emitidaHoy, 'winches_oscar.pdf'),
    ],
  }

  const diegoCardenas: Trabajador = {
    id: 't5',
    nombre: 'Diego Cárdenas',
    documento: '1001234565',
    tipo: 'operativo',
    cargoId: 'g1', // Soldador
    taladroId: 'rig-3003',
    certificaciones: [
      certRegistrada('c1', emitidaHoy, 'alturas_diego.pdf'),
      // c2 (Espacios confinados entrante, ingreso) NO se registra a propósito
      // -> queda 'faltante' -> No apto
      certRegistrada('c5', emitidaHoy, 'brigadas_diego.pdf'),
    ],
  }

  const lauraRios: Trabajador = {
    id: 't6',
    nombre: 'Laura Ríos',
    documento: '1001234566',
    tipo: 'administrativo',
    certificaciones: [],
  }

  return [carlosMendoza, andresGaviria, julianTorres, oscarRamirez, diegoCardenas, lauraRios]
}
