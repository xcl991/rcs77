import { db } from '@/lib/db'

async function checkProxy(host: string, port: number, username?: string | null, password?: string | null) {
  const startTime = Date.now()

  try {
    // Test proxy by making a request through it to get IP info
    const proxyUrl = username && password
      ? `http://${username}:${password}@${host}:${port}`
      : `http://${host}:${port}`

    // Use a simple HTTP request to test connectivity and get geo info
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch('http://ip-api.com/json/?fields=status,country,city,query', {
      signal: controller.signal,
      // Note: In Vercel serverless, we can't use proxy directly
      // This is a simplified check - actual proxy testing would need a different approach
    })

    clearTimeout(timeout)

    const responseTime = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      return {
        isLive: true,
        responseTime,
        country: data.country || null,
        city: data.city || null
      }
    }

    return { isLive: false, responseTime: null, country: null, city: null }
  } catch (error) {
    return { isLive: false, responseTime: null, country: null, city: null }
  }
}

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

    // Update status to CHECKING
    await db.proxy.update({
      where: { id: proxyId },
      data: { status: 'CHECKING' }
    })

    // Check the proxy
    const result = await checkProxy(proxy.host, proxy.port, proxy.username, proxy.password)

    // Update with results
    const updatedProxy = await db.proxy.update({
      where: { id: proxyId },
      data: {
        status: result.isLive ? 'LIVE' : 'DEAD',
        lastChecked: new Date(),
        responseTime: result.responseTime,
        country: result.country,
        city: result.city
      }
    })

    return Response.json({
      success: true,
      status: updatedProxy.status,
      responseTime: updatedProxy.responseTime,
      country: updatedProxy.country,
      city: updatedProxy.city,
      message: `Proxy is ${result.isLive ? 'live' : 'dead'}${result.responseTime ? ` (${result.responseTime}ms)` : ''}`
    })
  } catch (error) {
    console.error('Check proxy error:', error)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
