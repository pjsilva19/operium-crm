import { NextRequest, NextResponse } from 'next/server'
import { requireMaster, getProfile } from '@/lib/auth'
import { approveCliente } from '@/lib/clientes'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getProfile()
    if (!profile || profile.rol !== 'master') {
      return NextResponse.json(
        { error: 'Solo usuarios master pueden aprobar clientes' },
        { status: 403 }
      )
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: 'ID de cliente requerido' },
        { status: 400 }
      )
    }
    await approveCliente(id, profile)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error approving cliente:', error)
    return NextResponse.json(
      { error: error.message || 'Error al aprobar cliente' },
      { status: 500 }
    )
  }
}
