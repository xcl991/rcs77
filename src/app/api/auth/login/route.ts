import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return Response.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { username }
    })

    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!user.isActive) {
      return Response.json({ error: 'Account is inactive' }, { status: 401 })
    }

    const isPasswordValid = password === user.password

    if (!isPasswordValid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    return Response.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}