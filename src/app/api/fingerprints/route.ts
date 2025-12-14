import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }

    const fingerprints = await db.fingerprint.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return Response.json({ fingerprints })
  } catch (error) {
    console.error('Get fingerprints error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, name, userAgent, screen, timezone, language, platform, webgl, canvas, audio, fonts, plugins } = await request.json()

    if (!userId || !name || !userAgent || !screen || !timezone || !language || !platform) {
      return Response.json({ error: 'User ID, name, userAgent, screen, timezone, language, and platform are required' }, { status: 400 })
    }

    const fingerprint = await db.fingerprint.create({
      data: {
        userId,
        name,
        userAgent,
        screen,
        timezone,
        language,
        platform,
        webgl,
        canvas,
        audio,
        fonts,
        plugins
      }
    })

    return Response.json({ fingerprint })
  } catch (error) {
    console.error('Create fingerprint error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, userAgent, screen, timezone, language, platform, webgl, canvas, audio, fonts, plugins } = await request.json()

    if (!id) {
      return Response.json({ error: 'Fingerprint ID is required' }, { status: 400 })
    }

    const fingerprint = await db.fingerprint.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(userAgent && { userAgent }),
        ...(screen && { screen }),
        ...(timezone && { timezone }),
        ...(language && { language }),
        ...(platform && { platform }),
        ...(webgl !== undefined && { webgl }),
        ...(canvas !== undefined && { canvas }),
        ...(audio !== undefined && { audio }),
        ...(fonts !== undefined && { fonts }),
        ...(plugins !== undefined && { plugins })
      }
    })

    return Response.json({ fingerprint })
  } catch (error) {
    console.error('Update fingerprint error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Fingerprint ID is required' }, { status: 400 })
    }

    await db.fingerprint.delete({
      where: { id }
    })

    return Response.json({ message: 'Fingerprint deleted successfully' })
  } catch (error) {
    console.error('Delete fingerprint error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}