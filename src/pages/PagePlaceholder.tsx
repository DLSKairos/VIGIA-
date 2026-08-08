interface PagePlaceholderProps {
  titulo: string
  descripcion?: string
}

/**
 * Placeholder mínimo para las vistas que construyen los agentes de UX/UI y
 * frontend-dev en las fases siguientes de VIGÍA. Su único propósito acá es
 * que el router y el build funcionen de punta a punta durante el scaffold
 * (Fase 1). No es diseño final: clases Tailwind neutras/default a propósito.
 */
export default function PagePlaceholder({ titulo, descripcion }: PagePlaceholderProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-neutral-900">{titulo}</h1>
      {descripcion ? <p className="mt-2 text-neutral-500">{descripcion}</p> : null}
    </div>
  )
}
