import { useMemo } from 'react'
import { getCertificacionesEstadoTrabajador } from '../lib/estado'
import type { TrabajadorConCertsEstado } from '../lib/metrics'
import { useVigiaStore } from '../store/useVigiaStore'
import { useHoySimulada } from './useHoySimulada'

/**
 * Deriva, para CADA trabajador del store, sus certificaciones con estado ya
 * calculado (spec secciones 6-7). Punto de entrada compartido para dashboard
 * público, listas admin y notificaciones: todos leen de acá en vez de
 * duplicar el cálculo, así nunca se desincronizan entre sí ni con
 * `hoySimulada`.
 *
 * Recalcula en vivo cuando cambian trabajadores, catálogo (cargos/
 * certificaciones) u `hoySimulada` — esto es lo que hace que mover la fecha
 * en la barra de demo, editar un cargo, o registrar un trabajador nuevo se
 * reflejen al instante en el dashboard (spec sección 15).
 */
export function useTrabajadoresConEstado(): TrabajadorConCertsEstado[] {
  const trabajadores = useVigiaStore((state) => state.trabajadores)
  const cargos = useVigiaStore((state) => state.cargos)
  const certificaciones = useVigiaStore((state) => state.certificaciones)
  const hoySimulada = useHoySimulada()

  return useMemo(
    () =>
      trabajadores.map((trabajador) => ({
        trabajador,
        certsConEstado: getCertificacionesEstadoTrabajador(
          trabajador,
          certificaciones,
          cargos.find((cargo) => cargo.id === trabajador.cargoId),
          hoySimulada,
        ),
      })),
    [trabajadores, cargos, certificaciones, hoySimulada],
  )
}
