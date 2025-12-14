import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { username, password, name } = await request.json()

    if (!username || !password) {
      return Response.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return Response.json({ error: 'User already exists' }, { status: 409 })
    }

    const user = await db.user.create({
      data: {
        username,
        password,
        name,
        role: 'USER'
      }
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
    console.error('Registration error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}