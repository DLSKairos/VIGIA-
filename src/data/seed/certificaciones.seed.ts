import type { Certificacion } from '../../types/domain'

/** Catálogo de certificaciones (spec VIGIA.md, sección 5.1). */
export const certificacionesSeed: Certificacion[] = [
  { id: 'c1', nombre: 'Alturas trabajador autorizado', tipo: 'ingreso', vigenciaMeses: 18 },
  { id: 'c2', nombre: 'Espacios confinados entrante', tipo: 'ingreso', vigenciaMeses: 36 },
  {
    id: 'c3',
    nombre: 'Espacios confinados nivel supervisor',
    tipo: 'ingreso',
    vigenciaMeses: 36,
  },
  { id: 'c4', nombre: 'Well control combinado', tipo: 'ingreso', vigenciaMeses: 24 },
  { id: 'c5', nombre: 'Brigadas integrales', tipo: 'permanencia', vigenciaMeses: 12 },
  {
    id: 'c6',
    nombre: 'Certificación de winches y manrider',
    tipo: 'permanencia',
    vigenciaMeses: 12,
  },
]
