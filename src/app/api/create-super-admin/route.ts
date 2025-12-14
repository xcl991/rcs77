import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const superAdminUsername = 'xcl991'
    const superAdminPassword = 'copolatos123'

    // Delete existing if any
    await prisma.user.deleteMany({
      where: { username: superAdminUsername }
    })

    // Create fresh
    const superAdmin = await prisma.user.create({
      data: {
        username: superAdminUsername,
        password: superAdminPassword,
        name: 'Super Administrator',
        role: 'ADMIN',
        isActive: true,
        whitelistedIPs: [],
        blacklistedIPs: []
      }
    })

    // Verify
    const count = await prisma.user.count()

    return Response.json({
      message: 'Super admin user created successfully',
      superAdmin: {
        id: superAdmin.id,
        username: superAdmin.username,
        name: superAdmin.name,
        role: superAdmin.role
      },
      totalUsers: count
    })
  } catch (error: any) {
    console.error('Create super admin error:', error)
    return Response.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })
    return Response.json({ users, count: users.length })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
