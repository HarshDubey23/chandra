// Server-Sent Events (SSE) — real-time complaint updates for the admin dashboard.
// Polls the database every 3 seconds for new / updated complaints and emits
// `complaint:new` and `complaint:updated` events to connected admin browsers.
//
// The admin ComplaintManager subscribes to this stream via EventSource and
// prepends new complaints to its list + shows a toast notification.
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder()
  // Start 30 seconds ago so we don't immediately re-fire all recent complaints
  let lastNewCheck = new Date(Date.now() - 30_000)
  let lastUpdateCheck = new Date(Date.now() - 30_000)

  const stream = new ReadableStream({
    async start(controller) {
      // Hello event so the client knows the stream is alive
      controller.enqueue(
        encoder.encode(`event: hello\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`),
      )

      // Initial snapshot of the current complaint count
      try {
        const total = await db.complaint.count()
        controller.enqueue(
          encoder.encode(`event: snapshot\ndata: ${JSON.stringify({ total, ts: Date.now() })}\n\n`),
        )
      } catch {
        /* ignore */
      }

      const interval = setInterval(async () => {
        try {
          // New complaints (created since last check)
          const newComplaints = await db.complaint.findMany({
            where: { createdAt: { gt: lastNewCheck } },
            take: 20,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              trackingId: true,
              callerName: true,
              callerPhone: true,
              callReason: true,
              category: true,
              status: true,
              assignedToId: true,
              resolutionNote: true,
              createdAt: true,
              updatedAt: true,
              resolvedAt: true,
            },
          })

          // Updated complaints (status changed) — exclude ones that are brand new
          const updatedComplaints = await db.complaint.findMany({
            where: {
              updatedAt: { gt: lastUpdateCheck },
              createdAt: { lte: lastUpdateCheck },
            },
            take: 20,
            orderBy: { updatedAt: 'desc' },
            select: {
              id: true,
              trackingId: true,
              callerName: true,
              callerPhone: true,
              callReason: true,
              category: true,
              status: true,
              assignedToId: true,
              resolutionNote: true,
              createdAt: true,
              updatedAt: true,
              resolvedAt: true,
            },
          })

          lastNewCheck = new Date()
          lastUpdateCheck = new Date()

          if (newComplaints.length > 0) {
            controller.enqueue(
              encoder.encode(`event: complaint:new\ndata: ${JSON.stringify(newComplaints)}\n\n`),
            )
          }
          if (updatedComplaints.length > 0) {
            controller.enqueue(
              encoder.encode(`event: complaint:updated\ndata: ${JSON.stringify(updatedComplaints)}\n\n`),
            )
          }
        } catch {
          // ignore transient DB errors — keep stream alive
        }
      }, 3_000) // 3-second poll interval

      // Heartbeat every 25s to keep connection alive through proxies
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`))
        } catch {
          /* closed */
        }
      }, 25_000)

      const cleanup = () => {
        clearInterval(interval)
        clearInterval(heartbeat)
        try { controller.close() } catch { /* already closed */ }
      }
      _req.signal.addEventListener('abort', cleanup, { once: true })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
