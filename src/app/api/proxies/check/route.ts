import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { proxyId } = await request.json()

    if (!proxyId) {
      return Response.json({ success: false, error: 'Proxy ID is required' }, { status: 400 })
    }

    // Get proxy
    const proxy = await db.proxy.findUnique({
      where: { id: proxyId }
    })

    if (!proxy) {
      return Response.json({ success: false, error: 'Proxy not found' }, { status: 404 })
    }

    // For now, mark as LIVE (actual checking would require server-side proxy testing)
    // In production, you'd use a proper proxy checker here
    const isLive = true // Placeholder

    await db.proxy.update({
      where: { id: proxyId },
      data: {
        status: isLive ? 'LIVE' : 'DEAD',
        lastChecked: new Date()
      }
    })

    return Response.json({
      success: true,
      status: isLive ? 'LIVE' : 'DEAD',
      message: `Proxy is ${isLive ? 'live' : 'dead'}`
    })
  } catch (error) {
    console.error('Check proxy error:', error)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
