//app/policies/01customer-terms/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image'

const markdown = `

### 1. **Introduction**

Welcome to **Aiva**, an online marketplace platform that enables users (“You” or “Customers”) to discover and place orders for groceries and other goods from nearby local stores (“Store Partners”) via our mobile application (“App”) or website. These Terms & Conditions (“Terms”) constitute a legally binding agreement between you and **Aiva Private Limited** (“Aiva”, “We”, “Us”, “Our”).

By accessing, browsing, or using the Aiva app or website, you acknowledge that you have read, understood, and agree to be bound by these Terms, along with our Privacy Policy and other related policies.

If you do not agree to these Terms, you must not access or use our services.

---

### 2. **Eligibility & Account Registration**

To use the Aiva app and place orders, you must:

* Be at least 18 years old, or the age of legal majority in your jurisdiction
* Provide accurate and complete personal details including your name, phone number, and delivery address
* Register via your phone number, email ID, or a supported third-party login (e.g., Google)

You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Aiva will not be liable for any losses arising from unauthorized use of your account.

---

### 3. **Platform Role & Disclaimer**

Aiva acts solely as a **technology platform** to facilitate transactions between customers and independent Store Partners. We do not own, sell, or deliver any goods listed on the platform.

All products, pricing, availability, and delivery services are provided by Store Partners at their sole discretion and responsibility. Aiva is not liable for:

* Product quality, stock, or expiration
* Offers, discounts, or product pricing shown by the store
* Delays, non-fulfillment, or misconduct by delivery agents employed by Store Partners
* Any tax liability of Store Partners including GST or local levies

While we work to ensure a smooth and secure experience, **Aiva does not guarantee the accuracy, completeness, or reliability** of listings, store offers, or order fulfillment.

---

### 4. **Order Placement & Acceptance**

Once you place an order on the Aiva app:

* The selected Store Partner will receive the order and have up to **10 minutes** to accept or reject it.
* If the store **manually rejects** the order or **fails to respond within 10 minutes**, the order will be **automatically cancelled**.

For **prepaid orders**, a full refund will be initiated in such cases. If you placed the order using **Cash on Delivery (COD)**, no amount will be charged.

Once a store accepts an order:

* It becomes binding on the store to fulfill it.
* The store cannot cancel or reject it unilaterally.
* Delivery timelines and slots are as per the store's own configuration and availability.

---

### 5. **Pricing, Taxes & Payments**

All prices shown on the Aiva app are inclusive of **GST and other applicable taxes**.

You may pay for your orders via:

* **Online payment** using Razorpay (credit/debit cards, UPI, wallets, net banking, etc.)
* **Cash on Delivery (COD)**, where payment is made directly to the store’s delivery agent or via the store's QR code

**Escrow logic (for prepaid):**
Aiva may hold online payments temporarily and only release them to the store after the order is marked as delivered.

**Razorpay refund fees policy:**

* If the **store rejects or cancels** a prepaid order, the **store bears the Razorpay refund processing fee**.
* If **you cancel** a prepaid order voluntarily, **you will bear the Razorpay refund fee**, which may be deducted from the refund amount.

---

### 6. **Refunds, Cancellations & Returns**

#### Refunds:
* Initiated automatically if a store rejects or fails to accept an order.
* Processing time may vary (typically 3–7 working days) based on Razorpay and your bank policies.
* Refunds may include applicable deductions based on the party responsible for the cancellation.

#### Returns:

Delivered items are **non-returnable**, except in the following cases:
* Expired or damaged items
* Wrong products or quantities delivered
* Items that differ significantly from the listing

Returns must be requested **within 6 hours of delivery** by raising the return request from the Order Details screen. Photo evidence may be required. The store owner may or may not accept the return request.

If the store owner does not accept the return request, Aiva will process a refund based on the type of return:
  * **Partial Return:** Where not all items of the delivery are returned, only the cost/selling price of the returned items will be refunded.
  * **Full Return:** Where the entire order is returned, the full amount will be refunded.

Returns will be resolved directly by the Store Partner. Aiva will assist in dispute resolution but is **not liable for non-acceptance** of returns by the store.

#### Cancellation of Prepaid Orders by Customer:

If a customer places a prepaid order and subsequently cancels it, the platform fees (Rs. 20) will be non-refundable. The platform fees are charged for processing the payment and facilitating the transaction and will not be refunded under any circumstances once the order is cancelled by the customer.

#### Non-Refundable Charges for Unsuccessful Delivery Attempts:

In cases where a store accepts the order and proceeds with delivery, but the customer is unavailable at the delivery address due to reasons such as incorrect address, failure to respond to the delivery agent, or any other reason where neither the store nor Aiva is at fault, the following charges shall be non-refundable for prepaid orders:
  * **Platform fees** (Rs. 20)
  * **Customer convenience fees** (3% rounded up to the next whole number)
  * **Store delivery charges** as set by the store

These charges will not be refunded under any circumstances if the delivery fails due to the fault of the customer, and the store has made reasonable efforts to deliver the order.

---

### 7. **Delivery, Timelines & Store Responsibilities**

All deliveries are fulfilled **entirely by the Store Partner** from whom you place the order. Aiva does **not provide any delivery agents or logistics services**.

#### Delivery Types:

* **Standard Delivery**: As per store-defined delivery slots. Each store may set up to **four daily slots**.
* **Instant Delivery**: Optional, may be offered by stores based on delivery radius, inventory, and staffing.

#### Delivery Commitments:

* Delivery timelines are displayed during checkout but are **indicative only**, based on the store’s schedule and available resources.
* Aiva does not guarantee any delivery time or quality and is not liable for any delay, non-delivery, or partial delivery.

#### Non-Delivery or Delay:

* If your order is **not delivered** despite being marked as "Delivered" in the app, and you raise a support ticket within 12 hours, Aiva will initiate a resolution and **may process a refund** after internal investigation.
* Delays or missed deliveries must be resolved with the respective store. Aiva may mediate but holds **no liability**.

#### Delivery Charges:

* Delivery fees, if any, are **set by the Store Partner**, and may vary by order value, delivery type, and store policies.
* Stores may also offer free delivery above certain cart values.

#### Store Responsibility:

* The Store Partner is fully responsible for:

  * Ensuring item availability and quality
  * Ensuring timely fulfillment
  * Engaging and managing their own delivery staff or third-party delivery agents
  * Handling expired, spoiled, or incorrect items sold or delivered

---

### 8. **Ratings, Feedback & User-Generated Content**

#### Customer Reviews:

* After delivery, you may rate your experience and submit reviews, photos, and feedback for the store.
* Ratings help other users and may impact store rankings on the platform.

#### Moderation & Platform Rights:

* Aiva reserves the right to review, hide, delete, or flag any review or content that is:

  * Abusive, misleading, discriminatory, or defamatory
  * In violation of copyright, obscenity laws, or platform integrity
  * Containing private or sensitive data, or third-party promotional material

#### Content Ownership:

* By submitting any content (text, images, videos, ratings), you **grant Aiva a non-exclusive, royalty-free, perpetual, and worldwide license** to use, publish, display, and reproduce it in connection with the platform — including on the app, marketing materials, or communications.
* You represent that you own or have rights to all content you submit and that it does not violate any law or rights of others.

#### Image Usage in Reviews:

* Photos uploaded with reviews may be used by Aiva or the respective Store Partner for visibility and reputation-building. You waive any right to compensation for such use.

---

### 9. **Promotions, Offers & Sponsored Listings**

#### Store-Generated Offers:

* Many discounts or promotions shown on product listings are directly offered by Store Partners.
* Aiva is **not responsible** for the availability, accuracy, or execution of store-led promotions.

#### Platform-Led Campaigns:

* Occasionally, Aiva may launch **platform-wide discounts**, cashback, free delivery offers, or referral bonuses.
* Such promotions will be time-limited and governed by their own terms, which may be modified or withdrawn without prior notice.

#### Sponsored Listings (Future Feature):

* In future versions of the app, certain stores or products may appear with labels like "Sponsored", "Featured", or "Promoted".
* These listings may be influenced by advertising arrangements and may not necessarily represent relevance, best price, or popularity.
* Aiva will disclose paid placements clearly as per advertising norms.

#### Conflicts in Offer Application:

* If a discrepancy arises between an advertised discount and the amount charged, customers are encouraged to raise a support query. Aiva will investigate the issue but is **not liable for disputes caused by store miscommunication or technical errors.**

---

### 10. **AI Assistant & Experimental Features**

The Aiva platform includes an AI-powered chatbot ("Smart Assistant") to assist users with:

* Product-related queries
* Store or item suggestions
* Personalized recommendations
* General grocery-related knowledge
* Future ability to place orders via text or voice

#### Powered by OpenAI:

* The assistant is powered by third-party language models (including OpenAI), and its responses are **generated automatically based on your queries and app data**.
* Responses may contain inaccuracies, incomplete suggestions, or misinterpretations. Aiva does not verify the accuracy or reliability of AI-generated content.

#### Order Placement via AI:

* In future versions, the AI may offer to assist with cart additions, store switching, or even full order placement.
* Orders placed via AI are considered **valid and final** if confirmed by you, and the same refund/cancellation rules apply.

#### Consent to Record & Analyze:

* By using the chatbot or voice ordering features (when enabled), you consent to:

  * The storage of chat transcripts
  * The processing of voice commands into text
  * Behavioral tracking for personalization
* Aiva may review chat or voice interactions to:

  * Improve service accuracy
  * Train AI models
  * Ensure compliance with platform policies

#### No Liability for AI Output:

* The AI is a **support tool only**, and is not a replacement for customer support or legal advice.
* Aiva assumes no responsibility for loss, delay, error, or confusion arising from reliance on AI output.

---

### 11. **App Permissions & Device Access**

The Aiva app may request access to the following features and data on your device:

#### Mandatory Permissions:

* **Phone number & email ID**: For login and identity verification
* **Device ID & IP address**: For account security, fraud detection, and session tracking
* **Location access** (GPS): To show nearby stores and enable delivery address input
* **Address book access**: (optional) To pre-fill delivery contacts
* **Notification permissions**: To update you on order status, promotions, and support queries

#### Optional Permissions:

* **Camera/Gallery**: For submitting photos in reviews
* **Microphone access**: For future voice assistant features
* **Birthday, gender, language preferences**: For personalization and analytics

You may revoke any optional permissions from your device settings, but doing so may restrict certain features or impact your experience on the app.

---

### 12. **Data Retention, Deletion & User Rights**

#### Account Deletion:

You may delete your Aiva account at any time through the app settings. Upon receiving a deletion request:

* We will begin permanent data removal from our Supabase databases
* Deletion may take up to **14–21 working days** to fully reflect across systems
* Some anonymized or legally required data may be retained for compliance, fraud prevention, or audit purposes

#### Data Use & Storage:

* Your data is stored on secure servers hosted by Supabase and third-party service providers compliant with global security standards.
* We do not sell your personal data.
* Aggregated, anonymized data may be used to improve platform performance, train AI models, and optimize features.

#### DPDP & IT Act Compliance:

* Aiva follows India’s **Digital Personal Data Protection Act (DPDP)** and **Information Technology (IT) Rules**, which grant you rights including:

  * Access to your data
  * Right to correction or deletion
  * Consent withdrawal
  * Right to data portability (where technically feasible)

To exercise your data rights, contact us at \info@thegoaiva.com.

---

### 13. **Prohibited Use & Legal Violations**

You agree to use the Aiva platform only for lawful purposes and in accordance with these Terms. The following activities are strictly prohibited and may result in immediate suspension or termination of your account:

* Placing fake or fraudulent orders
* Repeatedly cancelling orders to manipulate discounts
* Abusing the COD option without intent to accept delivery
* Uploading illegal, misleading, or copyrighted content without rights
* Attempting to reverse-engineer, hack, scrape, or disrupt the platform
* Impersonating others or providing false information
* Harassing store owners, delivery agents, Aiva staff, or AI systems
* Exploiting app bugs or glitches to gain unfair advantages
* Circumventing app limits, abuse protection, or fraud detection tools
* Violating applicable Indian laws, including data, tax, or consumer laws

If Aiva, at its sole discretion, finds that your activity harms the platform, its partners, or other users, we may take one or more of the following actions:

* Temporarily restrict or suspend your access
* Permanently deactivate your account
* Withhold any refunds or benefits gained through manipulation
* Report your activity to law enforcement or regulatory authorities

---

### 14. **Platform Availability, Technical Downtime & Force Majeure**

While we strive to ensure uninterrupted access to the Aiva platform, we cannot guarantee continuous availability. The app or its services may be temporarily unavailable due to:

* Scheduled maintenance
* Technical issues with servers, third-party APIs (e.g., Razorpay, OpenAI, Supabase)
* Unexpected system failures
* Acts of God, force majeure, or external cyberattacks

We are not responsible for:

* Incomplete or failed transactions during outages
* Delays in order processing caused by store or network issues
* Loss of data, preferences, or messages during service interruptions

You agree that you will not hold Aiva liable for any losses incurred due to downtime, and that your sole remedy is to discontinue use of the service until it is restored.

---

### 15. **Modifications to These Terms**

Aiva reserves the right to modify, update, or replace these Terms & Conditions at any time. We may:

* Push updates directly through the app
* Send in-app notifications or banners
* Notify by email in cases of material or legally significant changes

Your continued use of the app after changes are posted constitutes your acceptance of the revised terms. We recommend checking this page periodically for updates.

---

### 16. **Governing Law & Dispute Resolution**

These Terms are governed by and construed in accordance with the laws of **India**. Any disputes, claims, or controversies arising out of or relating to these Terms — including the validity, interpretation, or enforcement thereof — shall be:

* First attempted to be resolved through good faith informal discussions or mediation initiated by Aiva's support team
* If unresolved, the dispute shall be subject to **arbitration under the Arbitration and Conciliation Act, 1996**, with the venue in **Bhopal, Madhya Pradesh**
* Subject to the exclusive jurisdiction of the **courts in Bhopal**
* For the purpose of communication, responses, and arguments related to any disputes, English will be the preferred language.

---

### 17. **Contact Information**

If you have any questions about these Terms, your rights, or need help with any order or issue, you may contact us at:

**Company Name:** Aiva Stores Private Limited

**Registered Address:** Plot No. 287-A, Goyal Homes, G-2, Sec-B, Shahpura, Bhopal, Madhya Pradesh 462016

**Support Email:** \info@thegoaiva.com

**Support Timing:** Monday to Saturday, 10:00 AM – 6:00 PM IST (excluding public holidays)

---

`

const headings = [
  { id: '1-introduction', label: '1. Introduction' },
  { id: '2-eligibility--account-registration', label: '2. Eligibility & Account Registration' },
  { id: '3-platform-role--disclaimer', label: '3. Platform Role & Disclaimer' },
  { id: '4-order-placement--acceptance', label: '4. Order Placement & Acceptance' },
  { id: '5-pricing-taxes--payments', label: '5. Pricing, Taxes & Payments' },
  { id: '6-refunds-cancellations--returns', label: '6. Refunds, Cancellations & Returns' },
  { id: '7-delivery-timelines--store-responsibilities', label: '7. Delivery, Timelines & Store Responsibilities' },
  { id: '8-ratings-feedback--user-generated-content', label: '8. Ratings, Feedback & User-Generated Content' },
  { id: '9-promotions-offers--sponsored-listings', label: '9. Promotions, Offers & Sponsored Listings' },
  { id: '10-ai-assistant--experimental-features', label: '10. AI Assistant & Experimental Features' },
  { id: '11-app-permissions--device-access', label: '11. App Permissions & Device Access' },
  { id: '12-data-retention-deletion--user-rights', label: '12. Data Retention, Deletion & User Rights' },
  { id: '13-prohibited-use--legal-violations', label: '13. Prohibited Use & Legal Violations' },
  { id: '14-platform-availability-technical-downtime--force-majeure', label: '14. Platform Availability, Technical Downtime & Force Majeure' },
  { id: '15-modifications-to-these-terms', label: '15. Modifications to These Terms' },
  { id: '16-governing-law--dispute-resolution', label: '16. Governing Law & Dispute Resolution' },
  { id: '17-contact-information', label: '17. Contact Information' },
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
            Aiva – Customer Terms & Conditions
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
