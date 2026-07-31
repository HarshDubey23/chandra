'use client'
// BlurImage — lazy-loads images with a blur-up placeholder effect.
// Shows a shimmer/skeleton placeholder that blurs and fades when the image loads.
// Master doc §5.1 — image optimization for perceived performance.
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface BlurImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  loading?: 'lazy' | 'eager'
  /** Aspect ratio class, e.g. 'aspect-[4/3]' — defaults to 'aspect-[4/3]' */
  aspectClassName?: string
  onClick?: () => void
}

export function BlurImage({
  src,
  alt,
  className,
  containerClassName,
  loading = 'lazy',
  aspectClassName = 'aspect-[4/3]',
  onClick,
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={cn('relative overflow-hidden bg-secondary', aspectClassName, containerClassName, onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      {/* Shimmer placeholder — shown until image loads */}
      {!loaded && (
        <div className="absolute inset-0 shimmer-bg" aria-hidden="true" />
      )}
      {/* Actual image — fades in when loaded */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-all duration-700',
          loaded ? 'blur-0 scale-100 opacity-100' : 'blur-xl scale-105 opacity-0',
          className
        )}
      />
    </div>
  )
}
