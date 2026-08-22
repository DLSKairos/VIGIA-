import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CertificadoAdjunto } from '../../../components/domain/CertificadoAdjunto'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent } from '../../../components/ui/Card'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Stepper, type StepperStep } from '../../../components/ui/Stepper'
import { useHoySimulada } from '../../../hooks/useHoySimulada'
import { toISODateString } from '../../../lib/dates'
import { useVigiaStore } from '../../../store/useVigiaStore'
import type { ArchivoSimulado, CertTrabajador, TipoTrabajador } from '../../../types/domain'

interface CertFormEntry {
  fechaInicioVigencia: string
  archivo?: ArchivoSimulado
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Registro de trabajador en vivo (spec sección 11 — ⭐ feature estrella).
 * Asistente por pasos con `Stepper`:
 *   1. Datos básicos (nombre, documento, tipo). Administrativo termina acá.
 *   2. Operativo -> cargo + taladro.
 *   3. Certificaciones requeridas del cargo, con reveal animado.
 *   4. Fecha de inicio de vigencia + adjuntar certificado por cada una.
 *   5. Resumen -> Guardar.
 */
export default function TrabajadorNuevoPage() {
  const navigate = useNavigate()
  const cargos = useVigiaStore((state) => state.cargos)
  const taladros = useVigiaStore((state) => state.taladros)
  const certificaciones = useVigiaStore((state) => state.certificaciones)
  const agregarTrabajador = useVigiaStore((state) => state.agregarTrabajador)
  const trabajadoresExistentes = useVigiaStore((state) => state.trabajadores)
  const hoySimulada = useHoySimulada()

  const [paso, setPaso] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const prefiereMovimientoReducido = useReducedMotion()

  // Paso 1
  const [nombre, setNombre] = useState('')
  const [documento, setDocumento] = useState('')
  const [tipo, setTipo] = useState<TipoTrabajador>('operativo')
  const [errorPaso1, setErrorPaso1] = useState<string | null>(null)

  // Paso 2 (solo operativo)
  const [cargoId, setCargoId] = useState('')
  const [taladroId, setTaladroId] = useState('')
  const [errorPaso2, setErrorPaso2] = useState<string | null>(null)

  // Paso 4 (certificaciones)
  const [certsForm, setCertsForm] = useState<Record<string, CertFormEntry>>({})
  const [errorPaso4, setErrorPaso4] = useState<string | null>(null)

  const [guardado, setGuardado] = useState(false)

  const cargoSeleccionado = cargos.find((c) => c.id === cargoId)
  const certsRequeridas = useMemo(
    () => (cargoSeleccionado ? cargoSeleccionado.certificacionesRequeridas.map((id) => certificaciones.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c)) : []),
    [cargoSeleccionado, certificaciones],
  )

  // Al cambiar de cargo, inicializa el formulario de certificaciones con la
  // fecha de hoy (simulada) por defecto para cada una — así el reveal
  // aparece ya usable, sin campos vacíos que bloqueen el flujo de demo.
  useEffect(() => {
    if (!cargoSeleccionado) {
      setCertsForm({})
      return
    }
    setCertsForm((actual) => {
      const siguiente: Record<string, CertFormEntry> = {}
      for (const certId of cargoSeleccionado.certificacionesRequeridas) {
        siguiente[certId] = actual[certId] ?? { fechaInicioVigencia: toISODateString(hoySimulada) }
      }
      return siguiente
    })
  }, [cargoSeleccionado?.id, hoySimulada])

  const steps: StepperStep[] =
    tipo === 'administrativo'
      ? [{ label: 'Datos básicos' }, { label: 'Resumen' }]
      : [{ label: 'Datos básicos' }, { label: 'Cargo y taladro' }, { label: 'Certificaciones' }, { label: 'Resumen' }]

  const pasoResumen = steps.length - 1

  function validarPaso1(): boolean {
    if (!nombre.trim() || !documento.trim()) {
      setErrorPaso1('Nombre y documento son obligatorios.')
      return false
    }
    const documentoDuplicado = trabajadoresExistentes.some((t) => t.documento === documento.trim())
    if (documentoDuplicado) {
      setErrorPaso1('Ya existe un trabajador registrado con ese documento.')
      return false
    }
    setErrorPaso1(null)
    return true
  }

  function validarPaso2(): boolean {
    if (!cargoId || !taladroId) {
      setErrorPaso2('Selecciona un cargo y un taladro.')
      return false
    }
    setErrorPaso2(null)
    return true
  }

  function validarPaso4(): boolean {
    const faltaFecha = certsRequeridas.some((cert) => !certsForm[cert.id]?.fechaInicioVigencia)
    if (faltaFecha) {
      setErrorPaso4('Completa la fecha de inicio de vigencia de cada certificación.')
      return false
    }
    setErrorPaso4(null)
    return true
  }

  function irSiguiente() {
    if (tipo === 'administrativo') {
      if (paso === 0 && !validarPaso1()) return
      setDirection(1)
      setPaso((p) => Math.min(p + 1, pasoResumen))
      return
    }

    // operativo: 0 datos -> 1 cargo/taladro -> 2 certificaciones -> 3 resumen
    if (paso === 0 && !validarPaso1()) return
    if (paso === 1 && !validarPaso2()) return
    if (paso === 2 && !validarPaso4()) return
    setDirection(1)
    setPaso((p) => Math.min(p + 1, pasoResumen))
  }

  function irAtras() {
    setDirection(-1)
    setPaso((p) => Math.max(p - 1, 0))
  }

  // Transición direccional entre pasos: entra desde el lado del que "viene"
  // el usuario y sale hacia el lado opuesto. Sin desplazamiento si el
  // sistema pide movimiento reducido — solo fade.
  const stepVariants = {
    enter: (dir: 1 | -1) => ({ opacity: 0, x: prefiereMovimientoReducido ? 0 : dir * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: 1 | -1) => ({ opacity: 0, x: prefiereMovimientoReducido ? 0 : dir * -40 }),
  }
  const stepTransition = prefiereMovimientoReducido
    ? { duration: 0.15, ease: 'easeOut' as const }
    : { type: 'spring' as const, stiffness: 400, damping: 40, mass: 1 }

  function handleGuardar(event: FormEvent) {
    event.preventDefault()

    const certificacionesTrabajador: CertTrabajador[] =
      tipo === 'operativo'
        ? certsRequeridas.map((cert) => ({
            certId: cert.id,
            fechaInicioVigencia: certsForm[cert.id]?.fechaInicioVigencia ?? toISODateString(hoySimulada),
            archivo: certsForm[cert.id]?.archivo,
          }))
        : []

    const nuevoId = crypto.randomUUID()

    agregarTrabajador({
      id: nuevoId,
      nombre: nombre.trim(),
      documento: documento.trim(),
      tipo,
      cargoId: tipo === 'operativo' ? cargoId : undefined,
      taladroId: tipo === 'operativo' ? taladroId : undefined,
      certificaciones: certificacionesTrabajador,
    })

    setGuardado(true)
    window.setTimeout(() => navigate(`/admin/trabajadores/${nuevoId}`), 600)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display tracking-display-lg text-2xl font-bold text-ink-950">Registrar trabajador</h1>
        <p className="mt-1 text-sm text-slate-500">Asistente por pasos — las certificaciones requeridas aparecen solas al elegir el cargo.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6">
          <Stepper steps={steps} currentStep={paso} />

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={paso}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
            >
              {/* Paso: datos básicos */}
              {paso === 0 && (
                <div className="flex flex-col gap-4">
                  <Input label="Nombre completo" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. María Fernanda Ortiz" />
                  <Input label="Documento" required value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="Ej. 1002345678" />

                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-ink-800">Tipo de trabajador</span>
                    <div className="flex gap-2">
                      {(['operativo', 'administrativo'] as const).map((opcion) => (
                        <button
                          key={opcion}
                          type="button"
                          onClick={() => setTipo(opcion)}
                          className={`h-11 flex-1 cursor-pointer rounded-vigia-sm border px-4 text-sm font-semibold transition-colors ${
                            tipo === opcion ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 text-ink-700 hover:border-brand-400 hover:bg-brand-50'
                          }`}
                        >
                          {opcion === 'operativo' ? 'Operativo' : 'Administrativo'}
                        </button>
                      ))}
                    </div>
                    {tipo === 'administrativo' && (
                      <p className="text-xs text-slate-500">Sin catálogo de certificaciones en este MVP — el registro termina en el siguiente paso.</p>
                    )}
                  </div>

                  {errorPaso1 && <p className="text-sm font-medium text-estado-vencido">{errorPaso1}</p>}
                </div>
              )}

              {/* Paso: cargo y taladro (solo operativo) */}
              {tipo === 'operativo' && paso === 1 && (
                <div className="flex flex-col gap-4">
                  <Select
                    label="Cargo"
                    required
                    placeholder="Selecciona un cargo"
                    value={cargoId}
                    onChange={(e) => setCargoId(e.target.value)}
                    options={cargos.map((c) => ({ value: c.id, label: c.nombre }))}
                  />
                  <Select
                    label="Taladro"
                    required
                    placeholder="Selecciona un taladro"
                    value={taladroId}
                    onChange={(e) => setTaladroId(e.target.value)}
                    options={taladros.map((t) => ({ value: t.id, label: t.nombre }))}
                  />
                  {errorPaso2 && <p className="text-sm font-medium text-estado-vencido">{errorPaso2}</p>}
                </div>
              )}

              {/* Paso: certificaciones requeridas — reveal animado (spec sección 11.3) */}
              {tipo === 'operativo' && paso === 2 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Certificaciones requeridas por {cargoSeleccionado?.nombre}</p>
                    <p className="text-xs text-slate-500">Aparecieron automáticamente al elegir el cargo. Completa fecha de inicio y adjunta el certificado.</p>
                  </div>

                  {certsRequeridas.length === 0 ? (
                    <p className="text-sm text-slate-500">Este cargo no tiene certificaciones asociadas en el catálogo.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {certsRequeridas.map((cert, index) => (
                        <div
                          key={cert.id}
                          className="animate-cert-reveal flex flex-col gap-3 rounded-vigia-md border border-slate-200 bg-slate-50/60 p-4"
                          style={{ animationDelay: `${index * 90}ms` }}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-ink-900">{cert.nombre}</p>
                            <Badge tone={cert.tipo === 'ingreso' ? 'danger' : 'info'} size="sm">
                              {cert.tipo === 'ingreso' ? 'Ingreso' : 'Permanencia'} · {cert.vigenciaMeses} meses
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <DatePicker
                              label="Fecha de inicio de vigencia"
                              required
                              value={certsForm[cert.id]?.fechaInicioVigencia ?? ''}
                              onChange={(e) =>
                                setCertsForm((f) => ({ ...f, [cert.id]: { ...f[cert.id], fechaInicioVigencia: e.target.value } }))
                              }
                            />
                            <CertificadoAdjunto
                              value={certsForm[cert.id]?.archivo}
                              onChange={(archivo) => setCertsForm((f) => ({ ...f, [cert.id]: { ...f[cert.id], fechaInicioVigencia: f[cert.id]?.fechaInicioVigencia ?? '', archivo } }))}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {errorPaso4 && <p className="text-sm font-medium text-estado-vencido">{errorPaso4}</p>}
                </div>
              )}

              {/* Paso: resumen */}
              {paso === pasoResumen && (
                <form onSubmit={handleGuardar} className="flex flex-col gap-5">
                  <div className="rounded-vigia-md border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-ink-900">{nombre}</p>
                    <p className="text-sm text-slate-500">Documento {documento}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {tipo === 'operativo'
                        ? `Operativo · ${cargos.find((c) => c.id === cargoId)?.nombre} · ${taladros.find((t) => t.id === taladroId)?.nombre}`
                        : 'Administrativo · sin certificaciones asociadas'}
                    </p>
                  </div>

                  {tipo === 'operativo' && certsRequeridas.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-ink-900">Certificaciones a registrar</p>
                      <ul className="divide-y divide-slate-100 rounded-vigia-md border border-slate-200">
                        {certsRequeridas.map((cert) => (
                          <li key={cert.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                            <span className="text-ink-800">{cert.nombre}</span>
                            <span className="flex items-center gap-2 text-slate-500">
                              <span className="font-mono">{certsForm[cert.id]?.fechaInicioVigencia}</span>
                              {certsForm[cert.id]?.archivo && (
                                <Badge tone="success" size="sm">
                                  {certsForm[cert.id]?.archivo?.nombre}
                                </Badge>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button type="submit" size="lg" loading={guardado} iconLeft={guardado ? <IconCheck className="h-4 w-4" /> : undefined}>
                    {guardado ? 'Trabajador guardado' : 'Guardar trabajador'}
                  </Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navegación entre pasos (no aplica en el paso de resumen, que tiene su propio submit) */}
          {paso !== pasoResumen && (
            <div className="flex justify-between border-t border-slate-100 pt-4">
              <Button type="button" variant="ghost" onClick={irAtras} disabled={paso === 0}>
                Atrás
              </Button>
              <Button type="button" onClick={irSiguiente}>
                Continuar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
