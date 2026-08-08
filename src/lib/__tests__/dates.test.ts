import { describe, expect, it } from 'vitest'
import {
  calcularDiasRestantes,
  calcularFechaVencimiento,
  parseFechaISO,
  toISODateString,
} from '../dates'

describe('calcularFechaVencimiento', () => {
  it('suma los meses de vigencia a la fecha de inicio', () => {
    const inicio = new Date(2026, 0, 15) // 15 ene 2026 (mes 0-indexed)
    const vencimiento = calcularFechaVencimiento(inicio, 18)
    expect(vencimiento.getFullYear()).toBe(2027)
    expect(vencimiento.getMonth()).toBe(6) // julio (0-indexed)
    expect(vencimiento.getDate()).toBe(15)
  })

  it('funciona con vigencia de 12 meses (permanencia)', () => {
    const inicio = new Date(2026, 5, 1) // 1 jun 2026
    const vencimiento = calcularFechaVencimiento(inicio, 12)
    expect(vencimiento.getFullYear()).toBe(2027)
    expect(vencimiento.getMonth()).toBe(5)
    expect(vencimiento.getDate()).toBe(1)
  })
})

describe('calcularDiasRestantes', () => {
  it('cuenta días de calendario completos entre hoy y el vencimiento', () => {
    const hoy = new Date(2026, 7, 7) // 7 ago 2026
    const vencimiento = new Date(2026, 7, 17) // 17 ago 2026
    expect(calcularDiasRestantes(vencimiento, hoy)).toBe(10)
  })

  it('normaliza horas/minutos con startOfDay en ambos lados (no importa la hora del día)', () => {
    const hoyConHora = new Date(2026, 7, 7, 23, 59, 59) // 7 ago 2026, 23:59:59
    const vencimientoMedianoche = new Date(2026, 7, 8, 0, 0, 0) // 8 ago 2026, 00:00:00
    // Sin normalizar serían ~1 segundo de diferencia (0 días); con startOfDay
    // en ambos lados son días de calendario distintos -> 1 día.
    expect(calcularDiasRestantes(vencimientoMedianoche, hoyConHora)).toBe(1)
  })

  it('da 0 cuando el vencimiento es exactamente hoy', () => {
    const hoy = new Date(2026, 7, 7)
    const vencimiento = new Date(2026, 7, 7)
    expect(calcularDiasRestantes(vencimiento, hoy)).toBe(0)
  })

  it('da negativo cuando el vencimiento ya pasó', () => {
    const hoy = new Date(2026, 7, 20)
    const vencimiento = new Date(2026, 7, 7)
    expect(calcularDiasRestantes(vencimiento, hoy)).toBe(-13)
  })
})

describe('parseFechaISO / toISODateString', () => {
  it('parsea un string yyyy-MM-dd como medianoche LOCAL, no UTC', () => {
    const fecha = parseFechaISO('2026-08-07')
    expect(fecha.getFullYear()).toBe(2026)
    expect(fecha.getMonth()).toBe(7) // agosto
    expect(fecha.getDate()).toBe(7)
    expect(fecha.getHours()).toBe(0)
  })

  it('es inverso de toISODateString (round-trip)', () => {
    const original = new Date(2026, 7, 7)
    const iso = toISODateString(original)
    expect(iso).toBe('2026-08-07')
    const parsed = parseFechaISO(iso)
    expect(parsed.getFullYear()).toBe(original.getFullYear())
    expect(parsed.getMonth()).toBe(original.getMonth())
    expect(parsed.getDate()).toBe(original.getDate())
  })

  it('no produce off-by-one entre una fecha parseada y "hoy" real construido con new Date(y,m,d)', () => {
    // Simula: fechaVencimiento viene de un <input type="date"> guardado como
    // '2026-08-07', y hoySimulada es "ahora" construido a partir de
    // componentes locales (como hace demoSlice). Deben coincidir exactamente.
    const fechaVencimiento = parseFechaISO('2026-08-07')
    const hoySimulada = new Date(2026, 7, 7, 15, 30) // mismo día, hora arbitraria
    expect(calcularDiasRestantes(fechaVencimiento, hoySimulada)).toBe(0)
  })
})
