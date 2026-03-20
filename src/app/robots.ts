//src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/customer', '/partner', '/partner-dashboard', '/about-us', '/policies/'],
      disallow: ['/admin/', '/api/', '/auth/', '/verify-otp'],
    },
    sitemap: 'https://www.thegoaiva.com/sitemap.xml',
  }
}