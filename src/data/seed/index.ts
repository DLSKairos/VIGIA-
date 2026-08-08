import type { Cargo, Certificacion, Taladro, Trabajador } from '../../types/domain'
import { cargosSeed } from './cargos.seed'
import { certificacionesSeed } from './certificaciones.seed'
import { taladrosSeed } from './taladros.seed'
import { buildSeedTrabajadores } from './trabajadores.seed'

export interface InitialState {
  certificaciones: Certificacion[]
  cargos: Cargo[]
  taladros: Taladro[]
  trabajadores: Trabajador[]
}

/**
 * Combina catálogo (certificaciones, cargos, taladros) + los 6 trabajadores
 * de seed (sección 14 del spec), calculados en relación a `hoySimulada`.
 * Se usa tanto en el estado inicial del store como en "Restablecer demo".
 */
export function buildInitialState(hoySimulada: Date = new Date()): InitialState {
  return {
    certificaciones: certificacionesSeed,
    cargos: cargosSeed,
    taladros: taladrosSeed,
    trabajadores: buildSeedTrabajadores(hoySimulada),
  }
}
