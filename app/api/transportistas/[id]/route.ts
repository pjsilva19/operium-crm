import { NextRequest, NextResponse } from 'next/server'
import { requireApprovedUser } from '@/lib/auth'
import { deleteTransportista } from '@/lib/transportistas'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApprovedUser()
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de transportista requerido' },
        { status: 400 }
      )
    }

    await deleteTransportista(id, profile)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting transportista:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar transportista' },
      { status: 500 }
    )
  }
}
