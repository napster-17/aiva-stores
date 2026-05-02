//src/components/PublicHeader.tsx
'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Mail, Phone, HeartHandshake, LogIn, MonitorDown } from 'lucide-react'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: 'https://www.thegoaiva.com/about-us' },
]

export default function PublicHeader({ onInstall }: { onInstall: (() => void) | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const [isModalOpen, setIsModalOpen] = useState(false) 

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3' 
          : 'bg-black/80 backdrop-blur-sm py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image 
              src="/assets/logo.png" 
              alt="GoAiva Logo" 
              width={40} 
              height={40} 
              className="rounded-lg shadow-sm" 
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href}
                target={link.name === 'About Us' ? '_blank' : '_self'}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-[#FE8000] ${
                  pathname === link.href 
                    ? 'text-[#FE8000]' 
                    : scrolled ? 'text-gray-700' : 'text-gray-200'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Login Link */}
            <Link 
              href="/partners/auth"
              className={`text-sm font-semibold flex items-center gap-2 transition-colors hover:text-[#FE8000] ${
                scrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              <LogIn size={16} className="text-[#FE8000]" />
              Login
            </Link>

            {onInstall && (
              <button 
                onClick={onInstall}
                className={`text-sm font-semibold flex items-center gap-2 transition-all px-3 py-1.5 rounded-lg border ${
                  scrolled 
                    ? 'text-[#FE8000] border-[#FE8000]/20 bg-orange-50/50' 
                    : 'text-white border-white/20 bg-white/10 hover:bg-white/20'
                }`}
              >
                <MonitorDown size={16} />
                Desktop App
              </button>
            )}
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FE8000] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#e67300] transition-all transform hover:scale-105 active:scale-95 shadow-md hover:shadow-[#FE8000]/30"
            >
              Join as Partner
            </button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className={`${scrolled ? 'text-[#FE8000]' : 'text-white'} md:hidden p-2`} 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden shadow-xl"
            >
              <div className="flex flex-col p-6 gap-5">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    target={link.name === 'About Us' ? '_blank' : '_self'}
                    onClick={() => setIsOpen(false)}
                    className={`font-semibold text-lg ${
                      pathname === link.href ? 'text-[#FE8000]' : 'text-gray-800'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                
                {/* Mobile Login */}
                <Link 
                  href="/partners/auth"
                  onClick={() => setIsOpen(false)}
                  className="font-semibold text-lg text-gray-800 flex items-center gap-2 border-t border-gray-50 pt-4"
                >
                  <LogIn size={20} className="text-[#FE8000]" />
                  Partner Login
                </Link>

                <button 
                  onClick={() => { setIsOpen(false); setIsModalOpen(true); }}
                  className="bg-[#FE8000] text-white p-4 rounded-2xl font-bold text-center shadow-lg active:scale-95 transition-transform"
                >
                  Join as Partner
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Partner Contact Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-[#FE8000] p-8 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HeartHandshake size={32} />
                </div>
                <h3 className="text-2xl font-bold">Become a Partner</h3>
                <p className="text-white/80 mt-2">Grow your Kirana business with Aiva Stores</p>
              </div>
              
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-[#FE8000]/10 rounded-full flex items-center justify-center text-[#FE8000]">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Email Us</p>
                    <a href="mailto:info@thegoaiva.com" className="text-gray-800 font-semibold hover:text-[#FE8000]">info@thegoaiva.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-[#FE8000]/10 rounded-full flex items-center justify-center text-[#FE8000]">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Call Us</p>
                    <a href="tel:+918879316037" className="text-gray-800 font-semibold hover:text-[#FE8000]">+91 8879316037</a>
                  </div>
                </div>

                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-4 text-gray-400 font-medium hover:text-gray-600 transition text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}