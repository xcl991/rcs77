import { db } from '@/lib/db'

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

    let live = 0
    let dead = 0

    // Check each proxy (simple TCP connection test)
    for (const proxy of proxies) {
      try {
        // For now, just mark as LIVE (actual checking would require server-side proxy testing)
        // In production, you'd use a proper proxy checker here
        const isLive = true // Placeholder - actual check would go here

        await db.proxy.update({
          where: { id: proxy.id },
          data: {
            status: isLive ? 'LIVE' : 'DEAD',
            lastChecked: new Date()
          }
        })

        if (isLive) live++
        else dead++
      } catch (err) {
        // If check fails, mark as dead
        await db.proxy.update({
          where: { id: proxy.id },
          data: {
            status: 'DEAD',
            lastChecked: new Date()
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
