import type { MetadataRoute } from 'next'

/**
 * robots.ts — crawler directives (Phase 5)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://chandra-gp.in/sitemap.xml',
    host: 'https://chandra-gp.in',
  }
}
