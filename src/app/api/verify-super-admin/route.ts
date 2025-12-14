import { db } from '@/lib/db'

export async function POST() {
  try {
    const superAdminUsername = 'xcl991'
    const superAdminPassword = 'copolatos123'

    const superAdmin = await db.user.findUnique({
      where: { username: superAdminUsername },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    if (!superAdmin) {
      return Response.json({ error: 'Super admin not found' }, { status: 404 })
    }

    return Response.json({ 
      message: 'Super admin verification successful',
      superAdmin: {
        username: superAdmin.username,
        name: superAdmin.name,
        role: superAdmin.role,
        isActive: superAdmin.isActive,
        createdAt: superAdmin.createdAt
      },
      credentials: {
        username: superAdminUsername,
        password: superAdminPassword
      }
    })
  } catch (error) {
    console.error('Verify super admin error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}