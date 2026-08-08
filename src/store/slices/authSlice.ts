import type { StateCreator } from 'zustand'
import type { VigiaStore } from '../useVigiaStore'

// Admin hardcodeado (spec sección 5.5). Se muestra como pista en el login
// a propósito: es un demo comercial y quien lo presenta no es el
// desarrollador, no hay intención de que sea un secreto real.
const ADMIN_EMAIL = 'admin@vigia.co'
const ADMIN_PASSWORD = 'Vigia2026'

export interface AuthSlice {
  isAuthenticated: boolean
  /** Compara contra el admin hardcodeado. Devuelve true/false para que la
   * pantalla de login pueda mostrar un error si falla. */
  login: (email: string, password: string) => boolean
  logout: () => void
}

export const createAuthSlice: StateCreator<VigiaStore, [], [], AuthSlice> = (set) => ({
  isAuthenticated: false,

  login: (email, password) => {
    const credencialesValidas = email === ADMIN_EMAIL && password === ADMIN_PASSWORD
    if (credencialesValidas) set({ isAuthenticated: true })
    return credencialesValidas
  },

  logout: () => set({ isAuthenticated: false }),
})
