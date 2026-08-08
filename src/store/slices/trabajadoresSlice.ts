import type { StateCreator } from 'zustand'
import type { ArchivoSimulado, Trabajador } from '../../types/domain'
import type { VigiaStore } from '../useVigiaStore'

export interface TrabajadoresSlice {
  trabajadores: Trabajador[]

  agregarTrabajador: (trabajador: Trabajador) => void

  /**
   * Renueva una certificación de un trabajador: hace UPSERT por `certId`
   * (nunca duplica un CertTrabajador para la misma certificación). Si
   * `certId` ya estaba registrado, reemplaza su fechaInicioVigencia (y su
   * archivo, si se provee uno nuevo); si no existía, lo agrega. El estado
   * resultante (vigente/vencido/etc.) NO se guarda acá: se recalcula en vivo
   * en el próximo render con `lib/estado.ts`.
   */
  renovarCertificacion: (
    trabajadorId: string,
    certId: string,
    nuevaFechaInicio: string,
    archivo?: ArchivoSimulado,
  ) => void
}

export const createTrabajadoresSlice: StateCreator<VigiaStore, [], [], TrabajadoresSlice> = (
  set,
) => ({
  trabajadores: [],

  agregarTrabajador: (trabajador) =>
    set((state) => ({ trabajadores: [...state.trabajadores, trabajador] })),

  renovarCertificacion: (trabajadorId, certId, nuevaFechaInicio, archivo) =>
    set((state) => ({
      trabajadores: state.trabajadores.map((trabajador) => {
        if (trabajador.id !== trabajadorId) return trabajador

        const yaRegistrada = trabajador.certificaciones.some((cert) => cert.certId === certId)

        const certificaciones = yaRegistrada
          ? trabajador.certificaciones.map((cert) =>
              cert.certId === certId
                ? {
                    ...cert,
                    fechaInicioVigencia: nuevaFechaInicio,
                    archivo: archivo ?? cert.archivo,
                  }
                : cert,
            )
          : [
              ...trabajador.certificaciones,
              { certId, fechaInicioVigencia: nuevaFechaInicio, archivo },
            ]

        return { ...trabajador, certificaciones }
      }),
    })),
})
