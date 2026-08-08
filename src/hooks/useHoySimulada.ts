import { useMemo } from 'react'
import { useVigiaStore } from '../store/useVigiaStore'

/**
 * Devuelve `hoySimulada` (persistida en el store como ISO datetime string)
 * ya parseada a `Date`, memoizada para no crear una instancia nueva en cada
 * render — eso rompería la igualdad referencial de los `useMemo` de otros
 * hooks que dependen de ella (`useTrabajadoresConEstado`, etc.).
 */
export function useHoySimulada(): Date {
  const hoySimuladaISO = useVigiaStore((state) => state.hoySimulada)
  return useMemo(() => new Date(hoySimuladaISO), [hoySimuladaISO])
}
