import { db } from '@/lib/db'

export async function POST() {
  try {
    // Buat super admin baru
    const superAdminUsername = 'xcl991'
    const superAdminPassword = 'copolatos123'

    const existingSuperAdmin = await db.user.findUnique({
      where: { username: superAdminUsername }
    })

    if (existingSuperAdmin) {
      return Response.json({ message: 'Super admin user already exists' })
    }

    const superAdmin = await db.user.create({
      data: {
        username: superAdminUsername,
        password: superAdminPassword,
        name: 'Super Administrator',
        role: 'ADMIN',
        isActive: true
      }
    })

    return Response.json({ 
      message: 'Super admin user created successfully',
      superAdmin: {
        username: superAdmin.username,
        name: superAdmin.name,
        role: superAdmin.role
      }
    })
  } catch (error) {
    console.error('Create super admin error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}