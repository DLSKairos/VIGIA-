import type { StateCreator } from 'zustand'
import type { Cargo, Certificacion, Taladro } from '../../types/domain'
import type { VigiaStore } from '../useVigiaStore'

/**
 * Catálogo parametrizable desde Admin > Parametrización: cargos,
 * certificaciones y taladros. CRUD simple, sin validaciones de negocio
 * complejas (eso lo resuelve la UI en fase 3, ej. no dejar id vacío).
 */
export interface CatalogSlice {
  cargos: Cargo[]
  certificaciones: Certificacion[]
  taladros: Taladro[]

  agregarCargo: (cargo: Cargo) => void
  actualizarCargo: (cargoId: string, cambios: Partial<Omit<Cargo, 'id'>>) => void
  eliminarCargo: (cargoId: string) => void

  agregarCertificacion: (certificacion: Certificacion) => void
  actualizarCertificacion: (certId: string, cambios: Partial<Omit<Certificacion, 'id'>>) => void
  eliminarCertificacion: (certId: string) => void

  agregarTaladro: (taladro: Taladro) => void
  actualizarTaladro: (taladroId: string, cambios: Partial<Omit<Taladro, 'id'>>) => void
  eliminarTaladro: (taladroId: string) => void
}

export const createCatalogSlice: StateCreator<VigiaStore, [], [], CatalogSlice> = (set) => ({
  cargos: [],
  certificaciones: [],
  taladros: [],

  agregarCargo: (cargo) => set((state) => ({ cargos: [...state.cargos, cargo] })),
  actualizarCargo: (cargoId, cambios) =>
    set((state) => ({
      cargos: state.cargos.map((cargo) => (cargo.id === cargoId ? { ...cargo, ...cambios } : cargo)),
    })),
  eliminarCargo: (cargoId) =>
    set((state) => ({ cargos: state.cargos.filter((cargo) => cargo.id !== cargoId) })),

  agregarCertificacion: (certificacion) =>
    set((state) => ({ certificaciones: [...state.certificaciones, certificacion] })),
  actualizarCertificacion: (certId, cambios) =>
    set((state) => ({
      certificaciones: state.certificaciones.map((cert) =>
        cert.id === certId ? { ...cert, ...cambios } : cert,
      ),
    })),
  eliminarCertificacion: (certId) =>
    set((state) => ({
      certificaciones: state.certificaciones.filter((cert) => cert.id !== certId),
    })),

  agregarTaladro: (taladro) => set((state) => ({ taladros: [...state.taladros, taladro] })),
  actualizarTaladro: (taladroId, cambios) =>
    set((state) => ({
      taladros: state.taladros.map((taladro) =>
        taladro.id === taladroId ? { ...taladro, ...cambios } : taladro,
      ),
    })),
  eliminarTaladro: (taladroId) =>
    set((state) => ({ taladros: state.taladros.filter((taladro) => taladro.id !== taladroId) })),
})
