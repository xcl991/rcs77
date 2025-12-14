import { db } from '@/lib/db'

async function checkSingleProxy(host: string, port: number, username?: string | null, password?: string | null) {
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000) // 8s timeout

    // Simple connectivity test
    const response = await fetch('http://ip-api.com/json/?fields=status,country,city', {
      signal: controller.signal,
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
    const { userId } = await request.json()

    if (!userId) {
      return Response.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    // Get all proxies for user
    const proxies = await db.proxy.findMany({
      where: { userId }
    })

    if (proxies.length === 0) {
      return Response.json({ success: true, message: 'No proxies to check', total: 0, live: 0, dead: 0 })
    }

    // Mark all as CHECKING first
    await db.proxy.updateMany({
      where: { userId },
      data: { status: 'CHECKING' }
    })

    let live = 0
    let dead = 0

    // Check each proxy
    for (const proxy of proxies) {
      try {
        const result = await checkSingleProxy(proxy.host, proxy.port, proxy.username, proxy.password)

        await db.proxy.update({
          where: { id: proxy.id },
          data: {
            status: result.isLive ? 'LIVE' : 'DEAD',
            lastChecked: new Date(),
            responseTime: result.responseTime,
            country: result.country,
            city: result.city
          }
        })

        if (result.isLive) live++
        else dead++
      } catch (err) {
        await db.proxy.update({
          where: { id: proxy.id },
          data: {
            status: 'DEAD',
            lastChecked: new Date(),
            responseTime: null
          }
        })
        dead++
      }
    }

    return Response.json({
      success: true,
      message: `Checked ${proxies.length} proxies`,
      total: proxies.length,
      live,
      dead
    })
  } catch (error) {
    console.error('Check all proxies error:', error)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
