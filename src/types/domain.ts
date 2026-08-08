/**
 * VIGÍA — Modelo de dominio (spec VIGIA.md, sección 5).
 *
 * Nota de persistencia (desviación documentada respecto al spec):
 * el spec describe `fechaInicioVigencia` como `Date`, pero acá se modela
 * como `string` en formato ISO 'yyyy-MM-dd' (el mismo formato que produce
 * un <input type="date">). Motivo: el store persiste con Zustand `persist`
 * sobre localStorage, que serializa con JSON.stringify/parse — un `Date`
 * sobrevive el `stringify` (se vuelve string) pero NO el `parse` de vuelta
 * (queda como string, no se re-hidrata a Date automáticamente). Para evitar
 * ese bug de re-hidratación se estandariza TODO lo persistido como string
 * ISO, y las funciones puras de `lib/dates.ts` son las únicas responsables
 * de convertir esos strings a `Date` para calcular (con `parseFechaISO`,
 * que parsea en hora LOCAL para evitar off-by-one de zona horaria).
 */

/** Tipo de certificación: `ingreso` bloquea (dispara "No apto" si falta o vence),
 * `permanencia` solo alerta. */
export type TipoCertificacion = 'ingreso' | 'permanencia'

/** Certificación del catálogo (parametrizable en Admin). */
export interface Certificacion {
  id: string
  nombre: string
  tipo: TipoCertificacion
  vigenciaMeses: number
}

/** Cargo del catálogo (aplica solo a trabajadores operativos). */
export interface Cargo {
  id: string
  nombre: string
  /** ids de Certificacion requeridas por este cargo */
  certificacionesRequeridas: string[]
}

/** Taladro (hardcodeado en el MVP, editable en Parametrización a nivel de lista simple). */
export interface Taladro {
  id: string
  nombre: string
}

export type TipoTrabajador = 'operativo' | 'administrativo'

/** Archivo de certificado SIMULADO: no se sube nada real (sección 3 del spec). */
export interface ArchivoSimulado {
  nombre: string
  /** Preview en memoria (ej. base64 dataURL). NUNCA se persiste completo en
   * localStorage (ver partialize del store) para no inflar el storage. */
  preview?: string
}

/** Certificación registrada de un trabajador puntual. */
export interface CertTrabajador {
  certId: string
  /** ISO 'yyyy-MM-dd'. Ver nota de persistencia arriba. */
  fechaInicioVigencia: string
  archivo?: ArchivoSimulado
}

export interface Trabajador {
  id: string
  nombre: string
  documento: string
  tipo: TipoTrabajador
  /** Solo operativo */
  cargoId?: string
  /** Solo operativo */
  taladroId?: string
  /** Vacío en administrativo (MVP) */
  certificaciones: CertTrabajador[]
}

/** Estado calculado de una certificación frente a `hoySimulada` (spec sección 7). */
export type EstadoCert = 'vigente' | 'por_vencer' | 'critico' | 'vencido' | 'faltante'

/**
 * Certificación de un trabajador CON su estado ya calculado.
 *
 * IMPORTANTE: este tipo NUNCA se persiste. Siempre se deriva en tiempo real
 * (ver `lib/estado.ts`) a partir de: catálogo de certificaciones + cargo del
 * trabajador + sus `CertTrabajador` registrados + `hoySimulada`. Así, editar
 * un cargo o una certificación en Parametrización recalcula en vivo a todos
 * los trabajadores existentes sin tener que migrar datos guardados.
 */
export interface CertificacionConEstado {
  certId: string
  nombre: string
  tipo: TipoCertificacion
  vigenciaMeses: number
  /** undefined si el estado es 'faltante' (nunca se registró) */
  fechaInicioVigencia?: Date
  /** undefined si el estado es 'faltante' */
  fechaVencimiento?: Date
  /** undefined si el estado es 'faltante' */
  diasRestantes?: number
  estado: EstadoCert
  archivo?: ArchivoSimulado
}
