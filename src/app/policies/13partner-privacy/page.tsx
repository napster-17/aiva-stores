//app/policies/13partner-privacy/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Image from 'next/image'

// --- START: Partner Specific Markdown Content ---
const markdown = `

### 1. **Introduction & Applicability**

Welcome to the **Aiva Partner Platform**. This Privacy Policy describes how **Aiva Private Limited** (“Aiva,” “We,” “Our,” or “Platform”) collects, uses, stores, and shares the personal and operational information of our Store Partners (“Partner,” “You,” or “Your Store”) when you use the Aiva Partner mobile application, website, and services.

This policy is an integral part of the **Aiva-Partner Agreement** and is designed to comply with applicable Indian laws, including the **Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011**, and the **Digital Personal Data Protection Act (DPDP), 2023**, where applicable to Partner-provided data.

By submitting your registration and accepting the Aiva-Partner Agreement, you also agree to the practices described in this Privacy Policy. If you do not agree with any part of this policy, please do not use our services.

This policy applies specifically to all **kirana stores, merchants, and entities** onboarded to list and sell products through the Aiva Partner Platform.

---

### 2. **Information We Collect from Partners**

We collect the following categories of data from you, primarily during onboarding and continued use of the Partner App:

#### A. **Sensitive Personal Data (SPD) & Financial Information**

* **Bank Account Details:** Account number, IFSC code, and account holder name (mandatory for Payouts and settlements).
* **Government Identification:** Permanent Account Number (PAN) and Goods and Services Tax Identification Number (GSTIN).

#### B. **Operational & Contact Data**

* **Contact PII:** Store Manager Name, registered mobile number, and email address (for communication and alerts).
* **Store Geo-location:** Physical store address and verified GPS coordinates (for customer visibility and delivery radius settings).
* **Catalog & Pricing Data:** Product listings, inventory levels, maximum retail prices (MRP), and selling prices.
* **Store Media:** Uploaded store photos and product images/content (used for the Aiva global catalog and customer interface).

#### C. **Partner App Usage & Transactional Data**

* Order Logs: Accepted, rejected, and fulfilled orders, including timestamps, values, and fulfillment notes.
* Payout & Ledger History: Commission deductions, transaction fees, TDS/TCS details, and settlement reports.
* Delivery Logistics: Delivery slot configurations, charges, and delivery status updates.
* Device Data: Partner App version, device ID, IP address, and technical logs (for security and troubleshooting).

We collect this data through:

* Digital onboarding forms and document upload.
* Partner Dashboard inputs and catalog management.
* Real-time order processing within the Partner App.
* Banking/payment gateway data feeds (Razorpay).
* Customer interactions (ratings, complaints, returns).

---

### 3. **How We Use Partner Information**

We use your information solely for the purposes necessary to operate the marketplace, manage your store listing, and comply with legal obligations:

#### A. **To Manage Onboarding & Store Operations**

* Verify your identity and store location before activation.
* Display your store and products to customers based on geo-location and delivery radius.
* Send real-time order notifications and alerts via the Partner App.
* Provide access to the Partner Dashboard for analytics and reporting.

#### B. **To Process Payments & Financial Settlements**

* Calculate and deduct Aiva’s commission and applicable fees.
* Execute Net Payouts to your registered Bank Account.
* Manage outstanding balances and invoicing for COD orders.

#### C. **To Ensure Tax & Regulatory Compliance**

* **File TCS (Tax Collected at Source) returns (GSTR-8)** using your GSTIN and PAN as required by the CGST Act.
* Generate customer-facing invoices on your behalf.
* Respond to lawful requests from tax authorities, courts, or law enforcement.

#### D. **To Maintain Platform Integrity & Quality**

* Monitor order acceptance, rejection rates, and fulfillment times to ensure service levels.
* Investigate and prevent fraud, including false order markings or misuse of the platform.
* Mediate and resolve customer complaints, returns, and disputes.

We do not sell, rent, or use Partner Sensitive Personal Data for personalized advertising or marketing purposes unrelated to the Aiva platform.

---

### 4. **AI & Smart Features for Partners**

The Aiva Partner platform may include smart features designed to help you optimize store operations:

* **Sales Prediction:** Forecasting demand based on past order history.
* **Catalog Moderation:** Automated review of uploaded product images or descriptions.
* **Pricing Suggestions:** Recommendations based on market trends or competitor data.

By using these smart features, you agree that:

* Your sales data, inventory levels, and catalog content may be **logged, stored, and analyzed** to improve feature accuracy.
* This analysis is performed to provide **business insights** and **operational improvements** to your store.

---

### 5. **Partner App Permissions & Device Access**

To provide a seamless operational experience, Aiva may request permission to access the following on your mobile device:

#### Mandatory Permissions:

* **Location Access (GPS):** To verify store location, set delivery radius, and update store status.
* **Phone Number & Email:** For login, identity verification, and communication.
* **Device ID/IP Address:** To prevent fraud, detect session changes, and improve security.

#### Optional Permissions:

* **Camera & Gallery Access:** For quick catalog uploads or updating store images.
* **Push Notifications:** To receive real-time order alerts, payment confirmations, and support updates.

You have full control over these permissions. Restricting certain permissions may limit the Partner App’s operational functionality, particularly related to orders.

---

### 6. **Cookies, Analytics & Tracking Technologies**

We use in-app tracking tools and analytics services to:

* Understand how Partners interact with the dashboard.
* Diagnose technical issues or system lags specific to the Partner App.
* Improve the app's performance, reporting, and layout.
* Monitor key operational metrics like order volume and rejection rates.

These tools track app usage patterns, device information, and session tokens. We use this data solely for **internal optimization and service quality assurance**.

---

### 7. **Data Sharing with Third Parties**

We may share your data **only when necessary** for the functions defined in Section 3, or as required by law. Examples include:

#### A. **Payment & Banking Providers**

* Your bank account details and transaction history are shared with **Razorpay** and relevant banking institutions to process settlements and Payouts.

#### B. **Tax and Regulatory Authorities**

* Your GSTIN, PAN, and transaction details are mandatorily shared with the **GST Network and Income Tax Department** for **TCS (Tax Collected at Source)** compliance and filing GSTR-8 returns.
* Data may be shared with government authorities, courts, or auditors in response to a legal process, subpoena, or audit request.

#### C. **Customers**

* We share essential information, specifically your **Store Name, Store Address, and Geo-location**, with customers to facilitate order placement and store visibility.
* Your product catalog images and descriptions may be shared with other partners via the **Aiva Global Catalog**.

#### D. **Technical & Analytics Providers**

* We may share anonymized operational metrics with analytics providers for technical diagnostics and performance tuning.

---

### 8. **Data Retention & Deletion**

We retain your personal and operational data for as long as is necessary to:

* Maintain your active Store Partner account.
* Comply with Indian regulatory requirements for financial and tax records, which typically mandate retention for several years.
* Resolve disputes, enforce the Aiva-Partner Agreement, or detect fraud.

#### Account Deletion & Erasure

If you wish to terminate the Aiva-Partner Agreement and permanently delete your account, you can submit a request via our dedicated web form: **[https://www.thegoaiva.com/delete-account](https://www.thegoaiva.com/delete-account)**.

Upon receiving a valid deletion request, your account will be deactivated.

**Retention Exceptions:** Due to strict statutory obligations related to **TCS (Tax Collected at Source), GST, and financial audits**, Aiva is legally required to retain certain financial and identification data (GSTIN, PAN, Bank records, and transaction logs) for the prescribed legal retention period, even after termination. This retained data will be secured and will not be actively used for operational purposes.

---

### 9. **Your Rights Under Indian Law**

As an Aiva Store Partner, you have the following rights regarding the data we hold under the **Digital Personal Data Protection Act, 2023** and IT Rules:

#### A. **Right to Access**

You can access your order history, earnings reports, and most operational data directly via the Partner Dashboard.

#### B. **Right to Correction**

You may correct or update your store contact details and catalog information directly in the app. Updates to legally sensitive data (Bank A/C, GSTIN, PAN) must be done through a verified support process.

#### C. **Right to Erasure (Right to be Forgotten)**

You can request account deletion, subject to the **statutory retention exceptions** detailed in Section 8.

#### D. **Right to File a Complaint**

You have the right to lodge a complaint with India’s Data Protection Board (once operational) if you believe your data rights have been violated.

---

### 10. **Data Security Measures**

We take the protection of your data seriously and implement commercially reasonable security measures to protect against unauthorized access, disclosure, loss, or misuse. These include:

* **Encryption:** Financial and identification data (Bank A/C, PAN, GSTIN) is transmitted and stored using industry-standard encryption protocols.
* **Access Control:** Access to your Sensitive Personal Data is strictly limited to Aiva personnel who require it for Payout, legal, or tax compliance purposes.
* **Secure Infrastructure:** We use secure cloud infrastructure with appropriate security safeguards and monitoring.

You are responsible for maintaining the confidentiality of your Partner App login credentials and must notify us immediately in case of suspected misuse.

---

### 11. **Partner Liability for Customer Data**

As a Partner, you receive limited Customer PII (name, address, contact) solely for the purpose of fulfilling a specific order. You acknowledge and agree that:

* You are a **recipient of Customer Data** from Aiva.
* You must protect this Customer Data using reasonable security safeguards.
* You shall use Customer Data **only** for the fulfillment of the specific Aiva order and **must not** use it for external marketing or share it with any other third party.
* You are liable for any breach or misuse of Customer Data that occurs under your control.

---

### 12. **Changes to This Privacy Policy**

We may update or amend this Privacy Policy from time to time. When we do:

* We'll post the revised version in the Partner App.
* We'll notify you through in-app alerts, and via email for significant changes.
* The "Last Updated" date at the top of the policy will reflect the latest revision.

We encourage you to review the policy periodically to stay informed about how we handle your data.

---

### 13. **Contact Us (Grievance Redressal)**

If you have any questions, complaints, or requests regarding this Privacy Policy or your personal data, you can contact us at:

**Company Name:** Aiva Private Limited

**Registered Address:** Plot No. 287-A, Goyal Homes, G-2, Sec-B, Shahpura, Bhopal, Madhya Pradesh 462016

**Support Email:** info@thegoaiva.com

**Support Timing:** Monday to Saturday, 10:00 AM – 6:00 PM IST (excluding public holidays)

---

`
// --- END: Partner Specific Markdown Content ---


const headings = [
	{ id: '1-introduction-applicability', label: '1. Introduction & Applicability' },
	{ id: '2-information-we-collect-from-partners', label: '2. Information We Collect from Partners' },
	{ id: '3-how-we-use-partner-information', label: '3. How We Use Partner Information' },
	{ id: '4-ai-smart-features-for-partners', label: '4. AI & Smart Features for Partners' },
	{ id: '5-partner-app-permissions-device-access', label: '5. Partner App Permissions & Device Access' },
	{ id: '6-cookies-analytics-tracking-technologies', label: '6. Cookies, Analytics & Tracking Technologies' },
	{ id: '7-data-sharing-with-third-parties', label: '7. Data Sharing with Third Parties' },
	{ id: '8-data-retention-deletion', label: '8. Data Retention & Deletion' },
	{ id: '9-your-rights-under-indian-law', label: '9. Your Rights Under Indian Law' },
	{ id: '10-data-security-measures', label: '10. Data Security Measures' },
	{ id: '11-partner-liability-for-customer-data', label: '11. Partner Liability for Customer Data' },
	{ id: '12-changes-to-this-privacy-policy', label: '12. Changes to This Privacy Policy' },
	{ id: '13-contact-us-grievance-redressal', label: '13. Contact Us (Grievance Redressal)' },
]

export default function PartnerTermsPage() {
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
						Aiva – Partner Privacy Policy
					</h1>
					<p className="text-center text-sm text-muted-foreground mb-8">
						Last updated: December 2025 ·{' '}
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