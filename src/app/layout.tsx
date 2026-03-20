// src/app/layout.tsx

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { SupabaseProvider } from '@/components/supabase-provider'
import NextTopLoader from 'nextjs-toploader'
import Header from '@/components/header'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import 'react-day-picker/dist/style.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await getHeaders()
  const host = headersList.get('host') || ''
  const isAdmin = host.startsWith('admin.')

  return {
    title: {
      default: 'GoAiva',
      template: '%s | GoAiva'
    },
    description: 'Empowering local Kirana stores with smart AI technology and fast delivery.',
    keywords: [
      'AIVA Stores', 'GoAiva Customer app', 'AIVA for Partners', 
      'AIVA Partner Dashboard', 'Store Management System', 'Aiva Store Dashboard',
      'Grocery delivery in India', 'fast delivery', 'kirana delivery', 
      'online grocery India', 'local grocery delivery', 'GoAiva', 'Aiva Store App'
    ],
    metadataBase: new URL('https://www.thegoaiva.com'),
    alternates: {
      canonical: 'https://www.thegoaiva.com',
    },
    // ADDED LOGO AS FAVICON HERE
    icons: {
      icon: '/assets/logo.png',
      shortcut: '/assets/logo.png',
      apple: '/assets/logo.png',
    },
    openGraph: {
      title: 'GoAiva - Reinventing Grocery Shopping in India',
      description: 'Order groceries from your local AIVA Stores. Fast, reliable, and convenient.',
      url: 'https://www.thegoaiva.com',
      siteName: 'GoAiva',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: '/assets/Aiva_For_Partners.jpg',
          width: 1200,
          height: 630,
          alt: 'GoAiva - Local Kirana Delivery in India',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'GoAiva - Quick Kirana Delivery',
      description: 'Smart grocery shopping from local Kirana stores.',
      images: ['/assets/Aiva_For_Partners.jpg'],
    },
    robots: {
      index: !isAdmin,
      follow: !isAdmin,
    }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = await getHeaders()
  const pathname = headers.get('x-pathname') || ''
  const host = headers.get('host') || ''
  const isAdmin = host.startsWith('admin.thegoaiva.com')

  const isPublicRoute = pathname.startsWith('/auth') || pathname.startsWith('/verify-otp')

  if (isAdmin && !session && !isPublicRoute) {
    redirect('/auth')
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "GoAiva",
              "url": "https://www.thegoaiva.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.thegoaiva.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "hasPart": [
                { "@type": "WebPage", "name": "About Us", "url": "https://www.thegoaiva.com/about-us" },
                { "@type": "WebPage", "name": "Customer App", "url": "https://www.thegoaiva.com/customer" },
                { "@type": "WebPage", "name": "Partner Program", "url": "https://www.thegoaiva.com/partner" }
              ]
            })
          }}
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#FE8000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-gray-900 m-0 p-0`}
        style={{ margin: 0, padding: 0 }} // Double-check safety
      >

        <NextTopLoader 
          color="#FE8000"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #FE8000,0 0 5px #FE8000"
        />
        <SupabaseProvider>
          {isAdmin && <Header />}
          {children}
        </SupabaseProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
