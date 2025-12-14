import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    const proxies = await db.proxy.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return Response.json({ success: true, proxies })
  } catch (error) {
    console.error('Get proxies error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, host, port, username, password, type } = await request.json()

    if (!userId || !host || !port) {
      return Response.json({ error: 'User ID, host, and port are required' }, { status: 400 })
    }

    const proxy = await db.proxy.create({
      data: {
        userId,
        host,
        port,
        username: username || null,
        password: password || null,
        protocol: type || 'HTTP',
        status: 'UNCHECKED'
      }
    })

    return Response.json({ success: true, proxy })
  } catch (error) {
    console.error('Create proxy error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, host, port, username, password, type, status, lastChecked, responseTime, country } = await request.json()

    if (!id) {
      return Response.json({ error: 'Proxy ID is required' }, { status: 400 })
    }

    const proxy = await db.proxy.update({
      where: { id },
      data: {
        ...(host && { host }),
        ...(port && { port }),
        ...(username !== undefined && { username }),
        ...(password !== undefined && { password }),
        ...(type && { protocol: type }),
        ...(status && { status }),
        ...(lastChecked && { lastChecked: new Date(lastChecked) }),
        ...(responseTime !== undefined && { responseTime }),
        ...(country !== undefined && { country })
      }
    })

    return Response.json({ success: true, proxy })
  } catch (error) {
    console.error('Update proxy error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Proxy ID is required' }, { status: 400 })
    }

    await db.proxy.delete({
      where: { id }
    })

    return Response.json({ success: true, message: 'Proxy deleted successfully' })
  } catch (error) {
    console.error('Delete proxy error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}