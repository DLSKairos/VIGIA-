import PagePlaceholder from './PagePlaceholder'

/** Vista pública ("/"), sin login. Vitrina de métricas — spec sección 10.1.
 * La construye el agente de UX/UI en la fase siguiente. */
export default function DashboardPage() {
  return (
    <PagePlaceholder
      titulo="Dashboard público (/)"
      descripcion="VIGÍA — vitrina de métricas. Vista pública, sin login."
    />
  )
}
