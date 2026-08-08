import { useMemo } from 'react'
import type { EstadoCert } from '../types/domain'
import { useTrabajadoresConEstado } from './useTrabajadoresConEstado'

export type EstadoAlerta = Extract<EstadoCert, 'por_vencer' | 'critico' | 'vencido'>

export interface Alerta {
  trabajadorId: string
  trabajadorNombre: string
  certId: string
  certNombre: string
  estado: EstadoAlerta
  diasRestantes?: number
}

const SEVERIDAD: Record<EstadoAlerta, number> = { vencido: 0, critico: 1, por_vencer: 2 }

/**
 * Alertas para el centro de notificaciones y el pop-up de alertas (spec
 * sección 8): certificaciones a 30 días (`por_vencer`), a 15 días
 * (`critico`) y vencidas. `faltante` NO entra acá (no tiene fecha de
 * vencimiento sobre la que alertar "días restantes"), aunque sí dispara
 * "No apto" en otras vistas.
 *
 * Ordenado por severidad (vencidas primero) y luego por días restantes
 * ascendentes, para que lo más urgente aparezca arriba.
 */
export function useNotificaciones(): Alerta[] {
  const items = useTrabajadoresConEstado()

  return useMemo(() => {
    const alertas: Alerta[] = []

    for (const { trabajador, certsConEstado } of items) {
      for (const cert of certsConEstado) {
        if (cert.estado === 'por_vencer' || cert.estado === 'critico' || cert.estado === 'vencido') {
          alertas.push({
            trabajadorId: trabajador.id,
            trabajadorNombre: trabajador.nombre,
            certId: cert.certId,
            certNombre: cert.nombre,
            estado: cert.estado,
            diasRestantes: cert.diasRestantes,
          })
        }
      }
    }

    return alertas.sort((a, b) => {
      const porSeveridad = SEVERIDAD[a.estado] - SEVERIDAD[b.estado]
      if (porSeveridad !== 0) return porSeveridad
      return (a.diasRestantes ?? 0) - (b.diasRestantes ?? 0)
    })
  }, [items])
}
