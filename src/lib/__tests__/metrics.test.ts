import { describe, expect, it } from 'vitest'
import type { CertificacionConEstado, Trabajador } from '../../types/domain'
import {
  calcularMetricasAgregadas,
  calcularMetricasTrabajador,
  calcularPorcentajeCumplimiento,
  contarCumplidas,
  contarRequeridas,
} from '../metrics'

function cert(overrides: Partial<CertificacionConEstado>): CertificacionConEstado {
  return {
    certId: 'c1',
    nombre: 'Test',
    tipo: 'ingreso',
    vigenciaMeses: 12,
    estado: 'vigente',
    ...overrides,
  }
}

function operativo(id: string, _certs: CertificacionConEstado[]): Trabajador {
  return {
    id,
    nombre: id,
    documento: id,
    tipo: 'operativo',
    cargoId: 'g1',
    taladroId: 'r1',
    certificaciones: [],
  }
}

describe('contarRequeridas / contarCumplidas', () => {
  it('cumplidas cuenta vigente, por_vencer y critico; NO vencido ni faltante', () => {
    const certs = [
      cert({ estado: 'vigente' }),
      cert({ estado: 'por_vencer' }),
      cert({ estado: 'critico' }),
      cert({ estado: 'vencido' }),
      cert({ estado: 'faltante' }),
    ]
    expect(contarRequeridas(certs)).toBe(5)
    expect(contarCumplidas(certs)).toBe(3)
  })
})

describe('calcularPorcentajeCumplimiento', () => {
  it('reproduce el ejemplo literal de la sección 12: 30 requeridas, 20 cumplidas -> 66,7%', () => {
    const porcentaje = calcularPorcentajeCumplimiento(30, 20)
    expect(porcentaje).toBeCloseTo(66.7, 1)
  })

  it('da 0 cuando requeridas es 0 (evita división por cero, ej. administrativos)', () => {
    expect(calcularPorcentajeCumplimiento(0, 0)).toBe(0)
  })
})

describe('calcularMetricasTrabajador', () => {
  it('calcula requeridas, cumplidas, % y noApto de un trabajador operativo', () => {
    const certs = [
      cert({ certId: 'c1', tipo: 'ingreso', estado: 'vencido' }),
      cert({ certId: 'c2', tipo: 'permanencia', estado: 'vigente' }),
    ]
    const metricas = calcularMetricasTrabajador(operativo('t1', certs), certs)
    expect(metricas.requeridas).toBe(2)
    expect(metricas.cumplidas).toBe(1)
    expect(metricas.porcentajeCumplimiento).toBeCloseTo(50, 5)
    expect(metricas.noApto).toBe(true) // ingreso vencido
  })

  it('un administrativo tiene 0 requeridas y noApto false', () => {
    const trabajador: Trabajador = {
      id: 'admin1',
      nombre: 'Laura',
      documento: '1',
      tipo: 'administrativo',
      certificaciones: [],
    }
    const metricas = calcularMetricasTrabajador(trabajador, [])
    expect(metricas.requeridas).toBe(0)
    expect(metricas.cumplidas).toBe(0)
    expect(metricas.porcentajeCumplimiento).toBe(0)
    expect(metricas.noApto).toBe(false)
  })
})

describe('calcularMetricasAgregadas', () => {
  it('agrega Σcumplidas/Σrequeridas (no promedio de porcentajes individuales)', () => {
    // Trabajador A: 3 requeridas, 3 cumplidas (100%)
    // Trabajador B: 1 requerida, 0 cumplidas (0%)
    // Promedio simple de % sería 50%, pero el agregado correcto es 3/4 = 75%
    const certsA = [
      cert({ certId: 'c1', estado: 'vigente' }),
      cert({ certId: 'c2', estado: 'vigente' }),
      cert({ certId: 'c3', estado: 'vigente' }),
    ]
    const certsB = [cert({ certId: 'c4', tipo: 'ingreso', estado: 'vencido' })]

    const resultado = calcularMetricasAgregadas([
      { trabajador: operativo('a', certsA), certsConEstado: certsA },
      { trabajador: operativo('b', certsB), certsConEstado: certsB },
    ])

    expect(resultado.requeridas).toBe(4)
    expect(resultado.cumplidas).toBe(3)
    expect(resultado.porcentajeCumplimiento).toBeCloseTo(75, 5)
    expect(resultado.personasCertificadas).toBe(1) // solo A
    expect(resultado.noAptos).toBe(1) // solo B
  })

  it('excluye administrativos de personasCertificadas (requeridas=0 no cuenta como 100%)', () => {
    const admin: Trabajador = {
      id: 'admin1',
      nombre: 'Laura',
      documento: '1',
      tipo: 'administrativo',
      certificaciones: [],
    }
    const resultado = calcularMetricasAgregadas([{ trabajador: admin, certsConEstado: [] }])
    expect(resultado.personasCertificadas).toBe(0)
    expect(resultado.numTrabajadores).toBe(1)
  })

  it('distribucionEstados cuenta cada certificación por su estado', () => {
    const certs = [
      cert({ certId: 'c1', estado: 'vigente' }),
      cert({ certId: 'c2', estado: 'por_vencer' }),
      cert({ certId: 'c3', estado: 'critico' }),
      cert({ certId: 'c4', estado: 'vencido' }),
      cert({ certId: 'c5', estado: 'faltante' }),
    ]
    const resultado = calcularMetricasAgregadas([
      { trabajador: operativo('a', certs), certsConEstado: certs },
    ])
    expect(resultado.distribucionEstados).toEqual({
      vigente: 1,
      por_vencer: 1,
      critico: 1,
      vencido: 1,
      faltante: 1,
    })
    expect(resultado.proximasAVencer).toBe(2) // por_vencer + critico
    expect(resultado.vencidas).toBe(1)
  })
})
