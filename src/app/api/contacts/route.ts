import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const group = searchParams.get('group')
    const search = searchParams.get('search')

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    const whereClause: any = { userId, isActive: true }
    
    if (group && group !== 'all') {
      whereClause.groups = { contains: group }
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { company: { contains: search } }
      ]
    }

    const contacts = await db.contact.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return Response.json({ contacts })
  } catch (error) {
    console.error('Get contacts error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, name, email, phone, company, position, groups, tags, notes } = await request.json()

    if (!userId || !name) {
      return Response.json({ error: 'User ID and name are required' }, { status: 400 })
    }

    const contact = await db.contact.create({
      data: {
        userId,
        name,
        email,
        phone,
        company,
        position,
        groups: groups ? JSON.stringify(groups) : null,
        tags: tags ? JSON.stringify(tags) : null,
        notes
      }
    })

    return Response.json({ contact })
  } catch (error) {
    console.error('Create contact error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, email, phone, company, position, groups, tags, notes, isActive } = await request.json()

    if (!id) {
      return Response.json({ error: 'Contact ID is required' }, { status: 400 })
    }

    const contact = await db.contact.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(company !== undefined && { company }),
        ...(position !== undefined && { position }),
        ...(groups !== undefined && { groups: groups ? JSON.stringify(groups) : null }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
        ...(notes !== undefined && { notes }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return Response.json({ contact })
  } catch (error) {
    console.error('Update contact error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Contact ID is required' }, { status: 400 })
    }

    await db.contact.delete({
      where: { id }
    })

    return Response.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    console.error('Delete contact error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}