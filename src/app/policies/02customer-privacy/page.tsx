//app/policies/01customer-privacy/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image'

const markdown = `

### 1. **Introduction**

Welcome to **Aiva**. This Privacy Policy describes how we collect, use, store, and share your personal information when you use our mobile application, website, and services (collectively, the “Platform”).

This policy is intended to comply with applicable Indian laws, including the **Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011**, and the **Digital Personal Data Protection Act (DPDP), 2023**, where applicable.

By accessing or using the Aiva platform, you agree to the practices described in this Privacy Policy. If you do not agree with any part of this policy, please do not use our services.

This policy applies to all customers using the Aiva app or website to browse, place orders, interact with our AI chatbot, or otherwise engage with the platform.

---

### 2. **Information We Collect**

We collect the following categories of data from you, either directly, indirectly, or through your device:

#### A. **Personal Identifiable Information (PII)**

* **Name**
* **Phone number** (mandatory for account access and verification)
* **Email address** (optional, but required for some features)
* **Delivery address**, including full street and GPS-based lat/lng coordinates
* **Date of birth, gender** (optional — for personalization)

#### B. **Device & Network Data**

* **Device ID and model**
* **IP address**
* **Operating system and version**
* **App usage behavior, crash logs, and session duration**

#### C. **Transactional Data**

* Order history (products ordered, store selected, payment method)
* Razorpay transaction ID, payment success/failure logs
* Delivery status, ratings submitted, return/refund interactions

#### D. **AI & Interaction Data**

* Chatbot queries and response history
* Voice input transcriptions (once voice features are live)
* Search queries and navigation patterns

#### E. **Uploaded Content**

* Images, ratings, and written reviews submitted by you
* Photos or media attached to store feedback

We collect this data through:

* Account creation and login
* Order placement and checkout
* App permissions you grant (camera, location, microphone)
* Cookies and tracking tools used by the app
* Customer support chats and ticket interactions

---

### 3. **How We Use Your Information**

We use your information for the following purposes:

#### A. **To Provide Core Platform Services**

* Register and maintain your account
* Verify your identity for login and order processing
* Match you with nearby stores using your GPS location
* Place, confirm, and track your orders
* Facilitate payments, refunds, and delivery tracking

#### B. **To Improve Personalization**

* Recommend stores or products based on your preferences
* Show you offers relevant to your order history or nearby locations
* Customize the app experience based on your language, gender, or past usage

#### C. **To Enhance Support & Dispute Handling**

* Provide real-time customer support
* Resolve disputes related to store behavior, product quality, or delivery
* Record and analyze previous orders to improve assistance accuracy

#### D. **To Power AI and Voice Features**

* Respond to your product queries and commands through the AI assistant
* Train and improve chatbot performance using past interactions
* Process voice commands for smart ordering (when voice is launched)

#### E. **To Ensure Compliance & Security**

* Detect and prevent fraud, fake orders, or app misuse
* Comply with GST regulations, data retention laws, and lawful government requests
* Secure your session using device, IP, and location signals

We do not sell or rent your personal data to any third party.

---

### 4. **AI, Voice Features & Smart Assistant Data**

The Aiva platform includes an AI-powered assistant designed to help you:

* Find products or stores
* Receive suggestions based on your past activity
* Ask general grocery-related queries
* In future versions, place orders using voice commands

#### Consent for AI Interaction:

By using the Smart Assistant, you agree that:

* Your messages and interactions may be **logged, stored, and analyzed**
* Transcripts of your chats may be reviewed by humans for quality, fraud detection, or model training
* Voice input (once enabled) will be **converted into text** and processed accordingly
* AI-generated responses may be **based on patterns or past data**, and could occasionally be inaccurate or incomplete

#### No Guarantee from AI:

* AI outputs are intended to assist — not replace human advice, real-time support, or store confirmations
* Aiva is **not liable** for any errors, confusion, or missed orders caused by reliance on chatbot or voice-based suggestions

You may opt out of future AI/voice features from your app settings (once the opt-out option becomes available).

---

### 5. **App Permissions & Device Access**

To provide a seamless experience, Aiva may request permission to access the following on your mobile device:

#### Mandatory Permissions:

* **Location Access (GPS):** To show nearby stores and delivery options
* **Phone Number & Email:** For login, identity verification, and communication
* **Device ID/IP Address:** To prevent fraud, detect session changes, and improve security

#### Optional Permissions:

* **Camera & Gallery Access:** For uploading images with store reviews or feedback
* **Microphone:** To enable voice ordering (when the feature is launched)
* **Push Notifications:** To receive updates about orders, offers, refunds, and customer service

You have full control over these permissions. You can enable or disable them at any time from your phone settings. However, restricting certain permissions may limit the app’s functionality.

---

### 6. **Cookies, Analytics & Tracking Technologies**

We use in-app tracking tools and analytics services to:

* Understand how users interact with the app
* Diagnose bugs, crashes, or lags
* Improve app performance and layout
* Recommend products and stores based on your browsing habits
* Show personalized offers and promotions (in future versions)

#### Tracking Tools Used:

* Session tokens and browser/device identifiers
* Device model, OS version, and screen usage patterns
* Aggregated behavior insights (e.g., which store types you browse most)

We do **not use cross-app behavioral tracking** or sell your data to ad networks. However, if and when we introduce **sponsored listings or in-app ads**, we will:

* Clearly label promoted content (e.g., “Sponsored” or “Ad”)
* Respect your ad preferences and regional data laws
* Provide an opt-out method where applicable

If a web version of Aiva is launched in the future, cookie consent banners and settings will be implemented in accordance with browser-based privacy regulations.

---

### 7. **Data Sharing with Third Parties**

We may share your data **only when necessary** to operate the platform, comply with law, or fulfill services. Examples include:

#### A. **Payment Gateway Providers**

* Your order and transaction details may be shared with **Razorpay** to process payments, refunds, or verify fraud.
* Razorpay may use this data under its own privacy policy, and you are advised to review it on their official website.

#### B. **AI & Analytics Providers**

* Chat interactions and usage metrics may be shared with **OpenAI** for powering our assistant.
* We may use tools (e.g., Supabase Analytics, Google Analytics, Railway) for technical diagnostics and performance tuning.

#### C. **Government Authorities**

* If required by law or regulation (e.g., GST audits, fraud investigations), Aiva may share relevant user or order data with:

  * Tax departments (for GST/TCS)
  * Consumer protection authorities
  * Courts or law enforcement agencies with valid legal process

#### D. **Store Partners**

* We may share your order details (name, address, contact) with the selected store to fulfill the delivery
* Store owners are contractually bound to protect your data and use it solely for order fulfillment

We never share or sell your personal information to advertisers or unrelated third parties.

---

### 8. **Data Retention & Deletion**

We retain your personal data only for as long as is necessary to:

* Fulfill the purpose for which it was collected (e.g., order processing, customer support)
* Comply with legal or regulatory requirements (e.g., tax filings, fraud tracking)
* Resolve disputes, enforce our policies, or detect misuse

#### Account Deletion & Erasure (Right to be Forgotten)

If you wish to permanently delete your account and associated personal data, we provide two methods:

1.  **In-App Request:** Use the dedicated "Delete Account" feature within the Aiva mobile application settings.
2.  **Web Request:** You may also submit a formal deletion request via our dedicated web form: **[https://www.thegoaiva.com/delete-account](https://www.thegoaiva.com/delete-account)**

Upon receiving a valid deletion request, your account will be **deactivated**, and the permanent data erasure process will begin. We will remove your personal data from active systems within **21 working days** of verification, in line with industry best practices and regulatory guidance.

**Retention Exceptions:** Some metadata (e.g., fraud flags, historical payment logs, anonymized aggregated statistics, and publicly visible reviews/ratings) may be retained for security, legal compliance (including Indian tax laws/GST), and regulatory purposes even after account deletion. This retained data will no longer be linked back to your personal identity.

---

### 9. **Your Rights Under Indian Law**

As a customer on the Aiva platform, you have the following rights under the **Digital Personal Data Protection Act, 2023** and IT Rules:

#### A. **Right to Access**

You can request details about what personal information we hold about you.

#### B. **Right to Correction**

You may correct or update your profile data (e.g., phone, email, name, address) directly in the app. If you believe other stored information is incorrect, you can contact support.

#### C. **Right to Erasure (Right to be Forgotten)**

You can delete your account and request full removal of your data unless we are required to retain it under law.

#### D. **Right to Withdraw Consent**

If you change your mind about data use (e.g., AI personalization), you may withdraw your consent by adjusting your app settings (where applicable) or writing to our support team.

#### E. **Right to File a Complaint**

You have the right to lodge a complaint with India’s Data Protection Board (once operational) if you believe your data rights have been violated.

---

### 10. **Data Security Measures**

We take the protection of your data seriously and implement commercially reasonable security measures to protect against unauthorized access, disclosure, loss, or misuse. These include:

* End-to-end encryption on sensitive data fields
* Authentication tokens for session integrity
* Secure access to our Supabase database infrastructure
* Regular monitoring and access control

However, no method of electronic transmission or storage is 100% secure. Therefore, while we strive to use best practices, we cannot guarantee absolute security.

You are responsible for maintaining the confidentiality of your app login credentials and must notify us immediately in case of suspected misuse.

---

### 11. **Children’s Data**

Aiva is not intended for individuals under the age of **18**. We do not knowingly collect personal data from children. If we discover that a minor has created an account, we will take steps to deactivate it and remove any associated personal data.

---

### 12. **Changes to This Privacy Policy**

We may update or amend this Privacy Policy from time to time. When we do:

* We'll post the revised version in the app
* We'll notify you through in-app alerts, and via email for significant changes
* The "Last Updated" date at the top of the policy will reflect the latest revision

We encourage you to review the policy periodically to stay informed about how we handle your data.

---

### 13. **Contact Us**

If you have any questions, complaints, or requests regarding this Privacy Policy or your personal data, you can contact us at:

**Company Name:** Aiva Stores Private Limited

**Registered Address:** Plot No. 287-A, Goyal Homes, G-2, Sec-B, Shahpura, Bhopal, Madhya Pradesh 462016

**Support Email:** \info@thegoaiva.com

**Support Timing:** Monday to Saturday, 10:00 AM – 6:00 PM IST (excluding public holidays)

---

`

const headings = [
  { id: '1-introduction', label: '1. Introduction' },
  { id: '2-information-we-collect', label: '2. Information We Collect' },
  { id: '3-how-we-use-your-information', label: '3. How We Use Your Information' },
  { id: '4-ai-voice-features--smart-assistant-data', label: '4. AI, Voice Features & Smart Assistant Data' },
  { id: '5-app-permissions--device-access', label: '5. App Permissions & Device Access' },
  { id: '6-cookies-analytics--tracking-technologies', label: '6. Cookies, Analytics & Tracking Technologies' },
  { id: '7-data-sharing-with-third-parties', label: '7. Data Sharing with Third Parties' },
  { id: '8-data-retention--deletion', label: '8. Data Retention & Deletion' },
  { id: '9-your-rights-under-indian-law', label: '9. Your Rights Under Indian Law' },
  { id: '10-data-security-measures', label: '10. Data Security Measures' },
  { id: '11-childrens-data', label: '11. Children’s Data' },
  { id: '12-changes-to-this-privacy-policy', label: '12. Changes to This Privacy Policy' },
  { id: '13-contact-us', label: '13. Contact Us' },
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
            Aiva – Customer Privacy Policy
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
