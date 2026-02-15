'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/lib/supabase/types'
import Logo from './Logo'

interface SidebarProps {
  profile: Profile | null
  pendientesCount?: number
}

export default function Sidebar({ profile, pendientesCount = 0 }: SidebarProps) {
  const pathname = usePathname()
  const [clientesExpanded, setClientesExpanded] = useState(false)
  const [transportistasExpanded, setTransportistasExpanded] = useState(false)
  const [usuariosExpanded, setUsuariosExpanded] = useState(false)
  const [viajesExpanded, setViajesExpanded] = useState(false)

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  ]

  if (profile?.rol === 'master') {
    menuItems.push({ 
      href: '/aprobaciones', 
      label: 'Aprobaciones', 
      icon: '✅',
      badge: pendientesCount > 0 ? pendientesCount : undefined
    })
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const isClientesActive = pathname === '/clientes' || pathname.startsWith('/clientes/')
  const isTransportistasActive = pathname === '/transportistas' || pathname.startsWith('/transportistas/')
  const isUsuariosActive = pathname === '/usuarios' || pathname.startsWith('/usuarios/')
  const isViajesActive = pathname === '/viajes' || pathname.startsWith('/viajes/')

  const handleNuevoCliente = () => {
    // Disparar evento personalizado que la página de clientes escuchará
    window.dispatchEvent(new CustomEvent('openClienteModal'))
  }

  const handleNuevoTransportista = () => {
    // Redirigir a la página de nuevo transportista
    window.location.href = '/transportistas/nuevo'
  }

  const handleNuevoUsuario = () => {
    // Disparar evento personalizado que la página de usuarios escuchará
    window.dispatchEvent(new CustomEvent('openUsuarioModal'))
  }

  const handleNuevoViaje = () => {
    // Redirigir a la página de nuevo viaje
    window.location.href = '/viajes/nuevo'
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0B1B2B] border-r border-gray-800 flex flex-col z-50">
      <div className="p-4 border-b border-gray-800 flex justify-center items-center">
        <div className="w-full flex justify-center">
          <Logo size="sm" className="w-full justify-center" />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.href)
                ? 'bg-[#F97316] text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-2 bg-red-500 text-white text-xs font-semibold rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}

        {/* Viajes con submenú */}
        <div>
          <button
            onClick={() => setViajesExpanded(!viajesExpanded)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
              isViajesActive
                ? 'bg-[#F97316] text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🚛</span>
              <span className="font-medium">Viajes</span>
            </div>
            <span className={`transition-transform ${viajesExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {viajesExpanded && (
            <div className="mt-2 space-y-1" style={{ paddingLeft: '3rem', borderLeft: '2px solid #374151' }}>
              <Link
                href="/viajes"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  pathname === '/viajes'
                    ? 'bg-[#F97316]/50 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                style={{ marginLeft: '1rem' }}
              >
                <span className="text-sm">📋</span>
                <span className="text-sm font-medium">Lista de Viajes</span>
              </Link>
              <button
                onClick={handleNuevoViaje}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left text-gray-400 hover:bg-gray-800 hover:text-white"
                style={{ marginLeft: '1rem' }}
              >
                <span className="text-sm">➕</span>
                <span className="text-sm font-medium">Nuevo Viaje</span>
              </button>
            </div>
          )}
        </div>

        {/* Clientes con submenú */}
        <div>
          <button
            onClick={() => setClientesExpanded(!clientesExpanded)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
              isClientesActive
                ? 'bg-[#F97316] text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">👥</span>
              <span className="font-medium">Clientes</span>
            </div>
            <span className={`transition-transform ${clientesExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {clientesExpanded && (
            <div className="mt-2 space-y-1" style={{ paddingLeft: '3rem', borderLeft: '2px solid #374151' }}>
              <Link
                href="/clientes"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  pathname === '/clientes'
                    ? 'bg-[#F97316]/50 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                style={{ marginLeft: '1rem' }}
              >
                <span className="text-sm">📋</span>
                <span className="text-sm font-medium">Lista de Clientes</span>
              </Link>
              <button
                onClick={handleNuevoCliente}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left text-gray-400 hover:bg-gray-800 hover:text-white"
                style={{ marginLeft: '1rem' }}
              >
                <span className="text-sm">➕</span>
                <span className="text-sm font-medium">Nuevo Cliente</span>
              </button>
            </div>
          )}
        </div>

        {/* Transportistas con submenú */}
        <div>
          <button
            onClick={() => setTransportistasExpanded(!transportistasExpanded)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
              isTransportistasActive
                ? 'bg-[#F97316] text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🚚</span>
              <span className="font-medium">Transportistas</span>
            </div>
            <span className={`transition-transform ${transportistasExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {transportistasExpanded && (
            <div className="mt-2 space-y-1" style={{ paddingLeft: '3rem', borderLeft: '2px solid #374151' }}>
              <Link
                href="/transportistas"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  pathname === '/transportistas'
                    ? 'bg-[#F97316]/50 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                style={{ marginLeft: '1rem' }}
              >
                <span className="text-sm">📋</span>
                <span className="text-sm font-medium">Lista de Transportistas</span>
              </Link>
              <button
                onClick={handleNuevoTransportista}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left text-gray-400 hover:bg-gray-800 hover:text-white"
                style={{ marginLeft: '1rem' }}
              >
                <span className="text-sm">➕</span>
                <span className="text-sm font-medium">Nuevo Transportista</span>
              </button>
            </div>
          )}
        </div>

        {/* Usuarios con submenú - Solo para master */}
        {profile?.rol === 'master' && (
          <div>
            <button
              onClick={() => setUsuariosExpanded(!usuariosExpanded)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                isUsuariosActive
                  ? 'bg-[#F97316] text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👑</span>
                <span className="font-medium">Usuarios</span>
              </div>
              <span className={`transition-transform ${usuariosExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {usuariosExpanded && (
              <div className="mt-2 space-y-1" style={{ paddingLeft: '3rem', borderLeft: '2px solid #374151' }}>
                <Link
                  href="/usuarios"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    pathname === '/usuarios'
                      ? 'bg-[#F97316]/50 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                  style={{ marginLeft: '1rem' }}
                >
                  <span className="text-sm">📋</span>
                  <span className="text-sm font-medium">Lista de Usuarios</span>
                </Link>
                <button
                  onClick={handleNuevoUsuario}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left text-gray-400 hover:bg-gray-800 hover:text-white"
                  style={{ marginLeft: '1rem' }}
                >
                  <span className="text-sm">➕</span>
                  <span className="text-sm font-medium">Nuevo Usuario</span>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-2">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg">
          <div className="w-10 h-10 bg-[#F97316] rounded-full flex items-center justify-center text-white font-semibold">
            {(profile?.nombre || profile?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.nombre || profile?.email || 'Usuario'}
            </p>
            <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
          </div>
        </div>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
