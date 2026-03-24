import { NextRequest, NextResponse } from 'next/server'
import { verifyHandbookPassword } from '@/app/actions/handbook'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shareId, password } = body

    if (!shareId || !password) {
      return NextResponse.json({ verified: false }, { status: 400 })
    }

    const result = await verifyHandbookPassword(shareId, password)

    return NextResponse.json({ verified: result.data })
  } catch {
    return NextResponse.json({ verified: false }, { status: 500 })
  }
}
