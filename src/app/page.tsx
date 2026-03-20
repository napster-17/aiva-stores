// File: src/app/page.tsx
import { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'Aiva Stores – India’s Trusted Kirana Delivery Ecosystem',
  description: 'Shop from your trusted local kirana store at the real price. GoAiva is the smartest grocery delivery app for hyperlocal savings and reliable service.',
  keywords: [
    'AIVA Stores', 'GoAiva Customer app', 'AIVA for Partners', 
    'Grocery delivery in India', 'fast delivery', 'kirana delivery', 
    'online grocery India', 'local grocery delivery', 'GoAiva', 'Aiva Store App'
  ],
  alternates: {
    canonical: 'https://www.thegoaiva.com',
  },
  openGraph: {
    title: 'GoAiva - Reinventing Grocery Shopping in India',
    description: 'Order groceries from your local AIVA Stores. Fast, reliable, and convenient.',
    url: 'https://www.thegoaiva.com',
    images: [{ url: '/assets/Aiva_For_Partners.jpg', width: 1200, height: 630, alt: 'Aiva Stores Partner Ecosystem' }],
  },
}

export default function Page() {
  return <HomeClient />
}