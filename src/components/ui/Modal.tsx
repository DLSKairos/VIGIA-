import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { cn } from './cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

/**
 * Modal accesible: overlay clicable para cerrar, Escape para cerrar, foco
 * inicial en el diálogo, `aria-modal` + `role="dialog"`. Se monta en un
 * portal para evitar problemas de overflow/z-index del layout host.
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    dialogRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Cerrar"
            tabIndex={-1}
            className="absolute inset-0 cursor-default bg-ink-950/60 backdrop-blur-[1px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vigia-modal-title"
            aria-describedby={description ? 'vigia-modal-description' : undefined}
            tabIndex={-1}
            className={cn(
              'relative z-10 flex max-h-[90vh] w-full flex-col rounded-vigia-lg bg-white shadow-vigia-lifted focus:outline-none',
              SIZE_CLASSES[size],
            )}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', bounce: 0, duration: 0.28 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
              <div>
                <h2 id="vigia-modal-title" className="font-display text-lg font-semibold text-ink-900">
                  {title}
                </h2>
                {description && (
                  <p id="vigia-modal-description" className="mt-1 text-sm text-slate-500">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar diálogo"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-vigia-sm text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink-900"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">{children}</div>

            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 p-5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
