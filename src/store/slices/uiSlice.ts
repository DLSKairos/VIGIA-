import type { StateCreator } from 'zustand'
import type { VigiaStore } from '../useVigiaStore'

/** Flags de UI efímeros (no representan datos de negocio ni deben persistir
 * entre sesiones distintas, ver partialize en useVigiaStore.ts). */
export interface UiSlice {
  /** El pop-up-resumen de alertas al iniciar sesión (spec sección 8) se
   * descarta con esto; se resetea a false en cada login nuevo. */
  popupAlertasDescartado: boolean
  notifPanelOpen: boolean

  descartarPopupAlertas: () => void
  reabrirPopupAlertas: () => void
  toggleNotifPanel: () => void
  setNotifPanelOpen: (open: boolean) => void
}

export const createUiSlice: StateCreator<VigiaStore, [], [], UiSlice> = (set) => ({
  popupAlertasDescartado: false,
  notifPanelOpen: false,

  descartarPopupAlertas: () => set({ popupAlertasDescartado: true }),
  reabrirPopupAlertas: () => set({ popupAlertasDescartado: false }),
  toggleNotifPanel: () => set((state) => ({ notifPanelOpen: !state.notifPanelOpen })),
  setNotifPanelOpen: (open) => set({ notifPanelOpen: open }),
})
