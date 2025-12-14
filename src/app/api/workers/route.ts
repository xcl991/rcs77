import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// GET - Get workers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const apiKey = searchParams.get('apiKey')

    // Validate worker by API key (for worker auth)
    if (apiKey) {
      const worker = await prisma.worker.findUnique({
        where: { apiKey },
        include: { user: { select: { id: true, username: true } } }
      })

      if (!worker) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }

      return NextResponse.json({ success: true, worker })
    }

    // Get workers for user dashboard
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const workers = await prisma.worker.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    // Add online status based on lastSeen
    const workersWithStatus = workers.map(worker => ({
      ...worker,
      isOnline: worker.lastSeen &&
        (new Date().getTime() - new Date(worker.lastSeen).getTime()) < 60000 // 1 minute
    }))

    return NextResponse.json({ success: true, workers: workersWithStatus })

  } catch (error: any) {
    console.error('Workers GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new worker
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, apiKey } = body

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'userId and name are required' },
        { status: 400 }
      )
    }

    // Generate API key if not provided
    const finalApiKey = apiKey || `wrk_${crypto.randomBytes(24).toString('hex')}`

    // Check if API key already exists
    const existing = await prisma.worker.findUnique({
      where: { apiKey: finalApiKey }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'API key already exists' },
        { status: 400 }
      )
    }

    const worker = await prisma.worker.create({
      data: {
        userId,
        name,
        apiKey: finalApiKey,
        status: 'OFFLINE'
      }
    })

    return NextResponse.json({ success: true, worker })

  } catch (error: any) {
    console.error('Workers POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update worker
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, status, lastSeen, ipAddress, systemInfo } = body

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (status !== undefined) updateData.status = status
    if (lastSeen !== undefined) updateData.lastSeen = new Date(lastSeen)
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress
    if (systemInfo !== undefined) updateData.systemInfo = systemInfo

    const worker = await prisma.worker.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, worker })

  } catch (error: any) {
    console.error('Workers PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete worker
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    await prisma.worker.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Workers DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
