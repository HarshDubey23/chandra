import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Clear cached client if it doesn't have the latest models (force fresh after schema changes)
const cachedClient = globalForPrisma.prisma
if (cachedClient && typeof (cachedClient as any).department === 'undefined') {
  // Schema changed — discard stale client
  globalForPrisma.prisma = undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db