import { NextRequest, NextResponse } from 'next/server'
import { requireMaster, getProfile } from '@/lib/auth'
import { approveTransportista } from '@/lib/transportistas'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getProfile()
    if (!profile || profile.rol !== 'master') {
      return NextResponse.json(
        { error: 'Solo usuarios master pueden aprobar transportistas' },
        { status: 403 }
      )
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'ID de transportista requerido' },
        { status: 400 }
      )
    }
    await approveTransportista(id, profile)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error approving transportista:', error)
    return NextResponse.json(
      { error: error.message || 'Error al aprobar transportista' },
      { status: 500 }
    )
  }
}
