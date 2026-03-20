//app/policies/01customer-terms/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image'

const markdown = `
### 1. **Why This Disclosure Matters**

This Cookie & Tracking Disclosure explains how Aiva Private Limited (“Aiva”, “we”, or “our”) uses cookies and similar tracking technologies when you:

* Visit our website
* Use the Aiva customer or partner app
* Interact with our services, search tools, AI chatbot, or partner dashboards

We are committed to protecting your privacy and ensuring that all data we collect is used **lawfully, transparently, and securely** — to improve your experience, not invade it.

By using Aiva, you agree to our use of cookies and tracking tools as described in this disclosure, unless you choose to opt out (where applicable).

---

### 2. **What Types of Tracking We Use**

Aiva uses a combination of browser, app-level, and server-side tracking tools. These include:

#### A. **Cookies**

Small files stored on your browser to remember:

* Your login session
* Cart history
* Recently viewed products
* Selected language, city, or app settings

#### B. **Device Identifiers**

Unique codes from your phone/tablet used to:

* Prevent fraud and fake accounts
* Ensure safe logins
* Match your notifications and preferences

#### C. **IP Address Logging**

We store your IP address temporarily to:

* Detect duplicate/fraud accounts
* Show stores near your current region
* Prevent suspicious activity or abuse of referral codes

#### D. **GPS & Location Services**

When enabled, your device’s location helps:

* Show you the nearest stores and delivery slots
* Automatically calculate delivery charges or eligibility
* Match store inventories to your real-time location

You may disable GPS anytime, but key features may stop working.

#### E. **Session Tokens**

These temporary codes keep you logged in as you navigate across app screens — preventing re-authentication every few clicks.

#### F. **Local Storage & App Cache**

This helps the app load faster by storing small bits of data on your device — like your most used delivery address or filter settings.

#### G. **Crash Logs & Diagnostics**

If your app crashes or slows down, we automatically log the error type, your device model, and what action caused the failure — nothing personal is shared, but this helps our tech team fix bugs quickly.

---

### 3. **Why We Use Tracking Technologies**

We use tracking tools for several essential reasons. These technologies help us:

#### A. **Keep Your Account Secure**

* Prevent unauthorized logins
* Detect bot traffic, script abuse, or unusual login behavior
* Track session timeouts to reduce security risks

#### B. **Show You Relevant Stores & Offers**

* Match your location to nearby kirana stores
* Automatically show stores that deliver to your area
* Display store-wise offers, delivery fees, and stock availability based on region

#### C. **Improve App Speed & User Experience**

* Cache your recent activity (e.g., cart, search filters)
* Speed up reloading of stores or product pages
* Save your app settings like language, delivery address, etc.

#### D. **Detect Fraud or Abuse**

* Prevent referral scams using fake accounts
* Identify stores or customers who repeatedly misuse COD or cancel orders
* Enforce limits on excessive retries, order spam, or bot scraping

#### E. **Personalize the Platform**

* Show smarter suggestions in search or “Recommended for You”
* Rank stores based on your order history and preferences
* Enable AI-driven tips, chat replies, and personalized reordering

#### F. **Fix Bugs & Improve Features**

* Analyze crash logs to detect patterns across Android/iOS versions
* Track how long features are used (e.g., new catalog tools or delivery slot setup)
* Test improvements using A/B logic (e.g., store visibility layout or homepage banners)

None of this data is sold. We use it **only to enhance the platform** and keep it safe for all users.

---

### 4. **Third-Party Tracking Tools We Use**

Aiva works with a few trusted third-party providers who also use limited tracking to operate effectively:

#### A. **Google Firebase / Analytics**

* Collects anonymized performance and crash data
* Helps us see app usage patterns (e.g., popular screens, navigation paths)

#### B. **Razorpay**

* Tracks payment methods, fraud risk signals, and checkout timing
* Required for PCI compliance and refund processing
* May collect metadata like device/browser used during payment

#### C. **OpenAI (for AI Chat & Assistant)**

* When you use the AI assistant, your messages may be analyzed to improve future suggestions
* We may store or tag certain conversations for quality review
* In the future, AI may also track item reordering patterns or voice queries

#### D. **Supabase / Railway (backend and logs)**

* Logs session IDs, location zones, app uptime
* Stores your dashboard activity for support and audit purposes

Each provider follows their own privacy policy and legal compliance. Aiva ensures that all vendors used:

* Are under data processing agreements (DPAs)
* Follow Indian IT laws and applicable global standards (e.g., ISO, SOC 2, GDPR-aligned where possible)

---

### 5. **Your Controls And Opt-Out Options**

At Aiva, we believe in user choice. Here’s what you can control:

#### A. **Location Sharing**

* You may turn off GPS/location access from your device settings anytime
* If disabled, features like store discovery, delivery fee estimation, and serviceability checks may stop working
* You can also manually enter a delivery area instead

#### B. **Cookies (Web)**

* If you access Aiva through a browser, you can:

  * Clear cookies anytime from your browser settings
  * Block new cookies using incognito/private mode
  * Note: doing so may log you out or disable cart/session memory

#### C. **Push Notifications**

* You may disable app notifications at any time via Android/iOS settings
* This will stop order updates, delivery alerts, and promotional messages

#### D. **AI Chat & Personalization**

* You may request deletion of your AI conversation history by contacting support
* You may also choose not to use AI assistant features — this will not affect order functionality

#### E. **Ad Personalization (Future Feature)**

* When we launch sponsored offers or personalized ads, you’ll have the option to opt out of ad targeting from your profile settings

---

### 6. **Data Retention And Privacy Standards**

We retain different types of tracking data for limited periods, based on usage:

| Data Type               | Retention Period | Purpose                           |
| ----------------------- | ---------------- | --------------------------------- |
| Session logs            | 30 days          | Security, fraud detection         |
| Location data           | 7–10 days        | Delivery routing, store discovery |
| Device metadata         | 90 days          | Bug reports, analytics            |
| AI chat logs (optional) | Up to 6 months   | Feature improvement, suggestions  |
| Crash diagnostics       | 60–90 days       | Tech support, platform stability  |

All data is encrypted at rest and securely stored on **Supabase** servers, with additional monitoring by Aiva’s backend team.

---

### 7. **Need Help or Want to Opt Out?**

If you:

* Want to opt out of any specific tracking (where possible)
* Want to request deletion of location, chat, or analytics data
* Have a concern about how your data is used

Please contact our privacy team:

**Company Name:** Aiva Stores Private Limited

**Registered Address:** Plot No. 287-A, Goyal Homes, G-2, Sec-B, Shahpura, Bhopal, Madhya Pradesh 462016

**Support Email:** \info@thegoaiva.com

**Support Timing:** Monday to Saturday, 10:00 AM – 6:00 PM IST (excluding public holidays)

We’re committed to protecting your rights while building the most helpful, fair, and transparent grocery platform for local communities.

---

`

const headings = [
  { id: '1-why-this-disclosure-matters', label: '1. Why This Disclosure Matters' },
  { id: '2-what-types-of-tracking-we-use', label: '2. What Types of Tracking We Use' },
  { id: '3-why-we-use-tracking-technologies', label: '3. Why We Use Tracking Technologies' },
  { id: '4-third-party-tracking-tools-we-use', label: '4. Third-Party Tracking Tools We Use' },
  { id: '5-your-controls-and-opt-out-options', label: '5. Your Controls And Opt-Out Options' },
  { id: '6-data-retention-and-privacy-standards', label: '6. Data Retention And Privacy Standards' },
  { id: '7-need-help-or-want-to-opt-out', label: '7. Need Help or Want to Opt Out?' },
]


export default function CustomerTermsPage() {
  const [showTocMobile, setShowTocMobile] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const toggle = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', toggle)
    return () => window.removeEventListener('scroll', toggle)
  }, [])

  return (
    <div className="relative">
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-6 py-10 gap-10">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-64 sticky top-24 self-start text-left">
          <div className="flex flex-col items-start mb-6">
            <Image
              src="/assets/logo.png"
              alt="Aiva Logo"
              width={40}
              height={40}
              className="mb-2 cursor-pointer"
              onClick={() => (window.location.href = 'https://thegoaiva.com')}
            />
            <h3 className="text-base font-semibold text-gray-800 mb-4">Jump to Section</h3>
            <ul className="text-sm space-y-3 text-gray-600">
              {headings.map(({ id, label }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="hover:underline"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Mobile TOC Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setShowTocMobile(!showTocMobile)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded mb-2"
            >
              {showTocMobile ? 'Hide Sections' : 'Jump to Section'}
            </button>
            {showTocMobile && (
              <ul className="text-sm space-y-2 text-gray-600">
                {headings.map(({ id, label }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="block hover:underline"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-2">
            Aiva – Cookie & Tracking
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-8">
            Last updated: July 2025 ·{' '}
            <button
              onClick={() => (window.location.href = 'https://thegoaiva.com')}
              className="text-orange-600 hover:underline"
            >
              thegoaiva.com
            </button>
          </p>

          <div className="prose max-w-none space-y-6 prose-slate dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-4xl font-bold text-gray-900 scroll-mt-24" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-3xl font-bold text-gray-700 scroll-mt-24" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-2xl font-semibold text-gray-700 scroll-mt-24" {...props} />
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </main>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-5 right-5 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-orange-600"
        >
          ↑ Top
        </button>
      )}
    </div>
  )
}
