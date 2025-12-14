import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Get tasks (for worker polling or dashboard)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const workerId = searchParams.get('workerId')
    const status = searchParams.get('status')
    const action = searchParams.get('action')

    // Worker polling for pending tasks
    if (action === 'poll' && workerId) {
      // Verify worker exists and is valid
      const worker = await prisma.worker.findUnique({
        where: { id: workerId }
      })

      if (!worker) {
        return NextResponse.json({ error: 'Invalid worker' }, { status: 401 })
      }

      // Update worker last seen
      await prisma.worker.update({
        where: { id: workerId },
        data: { lastSeen: new Date(), status: 'ONLINE' }
      })

      // Get pending tasks for this worker's user
      const task = await prisma.taskQueue.findFirst({
        where: {
          userId: worker.userId,
          status: 'PENDING',
          OR: [
            { workerId: null },
            { workerId: workerId }
          ]
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      })

      if (task) {
        // Mark as processing
        await prisma.taskQueue.update({
          where: { id: task.id },
          data: {
            status: 'PROCESSING',
            workerId: workerId,
            startedAt: new Date()
          }
        })
      }

      return NextResponse.json({ success: true, task })
    }

    // Get tasks for dashboard
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const where: any = { userId }
    if (status) where.status = status

    const tasks = await prisma.taskQueue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ success: true, tasks })

  } catch (error: any) {
    console.error('Tasks GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, payload, priority = 0, workerId } = body

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'userId and type are required' },
        { status: 400 }
      )
    }

    const validTypes = [
      'START_CAMPAIGN',
      'PAUSE_CAMPAIGN',
      'RESUME_CAMPAIGN',
      'STOP_CAMPAIGN',
      'CREATE_SESSION',
      'DELETE_SESSION',
      'CHECK_PROXY',
      'CHECK_ALL_PROXIES'
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid task type. Valid types: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const task = await prisma.taskQueue.create({
      data: {
        userId,
        type,
        payload: payload || {},
        priority,
        workerId,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, task })

  } catch (error: any) {
    console.error('Tasks POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update task (for worker to report completion)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, result, error } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      )
    }

    const updateData: any = { status }

    if (status === 'COMPLETED' || status === 'FAILED') {
      updateData.completedAt = new Date()
    }

    if (result !== undefined) {
      updateData.result = result
    }

    if (error !== undefined) {
      updateData.error = error
    }

    const task = await prisma.taskQueue.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, task })

  } catch (error: any) {
    console.error('Tasks PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete task
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    await prisma.taskQueue.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Tasks DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
