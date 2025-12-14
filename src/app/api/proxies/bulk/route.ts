import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { userId, proxies } = await request.json()

    if (!userId || !proxies || !Array.isArray(proxies)) {
      return Response.json({ error: 'User ID and proxies array are required' }, { status: 400 })
    }

    if (proxies.length === 0) {
      return Response.json({ error: 'No proxies to add' }, { status: 400 })
    }

    const createdProxies = await db.proxy.createMany({
      data: proxies.map((proxy: any) => ({
        userId,
        host: proxy.host,
        port: proxy.port,
        username: proxy.username || null,
        password: proxy.password || null,
        protocol: proxy.type || 'HTTP',
        status: 'UNCHECKED'
      }))
    })

    return Response.json({
      message: `Successfully added ${createdProxies.count} proxies`,
      count: createdProxies.count
    })
  } catch (error) {
    console.error('Bulk add proxies error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
