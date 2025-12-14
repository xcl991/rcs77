import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'users':
        const users = await db.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        })
        return Response.json({ users })

      case 'online-users':
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        const onlineUsers = await db.user.findMany({
          where: {
            lastLoginAt: {
              gte: fiveMinutesAgo
            }
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            lastLoginAt: true
          }
        })
        return Response.json({ onlineUsers })

      case 'offline-users':
        const fiveMinutesAgo2 = new Date(Date.now() - 5 * 60 * 1000)
        const offlineUsers = await db.user.findMany({
          where: {
            OR: [
              { lastLoginAt: null },
              { lastLoginAt: { lt: fiveMinutesAgo2 } }
            ]
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            lastLoginAt: true
          }
        })
        return Response.json({ offlineUsers })

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action, email, password, name, role } = await request.json()

    if (action === 'create-user') {
      if (!email || !password) {
        return Response.json({ error: 'Email and password are required' }, { status: 400 })
      }

      const existingUser = await db.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return Response.json({ error: 'User already exists' }, { status: 409 })
      }

      const user = await db.user.create({
        data: {
          email,
          password,
          name,
          role: role || 'USER'
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      })

      return Response.json({ user })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin POST error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { action, userId, whitelistedIPs, blacklistedIPs, isActive } = await request.json()

    if (action === 'update-user-ips') {
      if (!userId) {
        return Response.json({ error: 'User ID is required' }, { status: 400 })
      }

      const user = await db.user.update({
        where: { id: userId },
        data: {
          ...(whitelistedIPs !== undefined && { whitelistedIPs: whitelistedIPs ? JSON.stringify(whitelistedIPs) : null }),
          ...(blacklistedIPs !== undefined && { blacklistedIPs: blacklistedIPs ? JSON.stringify(blacklistedIPs) : null })
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          whitelistedIPs: true,
          blacklistedIPs: true
        }
      })

      return Response.json({ user })
    }

    if (action === 'toggle-user-status') {
      if (!userId) {
        return Response.json({ error: 'User ID is required' }, { status: 400 })
      }

      const user = await db.user.update({
        where: { id: userId },
        data: { isActive },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true
        }
      })

      return Response.json({ user })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin PUT error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    if (action === 'delete-user') {
      if (!userId) {
        return Response.json({ error: 'User ID is required' }, { status: 400 })
      }

      await db.user.delete({
        where: { id: userId }
      })

      return Response.json({ message: 'User deleted successfully' })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin DELETE error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}