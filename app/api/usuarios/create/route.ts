import { NextRequest, NextResponse } from 'next/server'
import { requireMaster, getProfile } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    // Verificar que sea master
    const profile = await getProfile()
    if (!profile || profile.rol !== 'master') {
      return NextResponse.json(
        { error: 'Solo usuarios master pueden crear usuarios' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { nombre, email, password, rol, sucursal_id, approved } = body

    // Validaciones
    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Validar que solo masters puedan crear otros masters
    if (rol === 'master' && profile.rol !== 'master') {
      return NextResponse.json(
        { error: 'Solo usuarios master pueden crear otros usuarios master.' },
        { status: 403 }
      )
    }

    // Usar Admin Client con Service Role Key
    const supabaseAdmin = createAdminClient()

    // Crear usuario en Auth usando Admin API (sin confirmación de email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        nombre,
      },
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: authError.message || 'Error al crear usuario en Auth' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      )
    }

    // El trigger automáticamente crea el profile, pero lo actualizamos con los datos adicionales
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        nombre,
        email,
        rol: rol || 'pending',
        approved: approved || false,
        sucursal_id: sucursal_id || null,
      })
      .eq('id', authData.user.id)

    if (profileError) {
      // Si falla actualizar (porque el trigger aún no creó el profile), intentar insertar
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          nombre,
          email,
          rol: rol || 'pending',
          approved: approved || false,
          sucursal_id: sucursal_id || null,
        })

      if (insertError) {
        console.error('Error creating profile:', insertError)
        return NextResponse.json(
          { error: 'Error al crear perfil de usuario: ' + insertError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        nombre,
      }
    })
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear usuario' },
      { status: 500 }
    )
  }
}
