import type { CertificacionConEstado, TipoTrabajador } from '../types/domain'

/**
 * Bandera "No apto para taladro" (spec sección 7, solo operativos):
 * true si alguna certificación de tipo `ingreso` está en estado `vencido`
 * o `faltante`. `por_vencer` y `critico` NO disparan la bandera, solo
 * alertan.
 */
export function calcularNoApto(
  certsConEstado: CertificacionConEstado[],
  tipoTrabajador: TipoTrabajador,
): boolean {
  if (tipoTrabajador === 'administrativo') return false

  return certsConEstado.some(
    (cert) => cert.tipo === 'ingreso' && (cert.estado === 'vencido' || cert.estado === 'faltante'),
  )
}
