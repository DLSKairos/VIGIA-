import { addMonths, differenceInCalendarDays, formatISO, parseISO, startOfDay } from 'date-fns'

/**
 * Convierte una Date a string ISO 'yyyy-MM-dd', el formato usado para
 * persistir en el store y para el value de <input type="date">.
 */
export function toISODateString(fecha: Date): string {
  return formatISO(fecha, { representation: 'date' })
}

/**
 * Parsea un string 'yyyy-MM-dd' (de <input type="date"> o de localStorage) a
 * Date en hora LOCAL (medianoche local), no en UTC.
 *
 * OJO: `new Date('yyyy-MM-dd')` nativo de JS interpreta un string de solo
 * fecha como medianoche UTC. En zonas horarias con offset negativo (ej.
 * Colombia, UTC-5) eso se traduce a las 7pm del día ANTERIOR en hora local,
 * lo que produce un día MENOS al comparar contra `new Date()` (hora local
 * real) — el clásico bug de off-by-one. `parseISO` de date-fns sí interpreta
 * estos strings de solo-fecha en hora local, por eso se usa acá en vez de
 * `new Date(str)`.
 */
export function parseFechaISO(fechaISO: string): Date {
  return parseISO(fechaISO)
}

/**
 * fechaVencimiento = fechaInicioVigencia + vigenciaMeses (spec sección 5.4).
 */
export function calcularFechaVencimiento(fechaInicioVigencia: Date, vigenciaMeses: number): Date {
  return addMonths(fechaInicioVigencia, vigenciaMeses)
}

/**
 * diasRestantes = fechaVencimiento - hoySimulada, en días de calendario
 * completos (spec sección 6).
 *
 * Se aplica `startOfDay` a AMBOS lados antes de restar. Esto es necesario
 * porque `hoySimulada` puede venir de `new Date()` (hora real, con
 * horas/minutos/segundos distintos de cero) mientras que
 * `fechaVencimiento` viene de un `<input type="date">` (siempre medianoche
 * local). Sin normalizar ambos a medianoche, la resta de instantes podría
 * dar un día de diferencia según la hora del día en que se simule "hoy".
 */
export function calcularDiasRestantes(fechaVencimiento: Date, hoySimulada: Date): number {
  return differenceInCalendarDays(startOfDay(fechaVencimiento), startOfDay(hoySimulada))
}
