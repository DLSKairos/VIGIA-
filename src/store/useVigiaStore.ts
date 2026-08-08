import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildInitialState } from '../data/seed'
import { createAuthSlice, type AuthSlice } from './slices/authSlice'
import { createCatalogSlice, type CatalogSlice } from './slices/catalogSlice'
import { createDemoSlice, type DemoSlice } from './slices/demoSlice'
import { createTrabajadoresSlice, type TrabajadoresSlice } from './slices/trabajadoresSlice'
import { createUiSlice, type UiSlice } from './slices/uiSlice'

/**
 * VIGÍA — store global (Zustand + `persist` sobre localStorage).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * REGLA ARQUITECTÓNICA (léela antes de tocar cualquier slice o agregar uno
 * nuevo en fases siguientes):
 *
 *   Ningún slice guarda `estado` (EstadoCert) ni `diasRestantes`.
 *
 * Esos valores SIEMPRE se derivan en tiempo real con las funciones puras de
 * `src/lib/` (estado.ts, dates.ts, noApto.ts, metrics.ts) a partir de:
 *
 *   hoySimulada + catálogo (cargos/certificaciones) + trabajadores[].certificaciones
 *
 * Gracias a esto, mover la fecha simulada (barra de demo) o editar un cargo
 * / certificación en Parametrización recalcula EN VIVO a todos los
 * trabajadores existentes, sin tener que buscar y migrar valores ya
 * guardados. Si en una fase futura sientes la tentación de cachear un
 * "estado" en el store para "optimizar", NO lo hagas: rompe justamente la
 * garantía que hace funcionar la demo (sección 15 del spec: mover el tiempo
 * y ver todo recalcularse en vivo).
 *
 * Por qué Zustand + persist (y no Context API): `hoySimulada` cambia con
 * frecuencia durante la demo y dispara recálculo transversal (dashboard,
 * notificaciones, badges, bandera "No apto"). Con selectores de Zustand
 * cada componente solo re-renderiza si el slice que le importa cambia
 * (en vez de que todo el árbol re-renderice como pasaría con un solo
 * Context). `persist` cubre el requisito del spec de que los cambios del
 * demo sobrevivan a un refresh (sección 3).
 * ─────────────────────────────────────────────────────────────────────────
 */
export type VigiaStore = CatalogSlice & TrabajadoresSlice & DemoSlice & AuthSlice & UiSlice

// Se calcula una sola vez, al cargar el módulo, para que el seed de
// trabajadores y `hoySimulada` queden sincronizados al mismo instante.
const ahora = new Date()
const seedInicial = buildInitialState(ahora)

export const useVigiaStore = create<VigiaStore>()(
  persist(
    (...a) => ({
      ...createCatalogSlice(...a),
      ...createTrabajadoresSlice(...a),
      ...createDemoSlice(...a),
      ...createAuthSlice(...a),
      ...createUiSlice(...a),
      // Sobrescribe los valores por defecto ([]) de cada slice con el seed
      // inicial (spec sección 14). Si ya hay datos en localStorage, `persist`
      // los reemplaza sobre esto al rehidratar (ver `partialize` abajo).
      cargos: seedInicial.cargos,
      certificaciones: seedInicial.certificaciones,
      taladros: seedInicial.taladros,
      trabajadores: seedInicial.trabajadores,
      hoySimulada: ahora.toISOString(),
    }),
    {
      name: 'vigia-storage',
      version: 1,
      // No persistimos el `preview` (base64) de los archivos simulados para
      // no inflar localStorage: solo el nombre del archivo sobrevive a un
      // refresh. Tampoco persistimos flags de UI de sesión (notifPanelOpen,
      // popupAlertasDescartado): esos vuelven a su valor por defecto en cada
      // carga de la app.
      partialize: (state) => ({
        cargos: state.cargos,
        certificaciones: state.certificaciones,
        taladros: state.taladros,
        trabajadores: state.trabajadores.map((trabajador) => ({
          ...trabajador,
          certificaciones: trabajador.certificaciones.map((cert) => ({
            ...cert,
            archivo: cert.archivo ? { nombre: cert.archivo.nombre } : undefined,
          })),
        })),
        hoySimulada: state.hoySimulada,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
