//src/components/Footer.tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Store, Users, Handshake, ExternalLink, MonitorDown } from 'lucide-react'

export default function Footer({ onInstall }: { onInstall: (() => void) | null }) {
  return (
    <>
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-[#fff8f2] text-sm text-gray-700 border-t border-gray-200"
      >
        <div className="container mx-auto px-6 py-8"> {/* Reduced padding from py-12 to py-8 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 items-start">
            
            {/* Column 1: Brand */}
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2 group">
                <Image src="/assets/logo.png" alt="Aiva Logo" width={38} height={38} className="rounded-lg shadow-sm" />
                <span className="text-lg font-bold text-gray-900 tracking-tight">Aiva Stores</span>
              </Link>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
                Revolutionizing kirana stores with smart digital tools for faster growth.
              </p>
            </div>

            {/* Column 2: Apps */}
            <div className="space-y-3">
              <h5 className="font-bold text-gray-900 uppercase tracking-widest text-[10px]">Applications</h5>
              <nav className="flex flex-col gap-2">
                <a 
                  href="https://www.thegoaiva.com/customer" 
                  target="_blank" 
                  className="text-gray-600 hover:text-[#FE8000] transition-colors flex items-center gap-2 text-xs"
                >
                  <Users size={14} /> Customer App
                </a>
                <a 
                  href="https://www.thegoaiva.com/partner" 
                  target="_blank" 
                  className="text-gray-600 hover:text-[#FE8000] transition-colors flex items-center gap-2 text-xs"
                >
                  <Handshake size={14} /> Partner App
                </a>

                {/* Aiva Website Link */}
                <div className="pt-2 mt-1 border-t border-gray-200/50">
                  <a 
                    href="https://www.thegoaiva.com/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 group mt-2"
                  >
                    <Image 
                      src="/assets/aiva-logo.png" 
                      alt="Aiva" 
                      width={18} 
                      height={18} 
                      className="rounded shadow-sm group-hover:scale-110 transition-transform"
                    />
                    <span className="bg-white border border-[#FE8000]/20 text-[#FE8000] px-2 py-1 rounded-md text-[11px] tracking-normal font-bold group-hover:bg-[#FE8000] group-hover:text-white transition-all flex items-center gap-1">
                      Visit Website <ExternalLink size={10} />
                    </span>
                  </a>
                </div>
              </nav>
            </div>

            {/* Column 3: Store Link & Google Play */}
            <div className="space-y-3">
              <h5 className="font-bold text-gray-900 uppercase tracking-widest text-[10px]">Get Started</h5>
              <a 
                href="https://play.google.com/store/apps/dev?id=4747904999777723975"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-transform duration-300 hover:scale-110 active:scale-95"
              >
                <Image 
                  src="/assets/googleplay.png" 
                  alt="Get it on Google Play" 
                  width={140} 
                  height={42}
                  className="rounded shadow-sm border border-gray-200" 
                />
              </a>
              {onInstall && (
                <button 
                  onClick={onInstall}
                  className="mt-4 flex items-center gap-3 bg-white border border-gray-200 p-2 rounded-md hover:border-[#FE8000]/40 transition-all group w-full max-w-[140px]"
                >
                  <div className="bg-gray-900 text-white p-1.5 rounded-md group-hover:bg-[#FE8000] transition-colors">
                    <MonitorDown size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] uppercase font-bold text-gray-400 leading-none">Download</p>
                    <p className="text-[11px] font-bold text-gray-900 pt-0.5 leading-none mt-0.5">Desktop App</p>
                  </div>
                </button>
              )}
            </div>

            {/* Column 4: Login & Contact */}
            <div className="space-y-3">
              <h5 className="font-bold text-gray-900 uppercase tracking-widest text-[10px]">Partner Access</h5>
              <Link 
                href="/partners/auth" 
                className="bg-white border border-[#FE8000]/20 text-[#FE8000] px-3 py-1.5 rounded-md font-bold hover:bg-[#FE8000] hover:text-white transition-all inline-flex items-center gap-2 text-xs"
              >
                <Store size={14} /> Store Owner Login
              </Link>
              <div className="flex items-start gap-2 pt-2">
                <MapPin size={16} className="text-[#FE8000] shrink-0 mt-1" />
                <p className="text-xs text-gray-500 leading-snug">
                  Plot No. 287-A, Goyal Homes, G-2, Sec- B, <br />
                  Shahpura, Bhopal, MP 462016
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="text-center text-gray-400 text-xs py-6 px-4 sm:px-6 bg-[#fff8f2] border-t border-gray-200">
          By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies.
          All trademarks are properties of their respective owners &copy; {new Date().getFullYear()} Goaiva. All rights reserved.
        </div>
      </motion.footer>
    </>
  )
}