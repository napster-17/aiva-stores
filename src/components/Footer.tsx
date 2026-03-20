//src/components/Footer.tsx
'use client'
import Image from 'next/image'
import Link from 'next/link' // Import Link for internal routing
import { motion } from 'framer-motion'
import { FileText, MapPin, Store, Users, Handshake, Linkedin, Youtube, ArrowRight } from 'lucide-react'

export default function Footer() {
  const customerPolicies = [
    { title: "Terms & Conditions", href: "/policies/01customer-terms" },
    { title: "Privacy Policy", href: "/policies/02customer-privacy" },
    { title: "Refund & Cancellation", href: "/policies/03refunds-cancellations" },
    { title: "Content & Reviews", href: "/policies/04content-reviews" },
  ];

  const partnerPolicies = [
    { title: "Partner Agreement", href: "/policies/06partner-agreement" },
    { title: "Platform Terms", href: "/policies/07partner-terms" },
    { title: "Payout & Ledger", href: "/policies/08payout-ledger" },
    { title: "Catalog & IP", href: "/policies/09catalog-ip" },
    { title: "Partner Privacy Policy", href: "/policies/13partner-privacy" },
    { title: "Delivery Agents Privacy Policy", href: "/policies/14agents-privacy" },
  ];

  const generalPolicies = [
    { title: "GST & Tax Compliance", href: "/policies/10gst-compliance" },
    { title: "Cookie & Tracking", href: "/policies/11cookie-tracking" },
    { title: "Admin Rights & Liability", href: "/policies/12admin-disclaimer" },
  ];

  return (
    <>
      <motion.footer
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="bg-[#fff8f2] text-sm text-gray-700 mt-0 border-t border-gray-300"
      >
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-6 py-16">
          {/* Column 1: Company Info & Social Links */}
          <div className="max-w-xs md:col-span-1">
            {/* Added Link to homepage on Logo and Title */}
            <Link href="/" className="flex items-center gap-3 mb-4 group transition-opacity hover:opacity-80">
              <Image src="/assets/logo.png" alt="Logo" width={50} height={50} />
              <span className="text-xl font-bold text-gray-900">Aiva Stores</span>
            </Link>
            
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Revolutionizing local grocery shopping by making kirana stores smarter, faster, and more profitable.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-[#FE8000] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">
                  Plot No. 287-A, Goyal Homes, G-2, Sec- B, Shahpura, Bhopal, Madhya Pradesh 462016
                </p>
              </div>
            </div>
            
            <div className="mb-8">
                <a 
                    href="https://www.thegoaiva.com/about-us" 
                    className="inline-flex items-center text-sm font-semibold text-[#FE8000] hover:text-[#ff901a] transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    More Details &rarr;
                </a>
            </div>

            <div className="space-y-3">
                <h6 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Social Links</h6>
                <div className="flex gap-4">
                    <a 
                        href="https://www.linkedin.com/company/aiva-stores-private-limited/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-full border border-gray-200 text-[#FE8000] hover:bg-[#FE8000] hover:text-white transition-all shadow-sm"
                    >
                        <Linkedin size={18} />
                    </a>
                    <a 
                        href="https://www.youtube.com/@AIVAStoresPrivateLimited" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-full border border-gray-200 text-[#FE8000] hover:bg-[#FE8000] hover:text-white transition-all shadow-sm"
                    >
                        <Youtube size={18} />
                    </a>
                </div>
            </div>
          </div>

          {/* Column 2: Customer Links */}
          <div className="md:col-span-1">
            <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} className="text-[#FE8000]" /> For Customers
            </h5>
            <ul className="space-y-3 text-gray-600">
              <li className="mb-4">
                <Link 
                  href="/customer" 
                  className="text-base font-bold text-[#FE8000] hover:text-[#ff901a] transition-colors flex items-center group"
                >
                  <ArrowRight size={14} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Customer App
                </Link>
              </li>
              {customerPolicies.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="hover:text-[#FE8000] transition-colors flex items-center group">
                    <ArrowRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 3 & 4: Partners & General */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12 sm:gap-y-0">
            <div>
              <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Handshake size={20} className="text-[#FE8000]" /> For Partners
              </h5>
              <ul className="space-y-3 text-gray-600">
                <li className="mb-4">
                  <Link 
                    href="/partner" 
                    className="text-base font-bold text-[#FE8000] hover:text-[#ff901a] transition-colors flex items-center group"
                  >
                    <ArrowRight size={14} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    Partner App
                  </Link>
                </li>
                <li className="mb-4">
                  <Link 
                    href="/partner-dashboard" 
                    className="text-base font-bold text-[#FE8000] hover:text-[#ff901a] transition-colors flex items-center group"
                  >
                    <ArrowRight size={14} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    Partner Dashboard
                  </Link>
                </li>
                {partnerPolicies.map((link) => (
                  <li key={link.title}>
                    <Link href={link.href} className="hover:text-[#FE8000] transition-colors flex items-center group">
                      <ArrowRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[#FE8000]" /> General
              </h5>
              <ul className="space-y-3 text-gray-600">
                {generalPolicies.map((link) => (
                  <li key={link.title}>
                    <Link href={link.href} className="hover:text-[#FE8000] transition-colors flex items-center group">
                      <ArrowRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.title}
                    </Link>
                  </li>
                ))}
                <li>
                    <a href="https://www.thegoaiva.com/partners/auth" className="hover:text-[#FE8000] text-gray-800 font-semibold mt-2 flex items-center group">
                        <ArrowRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        <Store size={16} className="mr-1" /> Store Owner Login
                    </a>
                </li>
                <li className="pt-4">
                  <a 
                    href="https://play.google.com/store/apps/dev?id=4747904999777723975"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block transition-transform hover:scale-105"
                  >
                    <Image 
                      src="/assets/googleplay.png" 
                      alt="Get it on Google Play" 
                      width={180} 
                      height={52}
                      className="rounded-lg shadow-sm border border-gray-300" 
                    />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.footer>
      
      <div className="text-center text-gray-400 text-xs py-6 px-4 sm:px-6 bg-[#fff8f2] border-t border-gray-200">
        By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies.
        All trademarks are properties of their respective owners &copy; {new Date().getFullYear()} Goaiva. All rights reserved.
      </div>
    </>
  )
}