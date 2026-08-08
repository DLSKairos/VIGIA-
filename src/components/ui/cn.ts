/**
 * Concatena clases condicionales, ignorando valores falsy. Utilidad mínima
 * (equivalente a `clsx`) para no añadir una dependencia externa solo para
 * esto. Vive en `components/ui` (no en `src/lib`) a propósito: `src/lib` es
 * territorio de la lógica de dominio de Fase 1 (fechas/estado/no-apto/
 * métricas, con sus tests) y esta fase de UI no debe tocarlo.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
