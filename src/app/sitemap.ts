//src/app/sitemap.ts
import { MetadataRoute } from 'next'

// The sitemap file must be named sitemap.ts or sitemap.js and exported as a default function.

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.thegoaiva.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0, // Highest priority for the homepage
    },
    {
      url: 'https://www.thegoaiva.com/about-us',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.thegoaiva.com/customer',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9, // High priority for key landing pages
    },
    {
      url: 'https://www.thegoaiva.com/partner',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9, // High priority for key landing pages
    },
    {
      url: 'https://www.thegoaiva.com/partner-dashboard',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Include all your Policies pages (using a placeholder for now)
    // NOTE: You should ideally map these dynamically or include all 12 policy URLs here.
    {
      url: 'https://www.thegoaiva.com/policies/customer-terms', // Example policy
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Add other policy pages, and any other public routes here...
  ]
}