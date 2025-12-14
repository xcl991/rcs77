import { db } from '@/lib/db'

export async function POST() {
  try {
    const superAdminEmail = 'xcl991'
    const superAdminPassword = 'copolatos123'

    const existingSuperAdmin = await db.user.findUnique({
      where: { email: superAdminEmail }
    })

    if (existingSuperAdmin) {
      return Response.json({ message: 'Super admin user already exists' })
    }

    const superAdmin = await db.user.create({
      data: {
        email: superAdminEmail,
        password: superAdminPassword,
        name: 'Super Administrator',
        role: 'ADMIN',
        isActive: true
      }
    })

    return Response.json({ 
      message: 'Super admin user created successfully',
      superAdmin: {
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role
      }
    })
  } catch (error) {
    console.error('Create super admin error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}