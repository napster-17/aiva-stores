//src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/policies/'],
      disallow: ['/api/', '/partners/dashboard', '/partners/verify-otp'],
    },
    sitemap: 'https://www.aivastores.com/sitemap.xml',
  }
}