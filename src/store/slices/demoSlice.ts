import { addDays, addMonths } from 'date-fns'
import type { StateCreator } from 'zustand'
import { buildInitialState } from '../../data/seed'
import type { VigiaStore } from '../useVigiaStore'

/**
 * Barra de demo (spec sección 9): controla la "fecha de hoy simulada" que
 * usan TODOS los cálculos de vigencia/estado/notificaciones (sección 6).
 */
export interface DemoSlice {
  /** ISO datetime completo (`new Date().toISOString()`), NO 'yyyy-MM-dd'.
   * Al llevar hora/zona explícitas, se puede parsear de vuelta con
   * `new Date(hoySimulada)` sin el riesgo de off-by-one que sí existe con
   * fechas de solo-día (ver nota en lib/dates.ts). */
  hoySimulada: string

  /** Mueve la fecha simulada `cantidad` días o meses (acepta negativos). */
  moverFecha: (cantidad: number, unidad: 'dias' | 'meses') => void
  /** Fija la fecha simulada a un valor exacto (usado por el date picker). */
  setFechaSimulada: (fechaISO: string) => void
  /** Vuelve la fecha simulada a la fecha real del sistema (accesos rápidos: "Volver a hoy"). */
  volverAHoy: () => void
  /**
   * Re-siembra catálogo + trabajadores desde `buildInitialState` y resetea
   * `hoySimulada` a la fecha real del sistema. NO cierra sesión de admin
   * (no toca `isAuthenticated`): quien presenta la demo se queda logueado.
   */
  restablecerDemo: () => void
}

export const createDemoSlice: StateCreator<VigiaStore, [], [], DemoSlice> = (set, get) => ({
  hoySimulada: new Date().toISOString(),

  moverFecha: (cantidad, unidad) => {
    const actual = new Date(get().hoySimulada)
    const nueva = unidad === 'dias' ? addDays(actual, cantidad) : addMonths(actual, cantidad)
    set({ hoySimulada: nueva.toISOString() })
  },

  setFechaSimulada: (fechaISO) => set({ hoySimulada: fechaISO }),

  volverAHoy: () => set({ hoySimulada: new Date().toISOString() }),

  restablecerDemo: () => {
    const hoy = new Date()
    const inicial = buildInitialState(hoy)
    set({
      cargos: inicial.cargos,
      certificaciones: inicial.certificaciones,
      taladros: inicial.taladros,
      trabajadores: inicial.trabajadores,
      hoySimulada: hoy.toISOString(),
    })
  },
})
