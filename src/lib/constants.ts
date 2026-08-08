/**
 * VIGÍA — Umbrales de estado (spec VIGIA.md, sección 7).
 *
 * Tabla de estados (límites inclusivos hacia abajo):
 *   vigente:     diasRestantes > 30
 *   por_vencer:  15 < diasRestantes <= 30
 *   critico:     0 < diasRestantes <= 15
 *   vencido:     diasRestantes <= 0
 */
export const UMBRAL_POR_VENCER_DIAS = 30
export const UMBRAL_CRITICO_DIAS = 15
export const UMBRAL_VENCIDO_DIAS = 0
