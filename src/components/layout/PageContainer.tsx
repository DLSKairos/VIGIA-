import type { HTMLAttributes } from 'react'
import { cn } from '../ui/cn'

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** 'wide' para vistas densas (tablas admin), 'default' para dashboard/formularios. */
  width?: 'default' | 'wide'
}

/** Wrapper de layout responsive: centra el contenido y define el padding horizontal consistente. */
export function PageContainer({ width = 'default', className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        width === 'wide' ? 'max-w-7xl' : 'max-w-6xl',
        className,
      )}
      {...props}
    />
  )
}
