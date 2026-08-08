import { describe, expect, it } from 'vitest'
import type { Cargo, Certificacion, Trabajador } from '../../types/domain'
import { calcularEstadoPorDias, getCertificacionesEstadoTrabajador } from '../estado'
import { toISODateString } from '../dates'

describe('calcularEstadoPorDias — casos límite exactos (spec sección 7)', () => {
  it.each([
    [31, 'vigente'],
    [30, 'por_vencer'],
    [16, 'por_vencer'],
    [15, 'critico'],
    [1, 'critico'],
    [0, 'vencido'],
    [-5, 'vencido'],
  ] as const)('diasRestantes=%i -> %s', (dias, esperado) => {
    expect(calcularEstadoPorDias(dias)).toBe(esperado)
  })
})

describe('getCertificacionesEstadoTrabajador', () => {
  const c1: Certificacion = { id: 'c1', nombre: 'Alturas', tipo: 'ingreso', vigenciaMeses: 18 }
  const c5: Certificacion = { id: 'c5', nombre: 'Brigadas', tipo: 'permanencia', vigenciaMeses: 12 }
  const catalogo: Certificacion[] = [c1, c5]
  const cargo: Cargo = { id: 'g1', nombre: 'Soldador', certificacionesRequeridas: ['c1', 'c5'] }
  const hoy = new Date(2026, 7, 7)

  it('devuelve [] para administrativos', () => {
    const trabajador: Trabajador = {
      id: 't1',
      nombre: 'Laura',
      documento: '111',
      tipo: 'administrativo',
      certificaciones: [],
    }
    expect(getCertificacionesEstadoTrabajador(trabajador, catalogo, undefined, hoy)).toEqual([])
  })

  it('devuelve [] si es operativo pero no tiene cargo asignado (dato inconsistente)', () => {
    const trabajador: Trabajador = {
      id: 't2',
      nombre: 'X',
      documento: '222',
      tipo: 'operativo',
      certificaciones: [],
    }
    expect(getCertificacionesEstadoTrabajador(trabajador, catalogo, undefined, hoy)).toEqual([])
  })

  it('marca como faltante una certificación requerida sin CertTrabajador registrado', () => {
    const trabajador: Trabajador = {
      id: 't3',
      nombre: 'Diego',
      documento: '333',
      tipo: 'operativo',
      cargoId: 'g1',
      taladroId: 'r1',
      certificaciones: [
        { certId: 'c5', fechaInicioVigencia: toISODateString(new Date(2026, 0, 1)) },
      ],
    }
    const resultado = getCertificacionesEstadoTrabajador(trabajador, catalogo, cargo, hoy)
    const c1Estado = resultado.find((r) => r.certId === 'c1')
    expect(c1Estado?.estado).toBe('faltante')
    expect(c1Estado?.diasRestantes).toBeUndefined()
    expect(c1Estado?.fechaVencimiento).toBeUndefined()
  })

  it('calcula el estado a partir de fechaInicioVigencia + vigenciaMeses cuando SÍ hay registro', () => {
    // c1 vence en 18 meses; con inicio hace 17 meses y 20 días quedan pocos días -> critico/por_vencer
    const inicioHace17Meses = new Date(2025, 2, 18) // aprox
    const trabajador: Trabajador = {
      id: 't4',
      nombre: 'Julián',
      documento: '444',
      tipo: 'operativo',
      cargoId: 'g1',
      taladroId: 'r2',
      certificaciones: [
        { certId: 'c1', fechaInicioVigencia: toISODateString(inicioHace17Meses) },
        { certId: 'c5', fechaInicioVigencia: toISODateString(new Date(2026, 0, 1)) },
      ],
    }
    const resultado = getCertificacionesEstadoTrabajador(trabajador, catalogo, cargo, hoy)
    expect(resultado).toHaveLength(2)
    const c1Estado = resultado.find((r) => r.certId === 'c1')
    expect(c1Estado?.estado).not.toBe('faltante')
    expect(c1Estado?.diasRestantes).toBeTypeOf('number')
  })

  it('ignora de forma defensiva una certId requerida que ya no existe en el catálogo', () => {
    const cargoConCertFantasma: Cargo = {
      id: 'g9',
      nombre: 'Fantasma',
      certificacionesRequeridas: ['c1', 'c-no-existe'],
    }
    const trabajador: Trabajador = {
      id: 't5',
      nombre: 'X',
      documento: '555',
      tipo: 'operativo',
      cargoId: 'g9',
      taladroId: 'r1',
      certificaciones: [],
    }
    const resultado = getCertificacionesEstadoTrabajador(
      trabajador,
      catalogo,
      cargoConCertFantasma,
      hoy,
    )
    expect(resultado).toHaveLength(1)
    expect(resultado[0]?.certId).toBe('c1')
  })
})
