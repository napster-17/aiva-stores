// src/app/layout.tsx

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { SupabaseProvider } from '@/components/supabase-provider'
import NextTopLoader from 'nextjs-toploader'
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

  return {
    title: {
      default: 'Aiva Stores | Partner Dashboard',
      template: '%s | Aiva Stores'
    },
    description: 'Manage your Kirana store, track inventory, and grow your business with Aiva Stores Partner Dashboard.',
    metadataBase: new URL('https://www.aivastores.com'),
    alternates: {
      canonical: 'https://www.aivastores.com',
    },
    icons: {
      icon: '/assets/logo.png',
      shortcut: '/assets/logo.png',
      apple: '/assets/logo.png',
    },
    openGraph: {
      title: 'Aiva Stores Partner Dashboard',
      description: 'The most advanced digital tool for Indian Kirana stores.',
      url: 'https://www.aivastores.com',
      siteName: 'Aiva Stores',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: '/assets/Aiva-Partner-Dashboard-Featured-Image.png',
          width: 1200,
          height: 630,
          alt: 'Aiva Stores Partner Dashboard',
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
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
  // Protect all dashboard routes
  const isDashboardRoute = pathname.startsWith('/partners/dashboard')
  
  if (isDashboardRoute && !session) {
    redirect('/partners/auth')
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
              "name": "Aiva Stores",
              "url": "https://www.aivastores.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.aivastores.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "description": "Digital dashboard for Aiva Partner Stores to manage billing, inventory, and analytics."
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
          {children}
        </SupabaseProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
