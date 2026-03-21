// File: src/app/page.tsx
import { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'Aiva Stores – Digitalize Your Kirana Store Today',
  description: 'The most advanced Partner Dashboard for Indian Kirana stores. Manage digital billing, track inventory, and access real-time sales analytics to scale your business.',
  keywords: [
    'Aiva Stores', 
    'Aiva Partner Dashboard', 
    'Kirana Store Software', 
    'Store Owner Dashboard', 
    'Digital Billing for Kirana', 
    'Inventory Management India', 
    'Aiva Merchant Login', 
    'Kirana Digital Transformation',
    'WhatsApp Invoicing Software',
    'Retail Analytics India'
  ],
  alternates: {
    canonical: 'https://www.aivastores.com',
  },
  openGraph: {
    title: 'Aiva Stores Partner Dashboard | Scale Your Kirana Business',
    description: 'Transform your traditional store into a digital powerhouse. Manage walk-in billing and online orders in one place.',
    url: 'https://www.aivastores.com',
    siteName: 'Aiva Stores',
    images: [
      { 
        url: '/assets/Aiva-Partner-Dashboard-Featured-Image.png', 
        width: 1200, 
        height: 630, 
        alt: 'Aiva Stores Partner Dashboard Interface' 
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aiva Stores – Digitalize Your Kirana Store Today',
    description: 'Empowering Indian retailers with smart billing and inventory tools.',
    images: ['/assets/Aiva-Partner-Dashboard-Featured-Image.png'],
  },
}

export default function Page() {
  return <HomeClient />
}