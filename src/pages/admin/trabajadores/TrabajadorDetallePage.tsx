import { useParams } from 'react-router-dom'
import PagePlaceholder from '../../PagePlaceholder'

/** Detalle de trabajador: certificaciones con estado, días restantes, acción
 * "Renovar" por certificación (spec sección 10.2). */
export default function TrabajadorDetallePage() {
  const { id } = useParams<{ id: string }>()

  return (
    <PagePlaceholder
      titulo={`Trabajador — detalle (${id ?? 'sin id'})`}
      descripcion="Certificaciones con estado y días restantes. Acción Renovar."
    />
  )
}
