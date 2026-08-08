import { describe, expect, it } from 'vitest'
import { getCertificacionesEstadoTrabajador } from '../../../lib/estado'
import { calcularNoApto } from '../../../lib/noApto'
import type { CertificacionConEstado, EstadoCert, Trabajador } from '../../../types/domain'
import { cargosSeed } from '../cargos.seed'
import { certificacionesSeed } from '../certificaciones.seed'
import { buildSeedTrabajadores } from '../trabajadores.seed'

/**
 * Test crítico: verifica, con las funciones de lib/, que los 6 trabajadores
 * sembrados (spec sección 14) caen EXACTAMENTE en el estado objetivo de la
 * tabla, incluyendo la bandera "No apto para taladro".
 *
 * Usa una fecha de referencia FIJA (no `new Date()` real) para que el test
 * sea determinista sin importar cuándo se ejecute el CI.
 */
const HOY_SIMULADA = new Date(2026, 0, 1) // 1 ene 2026, fija

function estadoDe(certs: CertificacionConEstado[], certId: string): EstadoCert | undefined {
  return certs.find((c) => c.certId === certId)?.estado
}

function evaluarTrabajador(trabajador: Trabajador) {
  const cargo = cargosSeed.find((c) => c.id === trabajador.cargoId)
  const certsConEstado = getCertificacionesEstadoTrabajador(
    trabajador,
    certificacionesSeed,
    cargo,
    HOY_SIMULADA,
  )
  const noApto = calcularNoApto(certsConEstado, trabajador.tipo)
  return { certsConEstado, noApto }
}

describe('seed de trabajadores (spec sección 14) — estados objetivo exactos', () => {
  const trabajadores = buildSeedTrabajadores(HOY_SIMULADA)
  const [carlos, andres, julian, oscar, diego, laura] = trabajadores

  it('siembra exactamente 6 trabajadores', () => {
    expect(trabajadores).toHaveLength(6)
  })

  it('1. Carlos Mendoza — Soldador Rig 2501 — todo al día (apto, 100%)', () => {
    expect(carlos).toBeDefined()
    const { certsConEstado, noApto } = evaluarTrabajador(carlos!)
    expect(certsConEstado).toHaveLength(3) // c1, c2, c5
    expect(estadoDe(certsConEstado, 'c1')).toBe('vigente')
    expect(estadoDe(certsConEstado, 'c2')).toBe('vigente')
    expect(estadoDe(certsConEstado, 'c5')).toBe('vigente')
    expect(noApto).toBe(false)
  })

  it('2. Andrés Gaviria — Jefe de equipo Rig 2501 — Brigadas por_vencer, resto vigente (apto)', () => {
    expect(andres).toBeDefined()
    const { certsConEstado, noApto } = evaluarTrabajador(andres!)
    expect(certsConEstado).toHaveLength(5) // c1, c3, c4, c5, c6
    expect(estadoDe(certsConEstado, 'c5')).toBe('por_vencer')
    expect(estadoDe(certsConEstado, 'c1')).toBe('vigente')
    expect(estadoDe(certsConEstado, 'c3')).toBe('vigente')
    expect(estadoDe(certsConEstado, 'c4')).toBe('vigente')
    expect(estadoDe(certsConEstado, 'c6')).toBe('vigente')
    expect(noApto).toBe(false)
  })

  it('3. Julián Torres — Soldador Rig 3001 — Alturas crítica, resto vigente (apto)', () => {
    expect(julian).toBeDefined()
    const { certsConEstado, noApto } = evaluarTrabajador(julian!)
    expect(certsConEstado).toHaveLength(3) // c1, c2, c5
    expect(estadoDe(certsConEstado, 'c1')).toBe('critico')
    expect(estadoDe(certsConEstado, 'c2')).toBe('vigente')
    expect(estadoDe(certsConEstado, 'c5')).toBe('vigente')
    expect(noApto).toBe(false)
  })

  it('4. Óscar Ramírez — Jefe de equipo Rig 3001 — Well control VENCIDA (ingreso) -> No apto', () => {
    expect(oscar).toBeDefined()
    const { certsConEstado, noApto } = evaluarTrabajador(oscar!)
    expect(certsConEstado).toHaveLength(5) // c1, c3, c4, c5, c6
    expect(estadoDe(certsConEstado, 'c4')).toBe('vencido')
    expect(estadoDe(certsConEstado, 'c1')).toBe('vigente')
    expect(estadoDe(certsConEstado, 'c3')).toBe('vigente')
    expect(estadoDe(certsConEstado, 'c5')).toBe('vigente')
    expect(estadoDe(certsConEstado, 'c6')).toBe('vigente')
    expect(noApto).toBe(true)
  })

  it('5. Diego Cárdenas — Soldador Rig 3003 — Espacios confinados FALTANTE (ingreso) -> No apto', () => {
    expect(diego).toBeDefined()
    const { certsConEstado, noApto } = evaluarTrabajador(diego!)
    expect(certsConEstado).toHaveLength(3) // c1, c2, c5
    expect(estadoDe(certsConEstado, 'c2')).toBe('faltante')
    expect(estadoDe(certsConEstado, 'c1')).toBe('vigente')
    expect(estadoDe(certsConEstado, 'c5')).toBe('vigente')
    expect(noApto).toBe(true)
  })

  it('6. Laura Ríos — administrativo — sin catálogo de certificaciones, apta por definición', () => {
    expect(laura).toBeDefined()
    expect(laura!.tipo).toBe('administrativo')
    expect(laura!.certificaciones).toEqual([])
    const { certsConEstado, noApto } = evaluarTrabajador(laura!)
    expect(certsConEstado).toEqual([])
    expect(noApto).toBe(false)
  })

  it('resumen: solo Óscar y Diego quedan No apto; los demás 4 son aptos', () => {
    const resultados = trabajadores.map((t) => ({
      nombre: t.nombre,
      noApto: evaluarTrabajador(t).noApto,
    }))
    const noAptos = resultados.filter((r) => r.noApto).map((r) => r.nombre)
    expect(noAptos.sort()).toEqual(['Diego Cárdenas', 'Óscar Ramírez'].sort())
  })
})
