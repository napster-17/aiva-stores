//app/policies/06partner-agreement/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image'

const markdown = `
**This Store Partner Agreement (“Agreement”)** is made and entered into by and between:

### A. **Aiva Private Limited**,

a company incorporated under the Companies Act, 2013, having its registered office at:
*Plot No. 287-A, Goyal Homes, G-2, Sector-B, Shahpura, Bhopal, Madhya Pradesh 462016*
(hereinafter referred to as “Aiva”, “We”, “Our”, or “Platform”),

**AND**

### B. The individual or business entity (“Partner”, “You”, or “Store Partner”)

submitting this Agreement via Aiva’s digital platform or by any other authorized onboarding channel, who is desirous of listing and selling products through Aiva’s online marketplace.

This Agreement is deemed accepted and binding upon the Partner upon submission of valid registration credentials and acceptance of this Agreement electronically.

---

### 1. **Definitions**

For the purpose of this Agreement:

* **“Platform”** refers to the Aiva mobile application and website ecosystem developed and operated by Aiva Private Limited.
* **“Partner”** means the kirana store, local shop, merchant, or entity that is entering into this agreement to list and sell products on Aiva.
* **“Customer”** refers to the end-user purchasing goods through the Platform.
* **“Partner Delivery Agent”** or "PDA": Refers to any individual appointed, controlled, and managed by the Partner to fulfill Order and Return Request logistics on behalf of the Partner, using the Aiva Platform's designated delivery agent application ("Aiva Agents App").
* **“Aiva Agents App”** The separate mobile application provided by Aiva specifically for Partner Delivery Agents to view and manage assigned Orders and Return Requests.
* **“Order”** means any customer request for products listed by the Partner, whether paid online (“Prepaid”) or via Cash on Delivery (“COD”).
* **“Prepaid”** refers to orders paid using online methods via Razorpay or other approved gateways.
* **“COD”** means payment made directly to the delivery agent/store at the time of delivery.
* **“Delivery Slot”** means the time window set by the Partner to fulfill an order.
* **“Payout”** refers to the net amount payable to the Partner after deduction of Aiva’s commission and applicable fees.
* **“Catalog”** means the product listing (title, image, description, price) shown by the Partner or via the Aiva global database.

---

### 2. **Purpose of This Agreement**

This Agreement governs the relationship between Aiva and the Partner for:

* Listing and displaying grocery or other eligible products on the Aiva platform
* Enabling the Partner to receive and fulfill customer orders
* Managing logistics, payments, taxes, and delivery independently
* Defining financial and operational responsibilities clearly between both parties
* Governing the Partner's appointment and management of their own delivery personnel (Partner Delivery Agents) through the Aiva Agents App, and defining the corresponding roles and responsibilities.

Nothing in this Agreement shall be construed to create a partnership, joint venture, agency, or employment relationship. The Partner operates as an **independent business**, solely responsible for their pricing, inventory, staff, delivery, and compliance.

---

### 3. **Onboarding & Activation**

#### 3.1 Documentation & Verification

To begin listing products on Aiva, the Partner must provide:

* Valid mobile number and email ID
* Store name and physical address with accurate geolocation
* Government-issued ID (for individual merchants) or registration certificate (for entities)
* **GSTIN** and **PAN number** if applicable
* Active bank account with IFSC for receiving payouts
* Any other document or detail requested by Aiva for verification

#### 3.2 Acceptance

This Agreement becomes effective upon:

* Digital acceptance via app interface or online form
* Verification of submitted information by Aiva’s onboarding team
* Activation of the Partner’s listing dashboard within the platform

Aiva reserves the right to reject or delay onboarding at its sole discretion, without obligation to provide reasons.

#### 3.3 Partner Data & Privacy

* The Partner acknowledges and agrees to the terms outlined in the separate **Aiva-Partner Privacy Policy**, which governs the collection, use, storage, and sharing of the Partner's Personal Data, Sensitive Personal Data (including Bank details, PAN, and GSTIN), and Operational Data. The Partner represents that they have read and fully understood the Privacy Policy (accessible at [https://www.thegoaiva.com/policies/13partner-privacy](https://www.thegoaiva.com/policies/13partner-privacy)), and acceptance of this Agreement constitutes acceptance of the Privacy Policy as well.
* The Partner is responsible for ensuring that all **Partner Delivery Agents (PDAs)** also adhere to the Aiva-Partner Privacy Policy and are explicitly instructed by the Partner to use Customer Personal Data (including name, address, and phone number) strictly for the purpose of fulfilling the assigned Order or Return Request and for no other purpose. The Partner agrees to be fully liable for any misuse, data breach, or unauthorized retention of Customer Personal Data by its PDAs.

---

### 4. **Product Listings & Catalog Rights**

#### 4.1 Right to List Products

The Partner may list products on the Aiva platform through:

* Manual upload via the Partner dashboard
* Selection from Aiva’s curated **global catalog**
* Bulk upload tools (if made available)

All listings must include:

* Product title and category
* Selling price, MRP, discounts (if applicable)
* Stock quantity
* Product image (original or from global database)
* Descriptive details (brand, size, weight, etc.)

The Partner is solely responsible for ensuring that all listings:

* Are accurate, truthful, and not misleading
* Do not infringe upon third-party intellectual property rights
* Reflect current availability and pricing in the physical store

---

#### 4.2 Use of Global Catalog

Aiva may provide access to a global/shared catalog of common grocery items for faster listing. When using it:

* The Partner may modify product names, prices, images, and quantities to suit their store
* However, modified products will remain under the Partner’s ownership unless explicitly contributed back to the global catalog

If the Partner **uploads original product images, names, or content**, that material may:

* Be automatically added to the global Aiva catalog
* Be used by other partners as a base template (they may further edit it)
* Be reviewed or moderated by Aiva for compliance

---

#### 4.3 Content Ownership & Copyright

By uploading product data or images, the Partner:

* Warrants that they are the legal owner or licensee of such content
* Agrees not to upload logos, photos, or descriptions taken from third-party brands or websites without permission
* Grants Aiva a **perpetual, worldwide, royalty-free license** to use, display, and distribute the uploaded content on the platform or for marketing purposes

If any content is found to be in violation of applicable copyright laws, Aiva may:

* Remove the offending item(s) from the platform
* Suspend or restrict the Partner’s catalog privileges
* Report the violation to legal authorities or rights holders
* Recover damages or legal costs if Aiva faces third-party claims

---

#### 4.4 Accuracy & Misrepresentation

The Partner agrees that:

* Product prices, discount values, and descriptions will not be deceptive
* Stock quantities will be updated regularly
* Offers shown to customers are genuine and available until sold out
* Any discrepancies, including wrong orders or prices, are the Partner’s liability

Aiva shall not be liable for any order cancellation, refund, or customer complaint arising from inaccurate listings, stock mismatches, or incorrect pricing.

---

### 5. **Order Fulfillment & Processing**

#### 5.1 Order Acceptance Window

For every order placed through the Aiva platform:

* The Partner shall receive a real-time notification
* The Partner shall have **10 minutes** from the time of receipt to **accept or reject** the order
* Failure to respond within the 10-minute window will result in **automatic rejection**

Once accepted, the Partner:

* Is **bound to fulfill** the order as per the confirmed item list and scheduled delivery
* May **not cancel** the order unilaterally
* Must ensure packaging and readiness within a reasonable time frame based on selected delivery slot

---

#### 5.2 Delivery Slot Management

The Partner is responsible for managing their delivery commitments. This includes:

* Setting up at least one **Standard Delivery Slot** (e.g., 9–11 AM, 5–7 PM) to activate store visibility
* Optionally enabling **Instant Delivery**, subject to delivery staff availability and configuration
* Defining delivery charges, free delivery thresholds, and geographic radius accurately

Aiva does not guarantee or enforce delivery time commitments. The Partner is solely accountable to the customer for timing, delays, and communication regarding delivery.

---

#### 5.3 Delivery Execution

The Partner must arrange for delivery using its own logistics resources, which may include:

* In-store staff
* External delivery agents
* Third-party tie-ups not affiliated with Aiva

Aiva does not provide or manage delivery agents at this time. The Partner:

* Must ensure that delivery agents are properly instructed, timely, and professional
* Shall be liable for theft, damage, or misconduct by their delivery staff
* Must update the order status (e.g., “Delivered”) accurately within the platform
* A Partner Delivery Agent shall only have access to the minimum necessary Customer Personal Data required for delivery (Name, Address, Phone Number), which must be promptly deleted or destroyed by the PDA upon successful completion or rejection of the Order/Return Request.
* If a Partner Delivery Agent rejects an Order or Return Request, the Partner shall ensure that the agent uploads a valid proof of rejection, which may include an image or video, and the Partner is responsible for the accuracy and validity of this evidence.

---

#### 5.4 Partner Delivery Agent Management

* The Partner is granted access to a management feature to create and manage up to four (4) complimentary Partner Delivery Agent (PDA) accounts within the Platform. The Partner acknowledges that this limit is fixed and may be changed by Aiva upon prior notice
* The Partner retains complete control and sole responsibility for all aspects of the PDA accounts, including: (a) Creation of username and password; (b) Updating account details (name, mobile number, password); and (c) Deactivating or permanently deleting the account
* The Partner warrants that all appointed PDAs are legally authorized to work, have been appropriately trained, and will comply with the terms of this Agreement in their delivery duties
* The Partner acknowledges that Aiva is not responsible for the PDA’s actions, conduct, or compliance, and that the Partner-PDA relationship is solely that of employer-employee or contractor, with Aiva being a mere technology provider for management access
* The Partner acknowledges that all Partner Delivery Agents (PDAs) utilizing the Aiva Agents App are subject to the separate **Aiva Delivery Agent Privacy Policy (accessible at [https://www.thegoaiva.com/14agents-privacy])**, and the Partner is solely responsible for ensuring that their PDAs have read, understood, and agreed to these terms prior to commencing work on the Platform.

---

#### 5.5 Non-Delivery & Delay

If a prepaid order is **marked “Delivered” but not actually delivered**, and the customer raises a valid dispute:

* Aiva may issue a **full refund** to the customer
* The Partner may be penalized or blocked from receiving future prepaid orders
* Repeated incidents may result in permanent delisting from the platform

If a Partner **frequently delays** deliveries or fails to deliver during committed slots, Aiva reserves the right to:

* Reduce store visibility in search results
* Impose service-level penalties
* Suspend the store temporarily or permanently

---

#### 5.6 Rejections & No-Shows

A Partner may reject an order within the 10-minute window for reasons such as:

* Stock unavailability
* Technical issues
* Unserviceable address

However, frequent manual rejections or “no-action” auto-rejections may lead to:

* Store ranking penalties
* Operational audits
* Temporary or permanent suspension from the platform

Once an order is accepted, **no manual rejection is permitted**, and failure to fulfill will be considered a violation.

---

### 6. **Payments, Commissions & Payouts**

#### 6.1 Commission Structure

Aiva shall charge a platform service fee on each successfully delivered order, as follows:

* **₹20 or 3% of the order value (whichever is higher)**
* This commission is **exclusive of GST** and **non-refundable** once the order is delivered or prepaid refund is processed
* Commission is applied uniformly across Prepaid and COD orders

Aiva reserves the right to revise commission terms upon notice via app/email, with changes applying prospectively to new orders only.

---

#### 6.2 Prepaid Order Settlement

For orders paid online via Razorpay (UPI, cards, wallets, net banking):

* Aiva will collect the full order amount on behalf of the Partner
* Aiva will deduct:

  * Platform commission
  * Razorpay transaction fee
  * Any applicable taxes (GST, TCS, etc.)
* The remaining amount (“Net Payout”) will be reflected in the Partner’s ledger
* Settlements will follow Razorpay’s banking cycle, typically **T+1 or T+2 business days**

---

#### 6.3 Cash-on-Delivery (COD) Handling

For COD orders:

* Partner or their delivery agent shall collect payment directly from the customer
* However, Aiva will still:

  * Record the transaction
  * Calculate the platform commission
  * Deduct the fee from the Partner’s next Prepaid ledger balance or generate a monthly invoice if COD-only

If a Partner consistently receives only COD orders and fails to clear platform dues:

* Aiva may **suspend future COD orders**
* Initiate payout blocking or **legal recovery**
* Charge penalties or service interruption fees

---

### 7. **GST, Invoicing & Compliance**

#### 7.1 GST & Tax Obligations

* The Partner must hold a valid **GST registration** if required under Indian tax laws
* All product listings must include **GST-inclusive pricing**
* Aiva will deduct **TCS (Tax Collected at Source)** under Section 52 of the CGST Act and file returns under **GSTR-8**
* TCS statements will be shared with the Partner monthly

#### 7.2 Invoicing

* If the Partner provides a valid GSTIN, Aiva may generate customer-facing invoices on the Partner’s behalf
* The Partner remains liable for:

  * Filing correct GST returns
  * Remitting any differential taxes
  * Responding to GST audit queries

#### 7.3 Disclaimers

* Aiva shall not be liable for any non-compliance, tax penalties, or audit notices triggered by the Partner’s failure to maintain valid registration, HSN codes, or input tax records
* Partners agree to indemnify Aiva from all liabilities arising from their tax practices

---

### 8. **Customer Complaints & Returns**

#### 8.1 Return Eligibility

Customers may request returns for:

* Expired or spoiled goods
* Damaged, broken, or leaking items
* Wrong items or incorrect quantity
* Tampered packaging

Such requests must be raised within **12 hours of delivery**. The Partner agrees to:

* Respond to return requests within a reasonable timeframe (ideally 24 hours)
* Accept valid returns and coordinate reverse logistics, if applicable
* Bear the cost of product refund or replacement

If the Partner fails to respond or resolve a legitimate issue:

* Aiva may refund the customer directly
* The refund amount will be **deducted from the Partner’s ledger or next payout**

---

#### 8.2 Dispute Resolution

In case of disagreement between the Partner and the customer over a return or refund:

* Aiva may act as a **neutral mediator**
* The Platform’s final decision will be **binding** unless overridden by law or arbitration
* Repeated disputes caused by Partner-side issues may result in penalties or review of store eligibility

---

### 9. **Fraud, Misuse & Penalties**

The Partner agrees not to engage in or facilitate any form of fraudulent behavior, including but not limited to:

* Falsely marking undelivered prepaid orders as “Delivered”
* Misappropriating COD cash and marking orders as “Cancelled”
* Uploading counterfeit products or expired goods
* Repeated cancellation of accepted orders
* Tampering with catalog listings to exploit pricing glitches or app bugs

#### 9.1 Penalties for Violations:

Depending on severity and frequency, Aiva may:

* Impose **monetary penalties** or deduct from payouts
* Block **COD or Prepaid eligibility**
* Withhold settlements for further investigation
* Permanently **suspend or delist** the Partner from the platform
* Initiate **legal proceedings** in case of financial fraud

Partners will be notified of serious violations by email or app alert. However, Aiva is not obligated to provide advance notice for termination in case of fraud.

---

### 10. **Analytics & Data Access**

Aiva provides Partners with access to a performance dashboard including:

* Order history
* Earnings and commission reports
* Delivery logs
* Product performance metrics

This data is for internal use only. Accuracy and real-time updates are not guaranteed and may be subject to technical limitations or third-party delays (e.g., Supabase outages).

Partners agree not to scrape, export, or redistribute analytics data without permission.

---

### 11. **Term & Termination**

This Agreement:

* Comes into effect upon electronic acceptance
* Continues until terminated by either party with written notice

Aiva may terminate the Agreement immediately, without liability, if:

* Fraud, non-compliance, or repeated violations are detected
* Store becomes inactive for an extended period
* Regulatory orders require takedown or delisting

Upon termination:

* Pending settlements will be processed as per platform policies
* All listing rights and catalog content may be removed
* Legal liabilities arising before termination shall survive this Agreement

---

### 12. **Indemnity**

The Partner agrees to indemnify, defend, and hold harmless Aiva, its directors, officers, employees, affiliates, and agents from and against any and all losses, claims, liabilities, damages, fines, penalties, costs, and expenses (including reasonable legal fees) arising out of or relating to:

* Breach of this Agreement or any platform policy
* Violation of any applicable law, tax regulation, or consumer protection rule
* Intellectual property infringement in catalog listings or content uploads
* Customer disputes or complaints resulting from Partner negligence, fraud, or non-compliance
* Product defects, expiry, contamination, or safety issues

This obligation survives the termination of the Agreement.

---

### 13. **Limitation of Liability**

To the fullest extent permitted under applicable law, Aiva shall not be liable to the Partner for:

* Loss of revenue, profits, or business
* Indirect, incidental, or consequential damages
* Delay or failure in performance due to force majeure, server downtime, or third-party service failures
* Errors or inaccuracies in analytics or app-generated reports
* Actions taken in good faith for fraud prevention, content moderation, or customer protection

Aiva’s total aggregate liability shall be limited to the amount of commission collected from the Partner in the **three months preceding the claim**.

---

### 14. **Governing Law & Dispute Resolution**

This Agreement shall be governed by and construed in accordance with the laws of **India**.

Any dispute arising under or in connection with this Agreement shall:

* First be attempted to be resolved through mutual discussions
* If unresolved within 30 days, be referred to **binding arbitration** under the **Arbitration and Conciliation Act, 1996**
* The seat and venue of arbitration shall be **Bhopal, Madhya Pradesh**, and the language shall be English

Subject to arbitration, the courts of Bhopal shall have exclusive jurisdiction over all legal proceedings related to this Agreement.

---

### 15. **Miscellaneous**

#### 15.1 Entire Agreement

This Agreement constitutes the full and exclusive understanding between Aiva and the Partner. It supersedes all prior communications or arrangements.

#### 15.2 Amendments

Aiva may modify this Agreement from time to time. The updated version will be shared via the app and shall be deemed accepted upon continued use of the Partner dashboard.

#### 15.3 Waiver & Severability

Failure by Aiva to enforce any clause shall not constitute a waiver. If any provision is held unenforceable, the rest of the Agreement shall remain in force.

#### 15.4 Notices

All official communication shall be sent via the app or to the email registered by the Partner.

---

**By accepting this Agreement, the Partner acknowledges full understanding of its terms and agrees to be legally bound.**

**Signed digitally / accepted on registration via Aiva Partner Platform.**

---

`
const headings = [
  { id: '1-definitions', label: '1. Definitions' },
  { id: '2-purpose-of-this-agreement', label: '2. Purpose of This Agreement' },
  { id: '3-onboarding--activation', label: '3. Onboarding & Activation' },
  { id: '4-product-listings--catalog-rights', label: '4. Product Listings & Catalog Rights' },
  { id: '5-order-fulfillment--processing', label: '5. Order Fulfillment & Processing' },
  { id: '6-payments-commissions--payouts', label: '6. Payments, Commissions & Payouts' },
  { id: '7-gst-invoicing--compliance', label: '7. GST, Invoicing & Compliance' },
  { id: '8-customer-complaints--returns', label: '8. Customer Complaints & Returns' },
  { id: '9-fraud-misuse--penalties', label: '9. Fraud, Misuse & Penalties' },
  { id: '10-analytics--data-access', label: '10. Analytics & Data Access' },
  { id: '11-term--termination', label: '11. Term & Termination' },
  { id: '12-indemnity', label: '12. Indemnity' },
  { id: '13-limitation-of-liability', label: '13. Limitation of Liability' },
  { id: '14-governing-law--dispute-resolution', label: '14. Governing Law & Dispute Resolution' },
  { id: '15-miscellaneous', label: '15. Miscellaneous' },
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
            Aiva – Partner Agreement
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
