import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    const accounts = await db.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return Response.json({ accounts })
  } catch (error) {
    console.error('Get accounts error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, platform, username, email, password, cookies, notes } = await request.json()

    if (!userId || !platform || !username) {
      return Response.json({ error: 'User ID, platform, and username are required' }, { status: 400 })
    }

    const account = await db.account.create({
      data: {
        userId,
        platform,
        username,
        email,
        password,
        cookies,
        notes,
        status: 'ACTIVE'
      }
    })

    return Response.json({ account })
  } catch (error) {
    console.error('Create account error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, platform, username, email, password, cookies, status, lastLogin, notes } = await request.json()

    if (!id) {
      return Response.json({ error: 'Account ID is required' }, { status: 400 })
    }

    const account = await db.account.update({
      where: { id },
      data: {
        ...(platform && { platform }),
        ...(username && { username }),
        ...(email !== undefined && { email }),
        ...(password !== undefined && { password }),
        ...(cookies !== undefined && { cookies }),
        ...(status && { status }),
        ...(lastLogin && { lastLogin }),
        ...(notes !== undefined && { notes })
      }
    })

    return Response.json({ account })
  } catch (error) {
    console.error('Update account error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Account ID is required' }, { status: 400 })
    }

    await db.account.delete({
      where: { id }
    })

    return Response.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Delete account error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}