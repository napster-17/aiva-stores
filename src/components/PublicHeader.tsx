//src/components/PublicHeader.tsx
'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Mail, Phone, HeartHandshake, ChevronDown, Smartphone, LayoutDashboard } from 'lucide-react'

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Customer', href: '/customer' },
  { 
    name: 'Partner', 
    dropdown: [
      { name: 'Partner App', href: '/partner', icon: <Smartphone size={16} /> },
      { name: 'Partner Dashboard', href: '/partner-dashboard', icon: <LayoutDashboard size={16} /> },
    ]
  },
  { name: 'About Us', href: '/about-us' },
]

export default function PublicHeader() {
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
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md py-3' 
          : 'bg-black/80 backdrop-blur-sm py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/assets/logo.png" 
              alt="GoAiva Logo" 
              width={40} 
              height={40} 
              className="rounded-lg" 
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                {link.dropdown ? (
                  <div className={`flex items-center gap-1 text-sm font-semibold cursor-default transition-colors group-hover:text-[#FE8000] ${
                    scrolled ? 'text-gray-700' : 'text-white'
                  }`}>
                    {link.name} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px] overflow-hidden">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FE8000] transition-colors"
                          >
                            <span className="text-[#FE8000]">{item.icon}</span>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link 
                    href={link.href!}
                    className={`text-sm font-semibold transition-colors hover:text-[#FE8000] ${
                      pathname === link.href ? 'text-[#FE8000]' : scrolled ? 'text-gray-700' : 'text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FE8000] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#e67300] transition shadow-lg hover:shadow-[#FE8000]/20"
            >
              Join as Partner
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className={`${scrolled ? 'text-[#FE8000]' : 'text-white'} md:hidden`} onClick={() => setIsOpen(!isOpen)}>
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
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.dropdown ? (
                      <div className="flex flex-col gap-3">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{link.name}</span>
                        {link.dropdown.map((item) => (
                          <Link 
                            key={item.href} 
                            href={item.href} 
                            onClick={() => setIsOpen(false)}
                            className="text-gray-700 font-medium hover:text-[#FE8000] flex items-center gap-3 pl-2"
                          >
                            <span className="text-[#FE8000]">{item.icon}</span>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link 
                        href={link.href!} 
                        onClick={() => setIsOpen(false)}
                        className={`font-medium transition-colors ${
                          pathname === link.href ? 'text-[#FE8000]' : 'text-gray-700'
                        }`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
                <button 
                  onClick={() => { setIsOpen(false); setIsModalOpen(true); }}
                  className="bg-[#FE8000] text-white p-3 rounded-xl font-bold text-center"
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
                <p className="text-white/80 mt-2">Grow your Kirana business with GoAiva</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-[#FE8000]/10 rounded-full flex items-center justify-center text-[#FE8000]">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email Us</p>
                    <a href="mailto:info@thegoaiva.com" className="text-gray-800 font-semibold hover:text-[#FE8000]">info@thegoaiva.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-[#FE8000]/10 rounded-full flex items-center justify-center text-[#FE8000]">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Call Us</p>
                    <a href="tel:+918879316037" className="text-gray-800 font-semibold hover:text-[#FE8000]">+91 8879316037</a>
                  </div>
                </div>

                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-4 text-gray-500 font-medium hover:text-gray-800 transition"
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