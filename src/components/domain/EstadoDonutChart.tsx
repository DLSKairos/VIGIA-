import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { EstadoCert } from '../../types/domain'
import { ESTADO_META } from './EstadoBadge'

export type EstadoDistribucion = Record<EstadoCert, number>

export interface EstadoDonutChartProps {
  data?: EstadoDistribucion
  height?: number
}

/** Datos de ejemplo (shell visual) — Fase 3 pasa la distribución real (`metrics.distribucionEstados`). */
const MOCK_DATA: EstadoDistribucion = {
  vigente: 24,
  por_vencer: 4,
  critico: 2,
  vencido: 3,
  faltante: 2,
}

const ORDER: EstadoCert[] = ['vigente', 'por_vencer', 'critico', 'vencido', 'faltante']

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  const estado = name as EstadoCert
  return (
    <div className="rounded-vigia-sm border border-slate-200 bg-white px-3 py-2 text-xs shadow-vigia-lifted">
      <p className="font-semibold text-ink-900">{ESTADO_META[estado].label}</p>
      <p className="font-mono text-ink-700">{value} certificaciones</p>
    </div>
  )
}

/**
 * Dona de distribución de estados (spec sección 10.1: "dona de distribución
 * de estados"). Reutiliza `ESTADO_META` como única fuente de color — nunca
 * duplica el mapeo de colores del semáforo.
 */
export function EstadoDonutChart({ data = MOCK_DATA, height = 260 }: EstadoDonutChartProps) {
  const chartData = ORDER.map((estado) => ({ name: estado, value: data[estado] })).filter((d) => d.value > 0)
  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="90%"
            paddingAngle={2}
            stroke="#FFFFFF"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={ESTADO_META[entry.name].hex} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-bold text-ink-950">{total}</span>
        <span className="text-xs text-slate-500">certificaciones</span>
      </div>

      <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
        {chartData.map((entry) => (
          <li key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ESTADO_META[entry.name].hex }} aria-hidden="true" />
            {ESTADO_META[entry.name].label}
            <span className="font-mono font-semibold text-ink-800">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
