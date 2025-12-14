import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    const whereClause: any = { userId }
    
    if (category && category !== 'all') {
      whereClause.category = category
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { content: { contains: search } },
        { description: { contains: search } }
      ]
    }

    const templates = await db.template.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return Response.json({ templates })
  } catch (error) {
    console.error('Get templates error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, name, content, category, description, tags } = await request.json()

    if (!userId || !name || !content || !category) {
      return Response.json({ error: 'User ID, name, content, and category are required' }, { status: 400 })
    }

    const template = await db.template.create({
      data: {
        userId,
        name,
        content,
        category,
        description,
        tags: tags ? JSON.stringify(tags) : null
      }
    })

    return Response.json({ template })
  } catch (error) {
    console.error('Create template error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, content, category, description, tags, isActive } = await request.json()

    if (!id) {
      return Response.json({ error: 'Template ID is required' }, { status: 400 })
    }

    const template = await db.template.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(content && { content }),
        ...(category && { category }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return Response.json({ template })
  } catch (error) {
    console.error('Update template error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Template ID is required' }, { status: 400 })
    }

    await db.template.delete({
      where: { id }
    })

    return Response.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Delete template error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}