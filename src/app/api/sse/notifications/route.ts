// Server-Sent Events (SSE) for live notification updates.
// P1 from master improvement doc §4.4 Layer 3.
// Pushes new complaints + announcements to connected admin browsers.
// Clients connect via EventSource on '/api/sse/notifications'.
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()
  let lastCheck = new Date(Date.now() - 60_000) // start 1 min ago

  const stream = new ReadableStream({
    async start(controller) {
      // Send a hello event so the client knows the stream is alive
      controller.enqueue(encoder.encode(`event: hello\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`))

      const interval = setInterval(async () => {
        try {
          // New complaints since last check
          const newComplaints = await db.complaint.findMany({
            where: { createdAt: { gt: lastCheck } },
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: { trackingId: true, callerName: true, category: true, status: true, createdAt: true },
          })
          // New announcements since last check
          const newAnnouncements = await db.announcement.findMany({
            where: { createdAt: { gt: lastCheck } },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, titleHi: true, titleEn: true, pinned: true, createdAt: true },
          })
          // Updated complaints (status changes) since last check
          const updatedComplaints = await db.complaint.findMany({
            where: { updatedAt: { gt: lastCheck }, createdAt: { lte: lastCheck } },
            take: 10,
            orderBy: { updatedAt: 'desc' },
            select: { trackingId: true, status: true, updatedAt: true },
          })

          lastCheck = new Date()

          if (newComplaints.length > 0) {
            controller.enqueue(encoder.encode(`event: complaint-new\ndata: ${JSON.stringify(newComplaints)}\n\n`))
          }
          if (updatedComplaints.length > 0) {
            controller.enqueue(encoder.encode(`event: complaint-update\ndata: ${JSON.stringify(updatedComplaints)}\n\n`))
          }
          if (newAnnouncements.length > 0) {
            controller.enqueue(encoder.encode(`event: announcement-new\ndata: ${JSON.stringify(newAnnouncements)}\n\n`))
          }
        } catch {
          // ignore transient DB errors — keep stream alive
        }
      }, 10_000) // poll every 10s

      // Heartbeat every 30s to keep connection alive through proxies
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`))
        } catch {
          /* closed */
        }
      }, 30_000)

      // Clean up on abort
      const cleanup = () => {
        clearInterval(interval)
        clearInterval(heartbeat)
        try { controller.close() } catch { /* already closed */ }
      }
      req.signal.addEventListener('abort', cleanup, { once: true })
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
