import type { Cargo } from '../../types/domain'

/** Catálogo de cargos (spec VIGIA.md, sección 5.2). */
export const cargosSeed: Cargo[] = [
  { id: 'g1', nombre: 'Soldador', certificacionesRequeridas: ['c1', 'c2', 'c5'] },
  {
    id: 'g2',
    nombre: 'Jefe de equipo',
    certificacionesRequeridas: ['c1', 'c4', 'c3', 'c5', 'c6'],
  },
]
