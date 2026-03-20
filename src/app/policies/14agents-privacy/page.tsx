//app/policies/14agents-privacy.tsx
'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image' // Assuming the logo image is needed

// --- START: Delivery Agent Specific Markdown Content ---
const markdown = `

### 1. **Introduction & Applicability**

Welcome to the **Aiva Agents App**. This Privacy Policy describes how **Aiva Private Limited** (“Aiva,” “We,” “Our,” or “Platform”) collects, uses, stores, and shares the personal and operational information of individuals appointed by a registered Partner Store as a **Partner Delivery Agent (PDA)** ("You" or "Your") when you use the Aiva Agents App (the PDA App) to fulfill orders and return requests.

**Important Note:** The creation, management, and termination of your account are handled **entirely by the Partner Store owner** who employs or contracts you. Aiva is a technology provider, and your relationship is solely with the Partner Store.

By logging into and using the Aiva Agents App, you agree to the practices described in this Privacy Policy. This policy is designed to comply with applicable Indian laws, including the **Digital Personal Data Protection Act (DPDP), 2023**.

This policy applies specifically to all individuals using the Aiva Agents App to process deliveries and returns for an Aiva Partner Store.

---

### 2. **Information We Collect from Partner Delivery Agents (PDAs)**

We collect the following categories of data related to your PDA account and activity:

#### A. **Registration & Contact Data (Provided by Partner)**

This information is provided and managed by the Partner Store owner:

* **Basic PII:** Your Name, Mobile Number, and unique Username.
* **Security Data:** Your Hashed Password (Aiva does not store or access your plain-text password).

#### B. **Operational Data (Generated via App Use)**

* **Transaction Logs:** Details of orders and return requests assigned to you, including item lists, Order IDs, and timestamps.
* **Delivery Status Updates:** Records of actions taken on the app (e.g., "Out for Delivery," "Delivered," "Rejected").
* **Proof of Rejection Media:** Images or videos uploaded by you to substantiate the rejection of an order or return request.
* **Customer Interaction Logs:** Records of your usage of the in-app navigation button (which opens third-party map applications) and interaction with customer contact details.

#### C. **Device & Technical Data**

* **Aiva Agents App Usage:** App version, device ID, IP address, and technical logs (for security and troubleshooting).
* **Geo-location Data (Optional):** Limited, non-real-time location data may be collected at the time of order status updates (e.g., "Delivered") to verify successful completion within the delivery zone.

**Note on Sensitive Data:** Aiva **does not** collect your personal financial data (Bank A/C, PAN, GSTIN) through the PDA App, as your payment and employment relationship is directly with the Partner Store.

---

### 3. **How We Use Your PDA Information**

We use your information solely for the purposes necessary to facilitate logistics and report back to the Partner Store:

#### A. **To Enable Logistics & Order Fulfillment**

* To authenticate your login credentials (username and hashed password).
* To display assigned Order and Return Request details in your dashboard.
* To record and confirm successful delivery or valid rejection status to the Customer and the Partner Store.

#### B. **To Maintain Platform Integrity**

* To verify and audit delivery/rejection logs for platform safety and dispute resolution.
* To investigate instances of fraud, non-compliance, or misuse of customer data.

#### C. **For Product Improvement**

* To analyze app usage patterns and technical logs to improve the stability and performance of the Aiva Agents App.

We do not use your personal information for targeted advertising or share it for marketing purposes.

---

### 4. **Customer Personal Data Access & Handling**

As a PDA, you are granted **temporary and limited access** to Customer Personal Data (PII) for delivery purposes only:

* **Customer PII Accessed:** Name, Delivery Address, and Mobile Number.
* **Purpose Limitation:** This PII must be used **strictly and exclusively** for fulfilling the specific assigned Order or Return Request (e.g., navigating to the location or contacting the customer regarding the delivery).
* **No Retention:** You must **not** record, store, or retain this Customer PII outside of the Aiva Agents App after the delivery or return request is completed or rejected.
* **Liability:** Any misuse, unauthorized retention, or sharing of Customer PII by you constitutes a violation of this policy and the Aiva-Partner Agreement, for which the Partner Store is liable.

---

### 5. **App Permissions & Device Access**

To function correctly, the Aiva Agents App may request permission to access the following:

#### Mandatory Permissions:

* **Camera & Gallery:** To capture and upload proof images/videos required for rejected deliveries/returns.
* **Location Access (When App is Active):** Used solely to facilitate navigation via third-party maps (like Google Maps) and to verify location at the point of status updates ("Delivered").

#### Optional Permissions:

* **Push Notifications:** To receive real-time alerts for new orders assigned by the Partner Store.

Restricting mandatory permissions will prevent the PDA App from operating correctly and fulfilling assigned orders.

---

### 6. **Data Sharing with Third Parties**

We share your PDA data only when necessary for platform operation or as required by law:

#### A. **Partner Store Owner**

* Your **Name, Username, Mobile Number, and all Operational Data** (Order Logs, Status Updates, Proof Media) are shared directly with the Partner Store owner who created and manages your account.

#### B. **Third-Party Service Providers**

* **Mapping Services:** When you click the navigation button, the relevant Customer Address is temporarily shared with Google Maps or Apple Maps (or similar providers) to generate directions.
* **Technical Providers:** Anonymized usage data may be shared with analytics providers to diagnose technical issues.

#### C. **Legal Authorities**

* Data may be shared with government authorities, courts, or law enforcement in response to a lawful request or as required by Indian law.

---

### 7. **Data Retention & Account Management**

Your PDA account and associated data are controlled by the Partner Store owner.

* **Retention:** We retain your operational data (logs, status updates, rejection proofs) for as long as is necessary to comply with legal record-keeping requirements and to support the Partner Store’s records, even after the account is deactivated.
* **Account Deletion/Deactivation:** Your account can only be **deactivated or deleted by the Partner Store owner**. If your relationship with the Partner Store ends, you must inform them to promptly deactivate your access.
* **Data Subject Requests:** Any request related to your personal data (access, correction, or erasure) must be submitted via Aiva, but Aiva will typically require verification and authorization from the managing Partner Store before acting, as they are your employer/contracting party.

---

### 8. **Data Security Measures**

We implement commercially reasonable security measures to protect your data, including:

* **Hashing:** Your account password is cryptographically hashed for secure storage.
* **Access Control:** Access to the Aiva Agents App requires a unique username and password.
* **Secure Infrastructure:** We use secure cloud infrastructure with appropriate security safeguards.

You are responsible for maintaining the confidentiality of your login credentials and must notify the Partner Store owner immediately in case of suspected security breach or unauthorized access.

---

### 9. **Changes to This Privacy Policy**

We may update or amend this Privacy Policy from time to time. When we do, we will:

* Post the revised version online and within the Aiva Agents App.
* The "Last Updated" date at the top of the policy will reflect the latest revision.

Your continued use of the Aiva Agents App after any changes constitutes acceptance of the new terms.

---

### 10. **Contact Us (Grievance Redressal)**

If you have any questions or complaints regarding this Privacy Policy or your personal data, you can contact us at:

**Company Name:** Aiva Private Limited

**Registered Address:** Plot No. 287-A, Goyal Homes, G-2, Sec-B, Shahpura, Bhopal, Madhya Pradesh 462016

**Support Email:** info@thegoaiva.com

**Support Timing:** Monday to Saturday, 10:00 AM – 6:00 PM IST (excluding public holidays)

---

`
// --- END: Delivery Agent Specific Markdown Content ---

const headings = [
    { id: '1-introduction-applicability', label: '1. Introduction & Applicability' },
    { id: '2-information-we-collect-from-partner-delivery-agents-pdas', label: '2. Information We Collect from Partner Delivery Agents (PDAs)' },
    { id: '3-how-we-use-your-pda-information', label: '3. How We Use Your PDA Information' },
    { id: '4-customer-personal-data-access-handling', label: '4. Customer Personal Data Access & Handling' },
    { id: '5-app-permissions-device-access', label: '5. App Permissions & Device Access' },
    { id: '6-data-sharing-with-third-parties', label: '6. Data Sharing with Third Parties' },
    { id: '7-data-retention-account-management', label: '7. Data Retention & Account Management' },
    { id: '8-data-security-measures', label: '8. Data Security Measures' },
    { id: '9-changes-to-this-privacy-policy', label: '9. Changes to This Privacy Policy' },
    { id: '10-contact-us-grievance-redressal', label: '10. Contact Us (Grievance Redressal)' },
]

export default function AgentPrivacyPolicy() {
    const [showTocMobile, setShowTocMobile] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)

    useEffect(() => {
        const toggle = () => setShowScrollTop(window.scrollY > 400)
        window.addEventListener('scroll', toggle)
        return () => window.removeEventListener('scroll', toggle)
    }, [])

    // Ensure the date below is set to the correct current/future date for your launch
    const lastUpdatedDate = 'July 2025'

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
                        Aiva – Delivery Agent Privacy Policy
                    </h1>
                    <p className="text-center text-sm text-muted-foreground mb-8">
                        Last updated: {lastUpdatedDate} ·{' '}
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