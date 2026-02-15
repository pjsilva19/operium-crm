'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = false, className = '' }: LogoProps) {
  const [hasError, setHasError] = useState(false)
  const [logoVersion, setLogoVersion] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Solo establecer el timestamp en el cliente después de la hidratación
    setMounted(true)
    setLogoVersion(`?v=${Date.now()}`)
  }, [])

  const sizes = {
    sm: { width: 120, height: 40 },
    md: { width: 180, height: 60 },
    lg: { width: 240, height: 80 },
  }

  const textSizes = {
    sm: { title: 'text-xl', subtitle: 'text-xs' },
    md: { title: 'text-2xl', subtitle: 'text-sm' },
    lg: { title: 'text-4xl', subtitle: 'text-base' },
  }

  const { width, height } = sizes[size]
  const { title, subtitle } = textSizes[size]

  if (hasError) {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className={`${title} font-bold text-white`}>OPERIUM</span>
        <span className={`${subtitle} text-gray-400`}>Transporte y Logística</span>
      </div>
    )
  }

  // Mientras no esté montado, usar la ruta sin versión para evitar errores de hidratación
  // Intentar usar el nuevo logo, si falla usar el logo anterior como fallback
  const logoSrc = mounted ? `/operiumlogohires2.png${logoVersion}` : '/operiumlogohires2.png'
  const fallbackSrc = mounted ? `/logo.png${logoVersion}` : '/logo.png'

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="w-full flex justify-center">
        <Image
          src={logoSrc}
          alt="OPERIUM"
          width={width}
          height={height}
          className="object-contain w-full h-auto"
          style={{ maxWidth: '100%' }}
          priority
          onError={(e) => {
            console.error('Error loading logo:', logoSrc, e)
            // Si el nuevo logo falla, intentar con el logo anterior
            if (logoSrc.includes('operiumlogohires2')) {
              const img = e.target as HTMLImageElement
              img.src = fallbackSrc
            } else {
              setHasError(true)
            }
          }}
          unoptimized
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${title} font-bold text-white`}>OPERIUM</span>
          <span className={`${subtitle} text-gray-400`}>Transporte y Logística</span>
        </div>
      )}
    </div>
  )
}
