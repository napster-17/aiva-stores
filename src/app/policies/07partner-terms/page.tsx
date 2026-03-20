//app/policies/01customer-terms/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image'

const markdown = `

### 👋 Welcome to Aiva, Partner!

We built Aiva **for stores like yours** — the heart of every neighborhood. You're not just another listing on a screen. You're a local expert, a familiar face, a shop that keeps communities running.

We know the online world can feel overwhelming — big names, big budgets, big teams. But our goal is simple: to give **you** the same tools they have. So you can grow your business, reach more customers, and run things **your way**.

This platform is **your digital shopfront** — and like any great shop, it works best when there’s trust on both sides. That’s what these terms are for. They're here to protect **you**, **your customers**, and the community we’re building together.

---

## 💼 What We Ask From You (And What You Can Expect From Us)

We keep things simple. You focus on your store — we’ll handle the rest. But here’s what we need from you to make it work:

### 🕒 Accept Orders Quickly

When a customer places an order, you'll get a ping.

* You have **10 minutes** to accept it.
* No action? It’ll be auto-cancelled.
* Too many missed orders? It affects trust — and store visibility.

### 📦 If You Accept, You Must Deliver

Once you tap "Accept", you're committing to that customer.

* No backing out later. They’re counting on you.
* Please pack and deliver what was ordered — clean, safe, and correct.
* If something goes wrong, we’ll step in — but we’ll also ask you to make it right.

### 🚚 You Handle Your Own Deliveries

This is **your** store, **your** team, **your delivery zone**.

You set your slots, fees, and areas — we don’t interfere.

You can manage up to **four** of your own delivery staff (Partner Delivery Agents or **PDAs**) using our **free Aiva Agents App**.

**You are responsible** for their actions and for teaching them to protect customer privacy.

If deliveries are missed, delayed, or if agents misuse the app, we may need to pause your orders to protect your reputation and the Aiva community.

### 🎯 Send Only What You’d Sell In-Store

This means:
* No expired or damaged products
* No wrong brands or short quantities
* No cutting corners

If the customer reports an issue within **6 hours**, and it's valid, you agree to help fix it — either by refund or replacement.

### 🛒 Upload Honest Listings

Use your own photos or choose from our shared catalog — it’s there to make things faster for you.

Just remember:
* Don’t copy brand logos or images you don’t have rights to
* Everything you upload may be visible to other stores too
* Keep prices fair, stock levels accurate, and names clear

If listings are misleading, it creates problems for everyone — and we may have to step in and hide them.

### 🤝 Protect Customer Information

Your delivery agents will see customer names, addresses, and phone numbers **only** to complete the delivery.

They **must not** record, save, or use this information for any other purpose outside of the Aiva Agents App. You are fully responsible if your agents misuse this data.

---

## 💰 How Payments Work (And What Gets Deducted)

We keep the payment process **simple and transparent**.

### 🧾 Our Platform Fees
For every **successful order**, we charge a small **Platform Fee** of ₹20 and a **Convenience Fee** (which is **3%** of the order value, rounded up). 

Both fees are **paid by the customer**.

This supports the **tech**, **servers**, **support**, and all the **tools** that keep things running smoothly. We **only earn when you earn**. No hidden cuts, no tricky terms.

---

### 💳 Prepaid Orders (Online Payment)
When a customer pays **online**:

- The money comes to us (via **Razorpay**), not directly to you.
- We deduct our platform fee, convenience fee, and applicable taxes (like **1% TCS**).
- The remaining amount is credited to your ledger, which you can **withdraw anytime**.

You can track it all inside your **Ledger Screen** in our Partner's app.

---

### 💵 COD Orders (Cash on Delivery)
For **cash orders**:

Your delivery person collects the payment **directly** from the customer including our **platform fee** & **convenience fees**.

Then we deduct our **platform fee**, **convenience fee**, and **any applicable tax**—just like for online orders from your prepaid earnings, which you can track in your **ledger screen**.

You can settle all dues directly by clicking on the **Deposit** button in your ledger.

We trust you to report **COD deliveries honestly**. But if our system finds irregularities (like **cancelled orders** marked as **delivered**), we may pause your COD option.

---

## ⚖️ When Things Go Wrong: Our Fair Play Policy

Things don’t always go as planned. Our goal is to make sure every outcome is **fair** for both you and the customer.

### Order Rejection
- If a customer cancels a **COD** or **Prepaid order** before you accept it, there’s **no penalty**.
- If you reject a **Prepaid order**, a **₹20 penalty** is applied to your account, and the customer gets a **full refund**.

We understand sometimes things don’t work out, but **rejecting prepaid orders** hurts **customer trust**.

---

### Customer No-Show
If a customer **doesn’t show up** for an order they’ve paid for online, we ensure you’re compensated for your effort.

- You will receive your **full delivery charges** (if applicable).

---

### Returns
#### **Partial or Full Returns (You accept):**
- If you accept a return, **no charges** are applied to you. You’ll need to redeliver the correct items to the customer — either the same day or the next day.

#### **Partial or Full Returns (You deny):**
- If you deny a customer’s **valid return request**, a ₹20 penalty is applied to your account, and the customer will receive a **refund**. The refund will be deducted from your earnings, along with the penalty.

---

## 📲 Grow Your In-Store Business With Walk-In Billing

We’ve introduced a new tool to help you grow your offline business too! With **Walk-In Billing**, you can:

- Collect customer phone numbers or emails to send bills via **WhatsApp** or **Emails**.
- Send special offers or marketing messages on occasions like **Diwali** or **New Year** (Coming Soon).
- Build a stronger **local customer base**.

This is an optional subscription service:

- **Weekly Subscription**: ₹99
- **Monthly Subscription**: ₹349

---

### 🚫 Why We Might Pause a Store (Only When We Have To)

We’re not here to police you — we’re here to **support** you. But to protect customers (and other good store partners like you), we may need to **temporarily suspend** a store if:

* Too many orders are **ignored, rejected, or cancelled**
* You **mark prepaid orders as “Delivered”** but the customer never received them
* Your appointed **Delivery Agents (PDAs)** violate the **Aiva Delivery Agent Privacy Policy** by misusing or retaining customer data
* You have **rejected the COD order** on our app but **our system detected that you have fulfilled the order** to the customer
* You’re consistently **late**, send the **wrong items**, or get **multiple complaints**
* Platform fees (from COD or otherwise) are **not cleared on time**

When this happens:

* We’ll notify you in advance (unless it’s a serious fraud)
* You can reach out and **ask for a review or reactivation**
* Our goal is to help you fix the issue — **not to punish you**

---

### 🙏 A Final Word

You're not just a "partner" in name — we mean it. We’re building Aiva **with you**, for a future where every local store can thrive online without needing big teams or tech experts.

We grow **when you grow**. We win **when you win**.

Let’s do it — together.
`
const headings = [
  { id: 'welcome-to-aiva-partner', label: '👋 Welcome to Aiva, Partner!' },
  { id: 'what-we-ask-from-you-and-what-you-can-expect-from-us', label: '💼 What We Ask From You (And What You Can Expect From Us)' },
  { id: 'how-payments-work-and-what-gets-deducted', label: '💰 How Payments Work (And What Gets Deducted)' },
  { id: 'why-we-might-pause-a-store-only-when-we-have-to', label: '🚫 Why We Might Pause a Store (Only When We Have To)' },
  { id: 'a-final-word', label: '🙏 A Final Word' },
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
            Aiva – Platform Terms & Conditions
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
