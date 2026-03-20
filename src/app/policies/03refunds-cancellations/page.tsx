//app/policies/01customer-terms/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image'

const markdown = `
### 1. **Introduction**

This Refunds & Cancellations Policy describes how **refunds, cancellations, and post-order issues** are handled on the Aiva platform.

This policy applies to all orders placed through the **Aiva mobile app and website**, whether paid online or via Cash on Delivery (COD). It forms part of our overall Terms & Conditions and must be read alongside those.

Aiva operates as a **marketplace** platform — we do not own or deliver goods directly. All orders are fulfilled by independent **Store Partners**, and all delivery services are arranged by them. As such, refund eligibility and speed may vary based on:

* When and why the order was cancelled or returned
* Whether the order was prepaid or COD
* Store response and Razorpay (payment gateway) timelines

---

### 2. **Order Rejected by Store (Manual or Auto)**

Once a customer places an order, the assigned store has up to **10 minutes** to accept it. If the store:

* **Manually rejects** the order, or
* **Fails to act within 10 minutes**, causing the system to auto-cancel the order,

Then the following applies:

#### For Prepaid Orders:

* A **full refund** is automatically initiated to the original payment method
* The store will bear any **Razorpay refund processing charges**
* Refund will be visible in your bank or wallet account within **3–7 business days** (subject to your bank/payment provider)

#### For COD Orders:

* No charges apply to the customer
* The order will be cancelled without any financial deduction

Stores that repeatedly reject orders may face penalties, including reduced visibility or suspension from the platform.

---

### 3. **Order Cancelled by Customer**

You may cancel an order **only before it is accepted by the store**. Cancellation rules differ based on payment method and timing.

#### If You Cancel Before Store Acceptance:

* **Prepaid Orders**:If a customer places a prepaid order and subsequently cancels it, the platform fees (Rs. 20) will be non-refundable, which **you (the customer)** agree to bear. The platform fees are charged for processing the payment and facilitating the transaction and will not be refunded under any circumstances once the order is cancelled by the customer."
* **COD Orders**: Cancelled without penalty, but repeated misuse (e.g., placing multiple COD orders and never accepting delivery) may lead to a ban from COD

#### If You Attempt to Cancel After Store Has Accepted:

* The app may **block cancellation**
* Any cancellation after store acceptance must be approved by the store
* If the store agrees, the same refund rules apply (minus Razorpay fees for prepaid)

Please note: **Refund processing begins only after store rejection or approval of customer cancellation**, and Aiva is **not responsible for delays** caused by store inaction or bank processing times.

---

### 4. **Refund Timelines & Method**

Refunds are processed via **Razorpay**, Aiva’s authorized payment gateway partner, and are subject to their internal policies, as well as your bank's settlement cycle.

#### Timeline Expectations:

* **Initiation**: Once a refund is approved by the store or triggered by the system (e.g., auto-rejection), it is typically initiated within **24–48 working hours**
* **Processing**: It may take **3 to 7 business days** to reflect in your account, depending on:

  * Your payment mode (UPI, card, wallet, net banking)
  * Your issuing bank’s processing cycle
  * Razorpay’s current operational load

#### Mode of Refund:

* Refunds are credited to the **original source of payment** — e.g., your UPI ID, bank account, credit/debit card, or wallet
* For **COD orders**, refund is not automatic — you must provide a **valid UPI ID or bank details** when prompted by Aiva’s support team

Aiva provides **no guarantee** for refund speed beyond what is processed by Razorpay and your bank. We will assist with tracking and ensure confirmation is provided once initiated.

---

### 5. **Returns After Delivery (Eligible Conditions Only)**

To ensure fairness for both customers and partner stores, Aiva does **not allow post-delivery returns** unless one of the following issues is raised within the valid time window:

#### Acceptable Return Reasons:

* Product is **expired**, **spoiled**, or **unfit for consumption**
* Items delivered are **damaged, broken, or leaking**
* **Wrong products or quantities** were delivered
* Packaging is **tampered or suspicious**
* Item significantly **differs from description or listing**

Returns are **not accepted** for:

* Buyer’s remorse or taste preferences
* Perishable goods after **6 hours of delivery**
* Opened/used products unless visibly defective
* Bulk or high-value items without photographic evidence

#### Time Window for Raising a Return:

* You must raise a return request within **6 hours** from the time your order was marked as "Delivered"
* Requests raised after 6 hours are **automatically ineligible**

---

### 6. **Non-Refundable Charges for Unsuccessful Delivery Attempts**

In cases where a store accepts the order and proceeds with delivery, but the customer is unavailable at the delivery address due to reasons such as incorrect address, failure to respond to the delivery agent, or any other reason where neither the store nor Aiva is at fault, the following charges shall be non-refundable for prepaid orders:
  * **Platform fees* (Rs. 20)
  * **Customer convenience fees** (3% rounded up to the next whole number)
  * **Store delivery charges** as set by the store

These charges will not be refunded under any circumstances if the delivery fails due to the fault of the customer, and the store has made reasonable efforts to deliver the order.

---

### 6. **How to Raise a Return Request**

* Go to the **“My Orders”** section in the app.
* Select the order and tap **“Order Card”**. It will take you to the **"Order Details Screen"**. 
* Click on Replace/Refund button. 
* Choose the items that you want to replace.
* Choose the valid reason/issue type and upload clear images if prompted,
* Include a short description (e.g., “item expired”, “wrong quantity received”).
* Enter yoru UPI ID (for refunds only if store is unable to process your return request).
* Your request will be forwarded to the store for review.

---

### 7. **Refunds on Return Approval**

If your return request is **approved by the store**, then you can check the My Returns in the app to get more details like delivery slots added by the store, items, status.
If your return request is **rejected by the store**, then our team will verify all the details and then process the refund amount to your UPI id which may take from 3-7 business days to reflect in your bank account. 

---

### 8. **Abuse, Fraud & Misuse of Refund System**

Aiva reserves the right to monitor refund and cancellation behavior to prevent misuse of the platform. The following actions are considered abusive and may lead to account restrictions:

#### Examples of Refund Abuse:

* Repeated cancellation of **COD orders** after dispatch
* Placing fake orders or using dummy addresses
* Submitting false or edited images to support fake return claims
* Attempting to refund delivered items without valid cause
* Using the refund process to delay payments or manipulate Razorpay fees

#### Penalties for Abuse:

* Temporary or permanent **block on COD access**
* Full or partial **denial of refund**
* Account **suspension or permanent deactivation**
* Legal action for fraudulent chargebacks or financial misconduct

Aiva retains the right to determine refund eligibility based on pattern analysis and risk scoring, even if individual refund requests appear legitimate.

---

### 9. **Dispute Resolution**

If a return request is rejected by the store and you disagree with the decision, you may raise a **dispute ticket** through the Aiva support team.

#### Dispute Escalation Process:

* Provide additional explanation or images as requested
* Aiva may contact the store or investigate past patterns
* Aiva will act as a **neutral mediator** and will issue a final decision

Please note:

* Aiva is not obligated to override store decisions unless clear evidence is provided
* Our final resolution shall be binding unless required otherwise by law

If any disputes arise that are not resolved internally, they will be governed under the laws stated in our **Terms & Conditions** (Bhopal jurisdiction, Arbitration fallback).

---

### 10. **Policy Updates**

We may update or revise this Refunds & Cancellations Policy based on:

* Changes in Indian law (including DPDP, IT Rules, Consumer Law, GST rules)
* Razorpay or other payment gateway policies
* Operational feedback and new platform features

All changes will be communicated through:

* In-app banners or updates
* Posting the revised policy with a "Last Updated" date

You are advised to review this policy periodically to stay informed of your rights and obligations.

---

### 11. **Contact & Support**

If you need help with a refund, cancellation, or return request, you can reach us at:

**Company Name:** Aiva Stores Private Limited

**Registered Address:** Plot No. 287-A, Goyal Homes, G-2, Sec-B, Shahpura, Bhopal, Madhya Pradesh 462016

**Support Email:** \info@thegoaiva.com

**Support Timing:** Monday to Saturday, 10:00 AM – 6:00 PM IST (excluding public holidays)

**In-App Help:** Navigate to "Help & Support"

Please have your **Order ID**, phone number, and any screenshots ready to expedite the resolution process.

---

`

const headings = [
  { id: '1-introduction', label: '1. Introduction' },
  { id: '2-order-rejected-by-store-manual-or-auto', label: '2. Order Rejected by Store (Manual or Auto)' },
  { id: '3-order-cancelled-by-customer', label: '3. Order Cancelled by Customer' },
  { id: '4-refund-timelines--method', label: '4. Refund Timelines & Method' },
  { id: '5-returns-after-delivery-eligible-conditions-only', label: '5. Returns After Delivery (Eligible Conditions Only)' },
  { id: '6-how-to-raise-a-return-request', label: '6. How to Raise a Return Request' },
  { id: '7-refunds-on-return-approval', label: '7. Refunds on Return Approval' },
  { id: '8-abuse-fraud--misuse-of-refund-system', label: '8. Abuse, Fraud & Misuse of Refund System' },
  { id: '9-dispute-resolution', label: '9. Dispute Resolution' },
  { id: '10-policy-updates', label: '10. Policy Updates' },
  { id: '11-contact--support', label: '11. Contact & Support' },
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
            Aiva – Customer Refunds & Cancellations
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
