import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface ComplianceBarDatum {
  taladro: string
  porcentaje: number
}

export interface ComplianceBarChartProps {
  data?: ComplianceBarDatum[]
  /** Alto del contenedor en px. */
  height?: number
  /** Nombre del taladro a resaltar (ej. el filtro activo del dashboard). */
  destacado?: string
}

/** Datos de ejemplo (shell visual) — Fase 3 los reemplaza con métricas reales por taladro. */
const MOCK_DATA: ComplianceBarDatum[] = [
  { taladro: 'Rig 2501', porcentaje: 92 },
  { taladro: 'Rig 3001', porcentaje: 68 },
  { taladro: 'Rig 3003', porcentaje: 74 },
]

function barColor(porcentaje: number): string {
  if (porcentaje >= 90) return '#15803D' // vigente
  if (porcentaje >= 75) return '#0EA5AE' // brand-500
  if (porcentaje >= 50) return '#F2B705' // por_vencer
  return '#B91C1C' // vencido
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: ComplianceBarDatum }> }) {
  if (!active || !payload?.length) return null
  const datum = payload[0].payload
  return (
    <div className="rounded-vigia-sm border border-slate-200 bg-white px-3 py-2 text-xs shadow-vigia-lifted">
      <p className="font-semibold text-ink-900">{datum.taladro}</p>
      <p className="font-mono text-ink-700">{datum.porcentaje}% de cumplimiento</p>
    </div>
  )
}

/**
 * Barras de % de cumplimiento por taladro (spec sección 10.1). Shell de
 * Recharts con datos de ejemplo — Fase 3 pasa `data` con las métricas
 * reales agregadas por taladro (`lib/metrics.ts`).
 */
export function ComplianceBarChart({ data = MOCK_DATA, height = 260, destacado }: ComplianceBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 0 }} barSize={44}>
        <CartesianGrid vertical={false} stroke="#E2E8F0" />
        <XAxis
          dataKey="taladro"
          tick={{ fill: '#475569', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
          axisLine={{ stroke: '#CBD5E1' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
          axisLine={false}
          tickLine={false}
          width={44}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.12)' }} />
        <Bar dataKey="porcentaje" radius={[6, 6, 0, 0]} isAnimationActive={false}>
          {data.map((entry) => (
            <Cell
              key={entry.taladro}
              fill={barColor(entry.porcentaje)}
              stroke={entry.taladro === destacado ? '#0B1220' : 'transparent'}
              strokeWidth={entry.taladro === destacado ? 3 : 0}
              opacity={destacado && entry.taladro !== destacado ? 0.45 : 1}
            />
          ))}
          <LabelList
            dataKey="porcentaje"
            position="top"
            formatter={(v) => `${v}%`}
            style={{ fill: '#0B1220', fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
