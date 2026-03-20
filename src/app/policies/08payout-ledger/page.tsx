//app/policies/01customer-terms/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image'

const markdown = `
### 1. **Why This Policy Exists**

We want you to know exactly how your money flows on Aiva — no guesswork, no surprises.

This policy explains:

* How you earn from each order
* What fees and taxes get deducted
* When and how payouts reach your bank
* How COD commissions are handled
* Where to track everything in your dashboard

This is your business — you deserve full visibility and control. That’s what your **Ledger** gives you.

---

### 2. **Types of Orders**

There are two types of orders on Aiva:

#### A. **Prepaid Orders**

* The customer pays online via Razorpay
* Aiva collects the money on your behalf
* We deduct fees, and the balance is paid to your bank

#### B. **Cash on Delivery (COD) Orders**

* You (or your delivery person) collect the money directly from the customer
* But Aiva’s platform commission still applies
* We deduct it from your next Prepaid payout — or send you a monthly invoice if needed

Both order types are shown in your **Partner Ledger**, and each one affects your balance differently.

---

### 3. **Your Ledger Explained**

Your **Ledger** is built right into the Aiva Partner App. It shows:

* Total earnings per order
* What was deducted (platform fee, Razorpay charge, TCS, etc.)
* Payouts made to your bank
* Any pending dues (especially for COD orders)

You can also see:

* Refunds or adjustments (with reasons)
* Ledger history for each order
* Your current and upcoming payout totals

This is **your control panel** — we recommend checking it often, especially if you receive a lot of COD orders.

---

### 4. **Aiva’s Platform Commission**

To keep Aiva running and improving, we charge a small service fee on every delivered order:

**₹20 or 3% of the order total — whichever is higher**

This applies to both Prepaid and COD orders and is:

* Deducted **before** payout (for Prepaid), or
* Shown as due in your ledger (for COD)

This fee helps us maintain the platform, support your store, run customer service, and process refunds and fraud checks.

You’ll always see this commission clearly marked in your Ledger.

---

### 5. **Razorpay Transaction Charges**

For every **Prepaid order**, Razorpay charges a small transaction processing fee. This is:

* Collected directly by Razorpay — not by Aiva
* Varies by payment method (UPI, credit card, wallet, etc.)
* Deducted **before payout** and clearly shown in your Ledger under each order

This charge is **standard across all online platforms**. Aiva does not add any markup or hidden fees here.

You’ll see the Razorpay deduction amount on your dashboard — right below the commission line.

---

### 6. **GST, TCS & Tax Deductions**

#### A. **GST on Platform Fees**

* Aiva adds GST on its service fee (platform commission)
* You’ll see “GST on Platform Fee” as a separate line in your ledger
* This amount is payable to the government by Aiva, and may be visible in your GST input credits (if applicable)

#### B. **TCS (Tax Collected at Source)**

* As a GST-registered E-Commerce Operator, Aiva is required to deduct **TCS** from all online sales (under Section 52 of CGST Act)
* The standard rate is:

  * **1% on net taxable value** (0.5% CGST + 0.5% SGST or 1% IGST)
* TCS is:

  * **Automatically deducted from Prepaid payouts**
  * Reported monthly in Aiva’s **GSTR-8 filing**
  * Available for you to claim while filing your own GST returns

> 📌 **Note:** TCS is deducted **only if** you’ve submitted a valid **GSTIN** in your Partner profile.

---

### 7. **Prepaid Order – Payout Timeline**

Here’s how Prepaid order settlement works:

* Once the order is marked **Delivered** in your app, the payment moves into processing
* After all deductions (commission, Razorpay fee, GST, TCS), your **Net Payout** is calculated
* Razorpay transfers the final amount to your registered bank account within **1–2 business days** (as per their banking cycle)

You can see the payout status (Initiated, Settled, Delayed) in your Ledger dashboard.

---

### 8. **COD Orders – How Commission Is Deducted**

In COD orders:

* The customer pays **you** directly
* But Aiva still earns its platform fee

There are two ways this fee is recovered:

#### A. If you have Prepaid earnings

* We deduct your COD commissions automatically from your next prepaid balance
* The ledger will reflect “COD Fee Adjustment” or “Platform Fee from COD”

#### B. If you have only COD orders

* We send you a **monthly invoice** for pending commissions
* You must clear the invoice by the due date to avoid any disruptions

If dues remain unpaid:

* COD orders may be **paused temporarily**
* Aiva may withhold Prepaid payouts or take further steps

We trust you to report COD deliveries honestly. But if abuse is detected (e.g., fake cancellations, money not marked as received), penalties will apply.

---

### 9. **Refunds, Adjustments & Reversals**

If a customer is refunded (due to issues like:

* Wrong item
* Product never delivered
* Expired goods),

Aiva may:

* Reverse your earnings for that order
* Mark a **negative adjustment** in your ledger
* Deduct the refund value from your next payout

Refunds are not made without investigation. You may contest a refund by contacting Aiva support within **48 hours** of the ledger update.

---

### 10. **Delays or Payment Failures**

Sometimes, payouts may get delayed due to:

* Razorpay settlement failures
* Bank server downtime
* Incorrect bank account details
* National holidays or Sundays

What you can do:

* Check your **“Upcoming Payout”** tab for latest status
* Update bank details from your dashboard if needed
* Contact Aiva support if payment hasn’t arrived in **3 business days** post expected date

Aiva will support you in tracking Razorpay issues — but we cannot speed up external banking delays.

---

`
const headings = [
  { id: '1-why-this-policy-exists', label: '1. Why This Policy Exists' },
  { id: '2-types-of-orders', label: '2. Types of Orders' },
  { id: '3-your-ledger-explained', label: '3. Your Ledger Explained' },
  { id: '4-aiva’s-platform-commission', label: '4. Aiva’s Platform Commission' },
  { id: '5-razorpay-transaction-charges', label: '5. Razorpay Transaction Charges' },
  { id: '6-gst-tcs--tax-deductions', label: '6. GST, TCS & Tax Deductions' },
  { id: '7-prepaid-order-–-payout-timeline', label: '7. Prepaid Order – Payout Timeline' },
  { id: '8-cod-orders-–-how-commission-is-deducted', label: '8. COD Orders – How Commission Is Deducted' },
  { id: '9-refunds-adjustments--reversals', label: '9. Refunds, Adjustments & Reversals' },
  { id: '10-delays-or-payment-failures', label: '10. Delays or Payment Failures' },
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
            Aiva – Partner Payouts & Ledger
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