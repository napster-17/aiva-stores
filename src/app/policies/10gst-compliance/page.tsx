//app/policies/01customer-terms/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image'

const markdown = `
### 1. **Aiva’s GST Status as an E-Commerce Operator (ECO)**

Aiva Private Limited is registered under the Goods and Services Tax (GST) regime in India as an **E-Commerce Operator (ECO)**, as defined under Section 52 of the Central Goods and Services Tax Act, 2017 (“CGST Act”).

As an ECO, Aiva is required by law to:

* Deduct **Tax Collected at Source (TCS)** from sellers (store partners) on taxable supplies made through the Aiva platform
* Deposit the TCS with the appropriate government authorities
* File monthly returns under **GSTR-8**, which discloses the seller-wise taxable turnover and TCS collected
* Report seller GSTINs and related order data to the GSTN (Goods and Services Tax Network)

These obligations apply to **all e-commerce platforms in India**, and are not optional. Aiva has no discretion to waive TCS deduction if your sales meet the legal conditions defined below.

---

### 2. **Understanding TCS (Tax Collected at Source)**

**Tax Collected at Source (TCS)** under GST refers to a tax that e-commerce operators must deduct on behalf of sellers when:

* A taxable sale is made through the platform
* The seller is a GST-registered person
* The sale involves taxable goods or services under GST

This TCS is:

* **Not a fee or charge by Aiva**
* Paid to the **government** directly under Aiva’s GSTIN
* Reflected as a **credit** in the seller’s GST portal (can be claimed while filing GSTR-3B)

The applicable rate is:

* **1% of net taxable value** of the order

  * 0.5% CGST + 0.5% SGST (for intra-state supply), or
  * 1% IGST (for inter-state supply)

> “Net taxable value” = order value excluding GST charged on invoice

---

### 3. **When TCS Will Be Deducted by Aiva**

TCS will be deducted **only when** the following conditions are met:

* The store partner has provided a valid **GSTIN**
* The order has been **successfully delivered** and marked so on the platform
* The products involved are **taxable supplies under GST**

TCS will be:

* Calculated automatically
* Reflected in your **Ledger** under “TCS Deducted”
* Reported under your GSTIN in Aiva’s monthly **GSTR-8 filing**
* Made visible in your **GST portal** as “TCS Credit Available” for claiming

If the store is not registered under GST or has declared itself exempt, TCS deduction will not apply — but invoicing and credit claims will also not be supported.

---

### 4. **Invoice Generation And Format**

Aiva supports two invoice pathways based on the store partner’s tax registration status.

#### A. If the Partner has a Valid GSTIN:

* Aiva may generate customer invoices **on behalf of the Partner**, using:

  * The Partner’s registered business name and GSTIN
  * The product-wise HSN codes and applicable tax rates (as provided by the store)
  * The Partner’s declared place of supply and location

* These invoices:

  * Are shared with customers via email/download
  * Are included in Aiva’s GSTR-8 as seller-specific data
  * Must be reported in the Partner’s own GSTR-1 and GSTR-3B

#### B. If the Partner has **no GSTIN**:

* Aiva will issue a simplified invoice without GST breakup
* The Partner will **not** be eligible for input tax credit (ITC)
* TCS will **not** be deducted, but sales may still be reportable under aggregate turnover laws

It is the Partner’s responsibility to update their GSTIN in the Aiva dashboard as soon as it becomes available. Backdated credit claims may not be supported.

---

### 5. **Partner’s GST Compliance Responsibilities**

By accepting orders through Aiva, the Partner agrees to:

* Maintain an active and valid GST registration if legally required
* Update GSTIN and tax configuration (HSN, rate) in the Partner dashboard
* Declare all sales made via Aiva in their monthly GST returns
* Reconcile TCS credits from Aiva’s GSTR-8 with their GSTR-2A
* File accurate tax returns (GSTR-1, GSTR-3B) in a timely manner

Aiva will not be liable for:

* Penalties or notices received due to Partner-side tax mismatch
* Inaccurate or outdated GSTIN/tax data entered by the Partner
* Any denial of TCS credit due to delayed registration or wrong portal details

---

### 6. **TCS Credit Reporting And Reconciliation**

Every month, Aiva will:

* File **GSTR-8** showing seller-wise TCS deducted
* Share a **summary statement** of TCS via the Partner dashboard or email
* Upload the relevant data to the **GSTN**, which reflects in the Partner’s account under “TCS Credit”

The Partner may:

* View and download this credit data
* Claim it while filing GSTR-3B under **Electronic Cash Ledger – TCS**
* Use it to offset GST liability (not for ITC claims)

If the Partner does not file GST returns or fails to reconcile:

* The TCS credit may remain unused
* GSTN may issue discrepancy notices under mismatch guidelines

---

### 7. **Consequences of GST Non-Compliance**

Failure to comply with applicable GST regulations may result in the following actions by Aiva or tax authorities:

#### A. Platform-Level Consequences:

* **Suspension of invoice generation** for the Partner
* **Delay or non-reflection** of TCS credits in the GST portal
* **Payout holds** on Prepaid orders, pending resolution of tax discrepancies
* **Delisting or permanent ban** if ordered by GST officers or legal authorities

#### B. Government-Level Consequences:

* GSTN may issue notices to the Partner for:

  * Unclaimed TCS credits
  * Mismatch between GSTR-1, GSTR-3B, and GSTR-8
  * Suspected underreporting or misclassification of supply
* The Partner may face:

  * Interest or penalty under CGST/SGST laws
  * Disqualification for future input tax credit (ITC) claims
  * Summons or audit requests as part of compliance review

Aiva will not be held liable for any penalties, interest, or legal consequences faced by the Partner due to their own GST lapses or omissions.

---

### 8. **GST Audit And Tax Authority Cooperation**

In case of an audit or official request from:

* Central or State GST officers
* GSTN data reconciliation teams
* Tax tribunals or investigating agencies

Aiva reserves the right to:

* Share relevant seller-level data, invoice records, and platform logs
* Suspend payouts or store visibility until compliance is verified
* Provide full cooperation to authorities under Indian law

The Partner agrees to:

* Cooperate with any government inquiry initiated through Aiva
* Share relevant purchase records or returns if requested
* Ensure tax filings match the platform data reported by Aiva

---

### 9. **Contact Information And Support**

For help with:

* Downloading your monthly TCS statement
* Reconciling invoice values or tax data
* Updating your GSTIN or correcting errors
* General GST questions or dashboard issues

Please reach out to:

**Company Name:** Aiva Stores Private Limited

**Registered Address:** Plot No. 287-A, Goyal Homes, G-2, Sec-B, Shahpura, Bhopal, Madhya Pradesh 462016

**Support Email:** \info@thegoaiva.com

**Support Timing:** Monday to Saturday, 10:00 AM – 6:00 PM IST (excluding public holidays)

---

`

const headings = [
  { id: '1-aivas-gst-status-as-an-e-commerce-operator-eco', label: '1. Aiva’s GST Status as an E-Commerce Operator (ECO)' },
  { id: '2-understanding-tcs-tax-collected-at-source', label: '2. Understanding TCS (Tax Collected at Source)' },
  { id: '3-when-tcs-will-be-deducted-by-aiva', label: '3. When TCS Will Be Deducted by Aiva' },
  { id: '4-invoice-generation-and-format', label: '4. Invoice Generation And Format' },
  { id: '5-partners-gst-compliance-responsibilities', label: '5. Partner’s GST Compliance Responsibilities' },
  { id: '6-tcs-credit-reporting-and-reconciliation', label: '6. TCS Credit Reporting And Reconciliation' },
  { id: '7-consequences-of-gst-non-compliance', label: '7. Consequences of GST Non-Compliance' },
  { id: '8-gst-audit-and-tax-authority-cooperation', label: '8. GST Audit And Tax Authority Cooperation' },
  { id: '9-contact-information-and-support', label: '9. Contact Information And Support' },
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
            Aiva – GST Compliance
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
