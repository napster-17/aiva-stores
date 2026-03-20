//app/policies/01customer-terms/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image'

const markdown = `
### 1. **Platform Administrative Rights**

Aiva Private Limited (“Aiva”, “we”, or “our”) reserves the right, in its sole discretion, to take any necessary action to protect platform integrity, user experience, and compliance with Indian law.

These actions may include, but are not limited to:

#### A. **Account Suspension or Restriction**

We may temporarily or permanently:

* Suspend or deactivate any customer or store partner account
* Block specific features (e.g., COD access, product uploads, delivery configuration)
* Pause visibility in the customer app or search results

Grounds for such action include:

* Repeated customer complaints or poor order fulfillment
* Suspicious behavior, fraud, or data manipulation
* Violation of our Terms of Use, Privacy Policy, Partner Agreement, or tax rules
* Requests from government bodies or court orders

Aiva may implement such actions without prior notice in cases involving fraud, abuse, or urgent regulatory intervention.

#### B. **Content Moderation Rights**

We may remove, hide, or restrict:

* Product listings that contain misleading, copyrighted, dangerous, or unverifiable content
* Partner-uploaded images or descriptions in violation of our Catalog & IP Usage Policy
* Reviews, ratings, or comments flagged for abuse, harassment, or impersonation

We may also disable or reverse store-side changes that affect user safety or trust, such as:

* Fake discounts
* Inaccurate delivery slots
* Abusive pricing logic

---

### 2. **Service Delivery Disclaimer**

Aiva makes reasonable efforts to ensure uninterrupted access and technical reliability. However, by using the platform, you acknowledge and accept that:

* **App and website availability is not guaranteed** 24/7
* **Server uptime, performance, or payout accuracy may depend on third-party services** such as Supabase, Firebase, Railway, Razorpay, OpenAI, or device-level OS behavior
* You may encounter bugs, sync delays, version conflicts, or intermittent outages — especially during infrastructure upgrades or peak load

Aiva shall not be held liable for:

* Business losses or customer drop-off due to temporary outages
* Technical errors in partner dashboards or analytics views
* Delays in refund processing due to payment gateway failures or national banking holidays

We will make best efforts to restore services quickly and notify you in case of significant disruptions, but we do not offer any uptime guarantee or SLA (Service Level Agreement) to stores or customers.

---

### 3. **AI Assistant And Automation Disclaimer**

Aiva provides access to AI-powered chat assistants for customers and partners, which may offer:

* Product suggestions
* Store recommendations
* Recipes or tips
* Voice-to-text search and reordering support
* In future, AI-powered ordering or inventory tools

While we aim to enhance convenience, you acknowledge and agree that:

* AI responses are generated automatically and may **contain factual errors, incomplete results, or generic advice**
* Aiva does **not guarantee accuracy, legality, or completeness** of any AI content
* The AI is a **support tool**, not a replacement for human decision-making or professional advice
* Any orders placed through AI will still require **final confirmation** by the user

AI chat or voice logs may be temporarily stored and reviewed for improving functionality. Partners and users may request deletion of such data via support.

---

### 4. **Order Fulfillment And Delivery Responsibilities**

Aiva is a **marketplace platform only**. We do not:

* Pack or ship items
* Employ or assign delivery agents
* Control inventory, quality, or delivery timelines

Store partners are **entirely responsible** for:

* Fulfilling accepted orders accurately
* Using their own logistics or agents for delivery
* Ensuring product quality, expiry compliance, and safe packaging
* Managing delivery timing (standard or instant slots)

Aiva’s role is limited to order routing, customer communication, and payout processing (for prepaid orders).

If a customer receives:

* Expired goods
* Wrong quantity or damaged items
* No delivery after order acceptance

The store partner shall be held **fully liable**, and Aiva may:

* Mediate the complaint
* Process refunds or returns
* Apply penalties or delist stores based on pattern of issues

---

### 5. **Cash Handling And Refund Disclaimers**

#### A. **Cash on Delivery (COD)**

Aiva does not handle or track physical cash. Store partners:

* Collect cash directly via their delivery agents
* Are responsible for **marking orders as delivered** promptly
* Must reconcile collected COD amounts via the Aiva dashboard

If COD fraud is detected (e.g., delivered but not marked), Aiva may:

* Penalize the store
* Withhold payouts
* Block future COD access

#### B. **Refund Processing**

Refunds (Prepaid) may be delayed due to:

* Razorpay gateway processing time
* Bank/NACH transfer rules
* Disputes under investigation

Aiva is not liable for refund delays caused by third-party gateways or user bank restrictions. We make best efforts to resolve refunds within standard timeframes.

---

### 6. **Data Handling And Access Rights**

Aiva may store and process user and store partner data to:

* Maintain transaction history and order logs
* Investigate fraud or abuse
* Support technical debugging or customer complaints
* Respond to legal or regulatory requirements

Aiva may:

* Retain non-personal logs (e.g., session IDs, crash reports) for up to 6 months
* Retain transaction records and tax-relevant data as per Indian accounting law
* Share data if required under:

  * Indian IT Act or Consumer Protection Rules
  * GST, FSSAI, or Income Tax Department orders
  * Legal process such as court summons, FIRs, or government directives

We take appropriate measures to ensure security and encryption, and will notify users in case of a major data breach or exposure, as per Indian law.

---

### 7. **Limitation of Liability**

To the fullest extent permitted by applicable law:

* Aiva shall not be liable for any **indirect, incidental, punitive, or consequential damages**, including but not limited to:

  * Business interruption
  * Loss of revenue or goodwill
  * Customer refunds not recoverable
  * Misuse of cash collected via COD

* Aiva’s total legal liability (whether in contract, tort, or otherwise) shall be limited to the **lesser of**:

  * ₹5,000, or
  * The total **platform commission collected** from the store in the **preceding three months**

This limitation applies even if Aiva was advised of the possibility of such damages or losses.

---

### 8. **Governing Law And Jurisdiction**

This disclaimer and all platform policies shall be governed by the laws of **India**. Any dispute arising out of or related to these terms shall be:

* First attempted to be resolved amicably
* If unresolved, subject to binding arbitration under the Arbitration and Conciliation Act, 1996
* The seat and venue of arbitration shall be **Bhopal, Madhya Pradesh**

Subject to arbitration, courts in **Bhopal** shall have exclusive jurisdiction for all legal matters.

---

### 9. **Indemnification**

You agree to indemnify and hold harmless Aiva, its directors, employees, and affiliates from any claims, liabilities, losses, damages, or legal expenses arising from:

* Your use or misuse of the platform
* Violation of platform terms, catalog rules, or local laws
* Third-party claims (e.g., IP rights, delivery disputes, tax claims)

This indemnity survives termination of your account or relationship with Aiva.

---

`

const headings = [
  { id: '1-platform-administrative-rights', label: '1. Platform Administrative Rights' },
  { id: '2-service-delivery-disclaimer', label: '2. Service Delivery Disclaimer' },
  { id: '3-ai-assistant-and-automation-disclaimer', label: '3. AI Assistant And Automation Disclaimer' },
  { id: '4-order-fulfillment-and-delivery-responsibilities', label: '4. Order Fulfillment And Delivery Responsibilities' },
  { id: '5-cash-handling-and-refund-disclaimers', label: '5. Cash Handling And Refund Disclaimers' },
  { id: '6-data-handling-and-access-rights', label: '6. Data Handling And Access Rights' },
  { id: '7-limitation-of-liability', label: '7. Limitation of Liability' },
  { id: '8-governing-law-and-jurisdiction', label: '8. Governing Law And Jurisdiction' },
  { id: '9-indemnification', label: '9. Indemnification' }
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
            Aiva – Admin Rights & Liability
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
