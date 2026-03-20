//app/policies/01customer-terms/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image'

const markdown = `
### 1. **Why This Policy Exists**

At Aiva, we want to make listing products easy and fast for every store — whether you're uploading items one by one or choosing from our shared global catalog.

But with that flexibility comes a shared responsibility.

This policy ensures:

* Everyone knows what content can be shared, edited, or reused
* No one uploads or uses copyrighted images or brand material without rights
* Our platform (and your store) stays safe from takedown complaints, legal issues, or platform penalties

We’re not here to restrict you — we’re here to **protect you**, your fellow store partners, and the future of this platform.

---

### 2. **Who This Policy Applies To**

This policy applies to **all store partners on Aiva** who:

* List products manually or via the global catalog
* Upload any product image, title, brand, description, or category
* View or use content uploaded by other partners

This includes:

* Your store’s custom listings
* All content auto-filled or suggested by Aiva’s backend
* Shared items visible to other partners inside the catalog search tool

Even if you're uploading just one product — this policy still applies.

---

### 3. **Using Aiva’s Global Catalog**

To save time, Aiva offers a shared product catalog. It contains:

* Common grocery items with pre-filled names, categories, and base images
* Suggested weight/size options and generic brand labels (e.g., “Refined Oil – 1L”)
* Listings contributed by other stores, reviewed and tagged by our backend team

#### As a partner, you can:

* Select items from the catalog and list them instantly
* Edit product titles, prices, images, descriptions, and quantities to match your store’s offer
* Set your own discounts, delivery fees, and stock levels

#### But you **cannot**:

* Claim exclusive rights over shared catalog entries
* Copy listings from another store’s live page manually
* Use the shared listing to impersonate a brand, modify logos, or mimic a franchise chain

The global catalog is here to help everyone grow faster — not to give one store an edge over another.

Aiva retains the platform rights to the master catalog (unless a store uploads private content, which we’ll cover in the next section).

---

### 4. **Uploading Custom Product Listings**

We understand that not all stores want to use generic listings. That’s why we allow you to upload your own custom products, including:

* Your own product name and description
* Original photos clicked at your store
* Custom pricing, pack sizes, or local variants

When you do this:

* Your listing is saved under your store dashboard
* It may also become searchable by other stores in Aiva’s global catalog

Why? Because sharing listings helps newer stores onboard faster — and saves time for everyone.

If you'd like to keep a listing **private**, you’ll need to use a “Do Not Share” tag (if that feature is introduced in the future). Otherwise, the content may be reused (but never copied 100%) by other partners.

---

### 5. **Who Owns Uploaded Content**

When you upload a product — text or image — you confirm that:

* You either **own the content** or have **legal permission to use it**
* It doesn’t violate any **copyrights, trademarks, or brand usage policies**
* It wasn’t taken from packaging, Google Images, a company website, or another store’s app

If you upload something you don’t have rights to, and it’s reported:

* Aiva may take it down immediately
* You may receive a warning, or your listing privileges may be limited
* The brand owner (or their lawyer) may contact you directly
* Repeat violations may lead to permanent suspension or legal action

You are solely responsible for anything you upload to your store or the shared catalog.

---

### 6. **Content Licensing Terms**

By uploading content to Aiva, you give us permission to:

* Use your product listing across the Aiva app
* Allow other stores to reuse or adapt the product (title, weight, etc.)
* Feature your content in search results, marketing, or internal recommendations

This permission is:

* **Non-exclusive** (you still own your store listing)
* **Royalty-free** (you won’t be paid for shared use)
* **Worldwide and perpetual** (until you remove it or close your account)
* **Sub-licensable** (Aiva can use it in future app versions or AI models)

You waive any claim for payment or exclusive rights unless you notify Aiva in writing before upload.

---

### 7. **Moderation And Content Removal**

To keep Aiva safe, clean, and legally compliant, we actively monitor product listings and catalog content. This includes:

* Reviewing images, product titles, and brand claims
* Using automated tools and manual checks to catch misuse
* Responding quickly to takedown requests or community flags

Aiva may remove or edit any content that:

* Is misleading, offensive, or spam
* Misuses a brand name, image, or trademark
* Has fake prices, weight/pack mismatches, or dangerous claims (e.g., “100% safe for kids”)
* Violates Indian law or platform policy

We do not guarantee prior warning before takedowns — especially for clear IP violations.

Partners may also be penalized for:

* Repeated upload of illegal or copied content
* Using brand names deceptively to drive traffic
* Uploading celebrity photos, logos, or packaging without rights

---

### 8. **Reporting And Dispute Resolution**

If your content is being misused by another partner, you may raise a complaint through:

* In-app support (“Catalog Issue” category), or
* Email to our designated content moderation team

To review a claim, Aiva may ask for:

* Screenshots
* Upload timestamps
* Proof of original ownership (e.g., photo metadata)

We aim to:

* Investigate impartially
* Take action within 3–5 business days
* Resolve most catalog disputes without legal escalation

Final decisions rest with Aiva’s internal compliance team, unless overruled by court or government authority.

---

### 9. **Policy Changes And Your Rights**

This policy may change as:

* Our catalog expands
* New tools like AI tagging or image verification are introduced
* We receive feedback from partners or legal experts

Updates will be:

* Published inside the Partner App
* Marked with a new “Effective Date”
* Considered accepted when you continue to upload or modify listings after the update

You may opt out of catalog participation only by closing your Partner account.

---

### 10. **Contact Us**

For catalog complaints, IP concerns, or takedown requests:

**Company Name:** Aiva Stores Private Limited

**Registered Address:** Plot No. 287-A, Goyal Homes, G-2, Sec-B, Shahpura, Bhopal, Madhya Pradesh 462016

**Support Email:** \info@thegoaiva.com

**Support Timing:** Monday to Saturday, 10:00 AM – 6:00 PM IST (excluding public holidays)

---


`
const headings = [
  { id: '1-why-this-policy-exists', label: '1. Why This Policy Exists' },
  { id: '2-who-this-policy-applies-to', label: '2. Who This Policy Applies To' },
  { id: '3-using-aivas-global-catalog', label: '3. Using Aiva’s Global Catalog' },
  { id: '4-uploading-custom-product-listings', label: '4. Uploading Custom Product Listings' },
  { id: '5-who-owns-uploaded-content', label: '5. Who Owns Uploaded Content' },
  { id: '6-content-licensing-terms', label: '6. Content Licensing Terms' },
  { id: '7-moderation-and-content-removal', label: '7. Moderation And Content Removal' },
  { id: '8-reporting-and-dispute-resolution', label: '8. Reporting And Dispute Resolution' },
  { id: '9-policy-changes-and-your-rights', label: '9. Policy Changes And Your Rights' },
  { id: '10-contact-us', label: '10. Contact Us' },
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
            Aiva – Partner Catalog & IP
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
                  <h1
                    id="1-why-this-policy-exists"
                    className="text-4xl font-bold text-gray-900 scroll-mt-24"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    id="2-types-of-orders"
                    className="text-3xl font-bold text-gray-700 scroll-mt-24"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    id="3-your-ledger-explained"
                    className="text-2xl font-semibold text-gray-700 scroll-mt-24"
                    {...props}
                  />
                ),
                // Add other headers similarly for h4, h5, etc.
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