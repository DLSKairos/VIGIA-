import { type ChangeEvent, useId, useRef } from 'react'
import type { ArchivoSimulado } from '../../types/domain'
import { Button } from '../ui/Button'

function IconPaperclip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M8 12.5l6.5-6.5a3.2 3.2 0 0 1 4.5 4.5L10.8 18.7a5 5 0 0 1-7-7L12 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconFile({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3.5V8h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export interface CertificadoAdjuntoProps {
  label?: string
  value?: ArchivoSimulado
  onChange: (archivo: ArchivoSimulado | undefined) => void
  helperText?: string
}

/**
 * Adjuntar certificado SIMULADO (spec sección 3 y 11): ningún archivo se
 * sube a ningún lado. Si el usuario elige un archivo real de su disco, se
 * usa solo para mostrar un chip con el nombre (y, si es una imagen, un
 * preview en memoria vía `URL.createObjectURL`) — nunca se persiste el
 * contenido, solo el nombre sobrevive a un refresh (ver `partialize` del
 * store).
 */
export function CertificadoAdjunto({ label = 'Certificado (simulado)', value, onChange, helperText }: CertificadoAdjuntoProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    onChange({ nombre: file.name, preview })
    event.target.value = ''
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span id={inputId} className="text-sm font-medium text-ink-800">
        {label}
      </span>

      <input ref={inputRef} type="file" className="sr-only" aria-labelledby={inputId} onChange={handleFileChange} />

      {value ? (
        <div className="flex items-center gap-2.5 rounded-vigia-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm">
          {value.preview ? (
            <img src={value.preview} alt="" className="h-8 w-8 shrink-0 rounded object-cover" />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-brand-100 text-brand-700">
              <IconFile className="h-4 w-4" />
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-ink-800">{value.nombre}</span>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Quitar archivo adjunto"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-ink-900"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="md" iconLeft={<IconPaperclip className="h-4 w-4" />} onClick={() => inputRef.current?.click()}>
          Adjuntar certificado
        </Button>
      )}

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  )
}
