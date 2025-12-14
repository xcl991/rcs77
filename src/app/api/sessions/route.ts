import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    const sessions = await db.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return Response.json({ sessions })
  } catch (error) {
    console.error('Get sessions error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, name, browserData, cookies, userAgent, ipAddress } = await request.json()

    if (!userId || !name) {
      return Response.json({ error: 'User ID and name are required' }, { status: 400 })
    }

    const session = await db.session.create({
      data: {
        userId,
        name,
        browserData,
        cookies,
        userAgent,
        ipAddress,
        status: 'ACTIVE'
      }
    })

    return Response.json({ session })
  } catch (error) {
    console.error('Create session error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status, browserData, cookies } = await request.json()

    if (!id) {
      return Response.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const session = await db.session.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(browserData && { browserData }),
        ...(cookies && { cookies })
      }
    })

    return Response.json({ session })
  } catch (error) {
    console.error('Update session error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Session ID is required' }, { status: 400 })
    }

    await db.session.delete({
      where: { id }
    })

    return Response.json({ message: 'Session deleted successfully' })
  } catch (error) {
    console.error('Delete session error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}