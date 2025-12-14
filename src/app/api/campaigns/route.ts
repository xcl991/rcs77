import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    const campaigns = await db.campaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return Response.json({ campaigns })
  } catch (error) {
    console.error('Get campaigns error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, name, description, templateId, contactIds, settings } = await request.json()

    if (!userId || !name) {
      return Response.json({ error: 'User ID and name are required' }, { status: 400 })
    }

    const campaign = await db.campaign.create({
      data: {
        userId,
        name,
        description,
        templateId,
        contactIds: contactIds ? JSON.stringify(contactIds) : null,
        settings: settings ? JSON.stringify(settings) : null,
        status: 'DRAFT'
      }
    })

    return Response.json({ campaign })
  } catch (error) {
    console.error('Create campaign error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, description, status, templateId, contactIds, settings, results } = await request.json()

    if (!id) {
      return Response.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    const campaign = await db.campaign.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(templateId !== undefined && { templateId }),
        ...(contactIds !== undefined && { contactIds: contactIds ? JSON.stringify(contactIds) : null }),
        ...(settings !== undefined && { settings: settings ? JSON.stringify(settings) : null }),
        ...(results !== undefined && { results: results ? JSON.stringify(results) : null })
      }
    })

    return Response.json({ campaign })
  } catch (error) {
    console.error('Update campaign error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    await db.campaign.delete({
      where: { id }
    })

    return Response.json({ message: 'Campaign deleted successfully' })
  } catch (error) {
    console.error('Delete campaign error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}