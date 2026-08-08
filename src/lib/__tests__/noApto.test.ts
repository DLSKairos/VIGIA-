import { describe, expect, it } from 'vitest'
import type { CertificacionConEstado } from '../../types/domain'
import { calcularNoApto } from '../noApto'

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

describe('calcularNoApto', () => {
  it('siempre false para administrativos, sin importar los certs', () => {
    const certs = [cert({ tipo: 'ingreso', estado: 'vencido' })]
    expect(calcularNoApto(certs, 'administrativo')).toBe(false)
  })

  it('true si un ingreso está vencido', () => {
    const certs = [cert({ tipo: 'ingreso', estado: 'vencido' })]
    expect(calcularNoApto(certs, 'operativo')).toBe(true)
  })

  it('true si un ingreso está faltante', () => {
    const certs = [cert({ tipo: 'ingreso', estado: 'faltante' })]
    expect(calcularNoApto(certs, 'operativo')).toBe(true)
  })

  it('false si el ingreso vencido/faltante no existe pero sí uno por_vencer o critico', () => {
    const certs = [
      cert({ tipo: 'ingreso', estado: 'por_vencer' }),
      cert({ tipo: 'ingreso', estado: 'critico' }),
    ]
    expect(calcularNoApto(certs, 'operativo')).toBe(false)
  })

  it('false si solo una certificación de permanencia está vencida', () => {
    const certs = [cert({ tipo: 'permanencia', estado: 'vencido' })]
    expect(calcularNoApto(certs, 'operativo')).toBe(false)
  })

  it('false si todo está vigente', () => {
    const certs = [
      cert({ tipo: 'ingreso', estado: 'vigente' }),
      cert({ tipo: 'permanencia', estado: 'vigente' }),
    ]
    expect(calcularNoApto(certs, 'operativo')).toBe(false)
  })
})
