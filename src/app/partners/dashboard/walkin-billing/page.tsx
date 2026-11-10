//src/app/partners/dashboard/walkin-billing/page.tsx: Updated with fixed sidebar, only 3 cards when the right side tray opens, and safety check for the images from unknown sources.
//Updated with Virualization using react-virtuoso and dynamic column count based on screen size and cart state.
'use client'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { Search, ShoppingCart, Trash2, ChevronLeft, History, Loader2, Package, Banknote, CreditCard, Minus, Plus } from 'lucide-react'
import { Virtuoso } from 'react-virtuoso'
import { createClient } from '@/lib/supabase/client'
import { CartProduct, createWalkinOrder, getRecentCustomerPhones } from '@/lib/partners/walkin-billing/utils'
import { getWhatsAppUrl } from '@/lib/partners/walkin-billing/whatsapp'
import { generateAndUploadInvoice } from '@/lib/partners/walkin-billing/pdf-service'
import { buildBillingRows } from '@/utils/buildBillingRows'
import { usePartnerProfile } from '@/components/partners/PartnerProfileProvider'
import ProductCard from '@/components/partners/walkin-billing/ProductCard'
import InvoiceDialog from '@/components/partners/walkin-billing/InvoiceDialog'
import BillingRow from '@/components/partners/walkin-billing/BillingRow'
import WalkinPhoneScannerPairing, { type WalkinPhoneScannerHandle, type WalkinWebScanResult, } from '@/components/partners/walkin-billing/WalkinPhoneScannerPairing'

interface Product {
  id: string; name: string; price: number; stock_quantity: number; frozen_quantity: number; image_url?: string | null; 
  category_name?: string; unit_value: number; unit_metric: string; brand?: string | null; barcode?: string | null; 
  discounts?: { discount_type: 'flat' | 'percent'; discount_value: number; };
}

interface CategoryInfo { name: string; image_url: string | null; }

export default function WalkinBillingPage() {
  const { profile } = usePartnerProfile()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [cart, setCart] = useState<Record<string, CartProduct>>({})
  const [customerPhone, setCustomerPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [lastOrderId, setLastOrderId] = useState('')
  const [checkoutCart, setCheckoutCart] = useState<CartProduct[]>([])
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Cards' | 'Credit'>('Cash')
  const [columns, setColumns] = useState(6)
  const scannerRef = useRef<WalkinPhoneScannerHandle>(null)
  const billingLayoutRef = useRef<HTMLDivElement>(null)
  const cartRef = useRef<Record<string, CartProduct>>({})
  const billingLockedRef = useRef(false)
  const checkoutRunningRef = useRef(false)
  const [scannerResumeFailed, setScannerResumeFailed] = useState(false)

  const commitCart = (next: Record<string, CartProduct>) => {
    cartRef.current = next
    setCart(next)
 }

  // Fetch Products
  useEffect(() => {
    async function loadData() {
      if (!profile?.id) return
      
      // Fetch Products and Categories in parallel
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select(`
            id, name, barcode, price, stock_quantity, frozen_quantity, brand, image_url, unit_value, unit_metric,
            global_categories(name),
            discounts (discount_type, discount_value)
          `)
          .eq('store_id', profile.id)
          .order('name', { ascending: true }),
        supabase
          .from('global_categories')
          .select('name, image_url')
          .order('name', { ascending: true })
      ])

      if (prodRes.data) {
        const processedProducts = prodRes.data.map((p: any) => {
          // Safety check: If image is from a known problematic source, use fallback until fixed
          const isExternal = p.image_url?.includes('gstatic.com') || p.image_url?.includes('google');
          
          return {
            ...p,
            image_url: isExternal ? '/assets/product_fallback.jpg' : p.image_url,
            category_name: p.global_categories?.name || 'Others'
          };
        });
        setProducts(processedProducts);
      }

      if (catRes.data) {
        setCategories([{ name: 'All', image_url: null }, ...catRes.data])
      }
      setLoading(false)
    }
    loadData()
  }, [profile])

  // Fetch Phone Suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (customerPhone.length >= 3 && profile?.id) {
        const results = await getRecentCustomerPhones(profile.id, customerPhone);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [customerPhone, profile?.id]);

  // Derive active categories (only those that have products)
  const activeCategories = useMemo(() => {
    if (products.length === 0) return [{ name: 'All', image_url: null }];
    
    // Get unique category names present in the current products list
    const productCategoryNames = new Set(products.map(p => p.category_name));
    
    // Filter the global categories list
    return categories.filter(cat => 
      cat.name === 'All' || productCategoryNames.has(cat.name)
    );
  }, [products, categories]);

  const filteredProducts = useMemo(() => {
    // 1. First, filter by category if one is selected (unless 'All')
    let baseProducts = products;
    if (selectedCategory !== 'All') {
      baseProducts = products.filter(p => p.category_name === selectedCategory);
    }

    // 2. If no search term, return the category-filtered list
    if (searchTerm.trim() === '') {
      return baseProducts;
    }

    // 3. Configure Fuse with weights and advanced matching
    const fuse = new Fuse(baseProducts, {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'brand', weight: 0.2 },
        { name: 'category_name', weight: 0.1 }
      ],
      threshold: 0.3,
      distance: 100,
      ignoreLocation: true, // Matches anywhere in the string
      useExtendedSearch: true, // Allows for better multi-token matching
      findAllMatches: true,
      minMatchCharLength: 2,
    });

    // Clean search term: remove extra spaces and ignore accidental numbers for the search query
    const cleanedTerm = searchTerm.replace(/\d/g, '').trim();
    
    // If after cleaning it's too short, use the raw term, else use cleaned
    const finalSearchQuery = cleanedTerm.length > 1 ? cleanedTerm : searchTerm;

    return fuse.search(finalSearchQuery).map(result => result.item);
  }, [searchTerm, products, selectedCategory]);

  const rows = useMemo(() => { return buildBillingRows(filteredProducts, columns) }, [filteredProducts, columns])

  const productsById = useMemo( () => new Map(products.map(product => [product.id, product])), [products] )
  const cartItems = Object.values(cart)
  const cartUnits = cartItems.reduce( (sum, item) => sum + item.quantity, 0 )
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleAddToCart = (product: Product, quantity: number) => {
    if (billingLockedRef.current) return

    const availableStock = Math.max(
      0,
      Number(product.stock_quantity || 0) -
      Number(product.frozen_quantity || 0)
    )

    if (!Number.isFinite(quantity) || quantity > availableStock) return

    const next = { ...cartRef.current }

    if (quantity <= 0) {
      delete next[product.id]
    } else {
      const sellingPrice = product.discounts
        ? product.discounts.discount_type === 'percent'
          ? product.price * (1 - product.discounts.discount_value / 100)
          : product.price - product.discounts.discount_value
        : product.price

      next[product.id] = {
        id: product.id,
        name: product.name,
        price: sellingPrice,
        quantity,
        unit_metric: product.unit_metric,
        unit_value: product.unit_value,
        originalPrice: product.price,
        image_url: product.image_url,
        brand: product.brand,
      }
    }

    commitCart(next)
  }

  const handleBillQuantityChange = (productId: string, change: -1 | 1) => {
    if (
      billingLockedRef.current || checkoutRunningRef.current || isSubmitting || showInvoice
    ) return

    // Read the latest cart so phone scans and clicks stay in sync.
    const currentItem = cartRef.current[productId]
    if (!currentItem) return

    const nextQuantity = currentItem.quantity + change

    if (nextQuantity <= 0) {
      const next = { ...cartRef.current }
      delete next[productId]
      commitCart(next)
      return
    }

    // Always allow a reduction, including when loaded stock has decreased.
    if (change === 1) {
      const product = productsById.get(productId)
      if (!product) return

      const availableStock = Math.max(
        0,
        Number(product.stock_quantity || 0) - Number(product.frozen_quantity || 0)
      )

      if (
        !Number.isFinite(availableStock) || nextQuantity > availableStock
      ) return
    }

    // Preserve the price and other details already held in the cart.
    commitCart({
      ...cartRef.current,
      [productId]: { ...currentItem, quantity: nextQuantity, },
    })
  }

  const handlePhoneBarcode = (barcode: string): WalkinWebScanResult => {
    if (billingLockedRef.current) {
      return {
        status: 'discarded',
        message: 'Billing is paused. Scan this item again after checkout.',
      }
    }

    const matches = products.filter(
      product => product.barcode?.trim() === barcode.trim()
    )

    if (matches.length > 1) {
      return {
        status: 'duplicate',
        message: 'Multiple store products use this barcode. Search manually.',
      }
    }

    const product = matches[0]

    if (!product) {
      return {
        status: 'not_found',
        message: 'Barcode not found in your store. Search manually.',
      }
    }

    const currentQuantity = cartRef.current[product.id]?.quantity || 0
    const nextQuantity = currentQuantity + 1

    const availableStock = Math.max(
      0,
      Number(product.stock_quantity || 0) -
      Number(product.frozen_quantity || 0)
    )

    if (nextQuantity > availableStock) {
      return {
        status: 'stock_limit',
        message: `Only ${availableStock} units available for ${product.name}.`,
      }
    }

    handleAddToCart(product, nextQuantity)

    return {
      status: 'added',
      message: `${product.name} · Qty ${nextQuantity}`,
    }
  }

  const resumePhoneScanner = async () => {
    try {
      await scannerRef.current?.resume()
      setScannerResumeFailed(false)
    } catch (error) {
      console.error('[Walkin Scanner] Resume failed:', error)
      setScannerResumeFailed(true)
    }
  }

  const clearCurrentCart = async () => {
    if (checkoutRunningRef.current || billingLockedRef.current) return

    try {
      await scannerRef.current?.pause()
      commitCart({})
      await resumePhoneScanner()
    } catch (error) {
      console.error('[Walkin Scanner] Clear cart failed:', error)
      alert('Could not pause the scanner. Cart was not cleared. Please retry.')
    }
  }

  const handleCheckout = async () => {
    if (
      !profile?.id ||
      checkoutRunningRef.current ||
      billingLockedRef.current
    ) return

    if (
      paymentMethod === 'Credit' &&
      !/^\d{10}$/.test(customerPhone)
    ) {
      alert('Customer Phone Number is mandatory for Credit transactions.')
      return
    }

    checkoutRunningRef.current = true
    setIsSubmitting(true)

    let orderCompleted = false

    try {
      // Pause server acceptance and finish all previously accepted scans.
      await scannerRef.current?.pause()

      billingLockedRef.current = true

      const finalCart = Object.values(cartRef.current)

      if (finalCart.length === 0) {
        alert('Add at least one item before generating a bill.')
        return
      }

      const finalTotal = finalCart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )

      const result = await createWalkinOrder(
        profile.id,
        finalCart,
        null,
        customerPhone,
        paymentMethod
      )

      if (!result.orderId) {
        throw new Error(result.error || 'Could not create bill.')
      }

      orderCompleted = true

      setLastOrderId(result.orderId)
      setCheckoutCart([...finalCart])
      setInvoiceUrl(null)
      commitCart({})
      setShowInvoice(true)

      // Keep the loaded stock consistent with this completed sale.
      setProducts(previous => previous.map(product => {
        const sold = finalCart.find(item => item.id === product.id)

        return sold
          ? {
              ...product,
              stock_quantity: Math.max(
                0,
                Number(product.stock_quantity || 0) - sold.quantity
              ),
            }
          : product
      }))

      generateAndUploadInvoice(
        profile.id,
        result.orderId,
        profile.store_name || 'Our Store',
        finalCart,
        finalTotal,
        profile.gstin
      ).then(url => {
        if (url) setInvoiceUrl(url)
      }).catch(error => {
        console.error('Background PDF generation failed', error)
      })
    } catch (error: any) {
      console.error('Checkout failed:', error)
      alert(error.message || 'Something went wrong during checkout.')
    } finally {
      checkoutRunningRef.current = false
      setIsSubmitting(false)

      // Successful checkout remains paused until the invoice is closed.
      if (!orderCompleted) {
        billingLockedRef.current = false
        await resumePhoneScanner()
      }
    }
  }

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth

      if (cartItems.length > 0) {
        if (width < 640) setColumns(1)
        else if (width < 1024) setColumns(2)
        else setColumns(3)
      } else {
        if (width < 640) setColumns(2)
        else if (width < 768) setColumns(3)
        else if (width < 1024) setColumns(4)
        else if (width < 1280) setColumns(5)
        else setColumns(6)
      }
    }
    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [cartItems.length])

  useEffect(() => {
    if (loading) return

    const element = billingLayoutRef.current
    if (!element) return

    let frame = 0

    const updateHeight = () => { cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const top = Math.max(0, element.getBoundingClientRect().top)
        const height = Math.max(0, window.innerHeight - top)
        const nextHeight = `${height}px`
        if (element.style.height !== nextHeight) { element.style.height = nextHeight }
      })
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    const observer = new ResizeObserver(updateHeight)
    if (element.parentElement) { observer.observe(element.parentElement) }

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateHeight)
      observer.disconnect()
    }
  }, [loading])

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>

  return (
    <div ref={billingLayoutRef} className="flex h-dvh min-h-0 w-full gap-1 overflow-hidden bg-[#F8F9FB] text-gray-900" >
      {/* 1. Fixed Category Sidebar (Unified Design) */}
      <aside className="w-52 flex-shrink-0 flex flex-col sticky top-0 h-screen pt-24 pb-8 z-30 ml-4">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl py-4 flex flex-col gap-1 border border-gray-100 shadow-xl max-h-full overflow-y-auto custom-scrollbar">
          {activeCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center py-3 px-3 mx-2 rounded-2xl transition-all duration-200 gap-3 ${
                selectedCategory === cat.name 
                  ? 'bg-white shadow-md ring-1 ring-black/[0.03]' 
                  : 'hover:bg-white/80'
              }`}
            >
              <div className="relative w-12 h-12 flex-shrink-0">
                {cat.name === 'All' ? (
                  <div className={`w-full h-full rounded-lg flex items-center justify-center transition-all ${
                    selectedCategory === 'All' 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Package size={24} />
                  </div>
                ) : (
                  <div className={`w-full h-full rounded-lg p-1 transition-all ${
                    selectedCategory === cat.name ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    <img
                      src={cat.image_url || '/assets/product_fallback.jpg'}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              <span className={`
                text-[14px] text-left font-semibold leading-tight transition-all duration-200
                ${selectedCategory === cat.name ? 'text-orange-600' : 'text-gray-500'}
              `}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Transparent Header */}
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-4 xl:px-6">
          <div className="flex items-center gap-4">
            <Link href="/partners/dashboard" className="p-2.5 bg-white shadow-sm rounded-xl flex items-center justify-center hover:bg-orange-50 transition-colors group border border-gray-100">
              <ChevronLeft size={20} className="text-gray-400 group-hover:text-orange-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">Walk-in Billing</h1>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                {searchTerm ? `Search Results for "${searchTerm}"` : `${selectedCategory} Collection`}
              </p>
            </div>
          </div>

          <div className="group relative min-w-[220px] flex-1 xl:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by product name or brand..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-300 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <WalkinPhoneScannerPairing
            ref={scannerRef}
            disabled={isSubmitting || showInvoice}
            onBarcode={handlePhoneBarcode}
            hasCart={cartItems.length > 0}
          />

          {scannerResumeFailed && (
            <button
              type="button"
              disabled={isSubmitting || showInvoice}
              onClick={() => void resumePhoneScanner()}
              className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800"
            >
              Scanner paused · Retry resume
            </button>
          )}

          <Link href="/partners/dashboard/walkin-billing/history" className="flex items-center gap-2 text-gray-400 hover:text-orange-600 font-bold transition-colors bg-white px-4 py-3 rounded-2xl shadow-sm">
            <History size={18} />
            <span className="text-sm">History</span>
          </Link>
        </header>

        {/* Seamless Grid Container */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {filteredProducts.length > 0 ? (
            <div style={{ height: '100%' }}>
              <Virtuoso
                data={rows}
                overscan={200}
                itemContent={(index, row) => (
                  <BillingRow
                    row={row}
                    onAddToCart={handleAddToCart}
                    cart={cart}
                    columns={columns}
                  />
                )}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 bg-white/50 rounded-[32px] border-2 border-dashed border-gray-100">
              <Package size={80} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-medium">No items found in this section</p>
            </div>
          )}
        </div>
      </main>

      {/* Current bill: fixed header/footer, independently scrolling items */}
      {cartItems.length > 0 && (
        <aside
          aria-label="Current bill"
          className="relative z-40 flex h-full min-h-0 w-80 flex-shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white lg:w-[360px]"
        >
          {/* Compact bill heading */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-3 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <ShoppingCart size={18} />
              </span>

              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900">
                  Current Bill
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {cartItems.length} products · {cartUnits} units
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting || showInvoice}
              onClick={() => void clearCurrentCart()}
              className="min-h-8 rounded-lg px-2 text-xs font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 disabled:opacity-40"
            >
              Clear bill
            </button>
          </div>

          {/* Compact customer field */}
          <div className="relative z-20 shrink-0 border-b border-slate-100 px-3 py-2.5">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label
                htmlFor="walkin-customer-phone"
                className="text-[11px] font-semibold text-slate-600"
              >
                Customer phone
              </label>

              <span
                className={`text-[10px] ${
                  paymentMethod === 'Credit'
                    ? 'font-semibold text-orange-600'
                    : 'text-slate-400'
                }`}
              >
                {paymentMethod === 'Credit' ? 'Required for credit' : 'Optional'}
              </span>
            </div>

            <div className="relative z-20">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-slate-400">
                +91
              </span>

              <input
                id="walkin-customer-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                maxLength={10}
                placeholder="10-digit mobile number"
                disabled={isSubmitting || showInvoice}
                value={customerPhone}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                onChange={event => {
                  const value = event.target.value.replace(/\D/g, '')

                  if (value.length <= 10) {
                    setCustomerPhone(value)
                    if (value.length < 3) setShowSuggestions(false)
                  }
                }}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-3 text-sm font-medium tracking-wide text-slate-900 outline-none transition placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:opacity-50"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  {suggestions.map(phone => (
                    <button
                      key={phone}
                      type="button"
                      onClick={() => {
                        setCustomerPhone(phone)
                        setShowSuggestions(false)
                      }}
                      className="flex min-h-10 w-full items-center justify-between gap-2 border-b border-slate-50 px-3 py-2 text-left last:border-0 hover:bg-orange-50"
                    >
                      <span className="text-sm font-medium text-slate-800">
                        {phone}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Recent customer
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {showSuggestions && (
              <div
                aria-hidden="true"
                className="fixed inset-0 z-10"
                onClick={() => setShowSuggestions(false)}
              />
            )}
          </div>

          {/* Only this area scrolls */}
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3">
            <div className="divide-y divide-slate-100">
              {cartItems.map(item => {
                const product = productsById.get(item.id)

                const stockValue = product
                  ? Math.max(
                      0,
                      Number(product.stock_quantity || 0) -
                      Number(product.frozen_quantity || 0)
                    )
                  : null

                const availableStock =
                  stockValue !== null && Number.isFinite(stockValue)
                    ? stockValue
                    : null

                const remainingStock =
                  availableStock === null
                    ? null
                    : Math.max(0, availableStock - item.quantity)

                const controlsDisabled = isSubmitting || showInvoice

                const canIncrease =
                  availableStock !== null &&
                  item.quantity + 1 <= availableStock

                const exceedsStock =
                  availableStock !== null &&
                  item.quantity > availableStock

                return (
                  <div key={item.id} className="py-3">
                    <div className="flex items-start gap-2.5">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                        <Image
                          src={item.image_url || '/assets/product_fallback.jpg'}
                          alt={item.name}
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-[13px] font-semibold leading-[18px] text-slate-800">
                          {item.name}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-slate-500">
                          {item.brand && (
                            <span className="max-w-full truncate">
                              {item.brand}
                            </span>
                          )}

                          {item.unit_value != null && item.unit_metric && (
                            <span className="rounded bg-slate-100 px-1 py-0.5">
                              {item.unit_value} {item.unit_metric}
                            </span>
                          )}

                          <span>₹{item.price.toFixed(2)} each</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={controlsDisabled}
                        onClick={() => {
                          if (
                            billingLockedRef.current ||
                            checkoutRunningRef.current
                          ) return

                          const next = { ...cartRef.current }
                          delete next[item.id]
                          commitCart(next)
                        }}
                        aria-label={`Remove ${item.name} from bill`}
                        title="Remove item"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div
                        role="group"
                        aria-label={`Quantity for ${item.name}`}
                        className="inline-flex shrink-0 items-center overflow-hidden rounded-lg border border-orange-200 bg-orange-50"
                      >
                        <button
                          type="button"
                          disabled={controlsDisabled}
                          onClick={() => handleBillQuantityChange(item.id, -1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="flex h-9 w-9 items-center justify-center text-orange-700 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 disabled:opacity-40"
                        >
                          <Minus size={15} strokeWidth={2.5} />
                        </button>

                        <span className="min-w-8 px-1 text-center text-sm font-bold tabular-nums text-slate-900">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          disabled={controlsDisabled || !canIncrease}
                          onClick={() => handleBillQuantityChange(item.id, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          title={
                            availableStock === null
                              ? 'Stock information unavailable'
                              : !canIncrease
                                ? 'Not enough stock to add another unit'
                                : 'Add one more'
                          }
                          className="flex h-9 w-9 items-center justify-center text-orange-700 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 disabled:opacity-30"
                        >
                          <Plus size={15} strokeWidth={2.5} />
                        </button>
                      </div>

                      <div className="min-w-0 text-right">
                        <p className="break-words text-sm font-bold tabular-nums text-slate-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>

                        {item.originalPrice != null &&
                          item.originalPrice > item.price && (
                            <p className="text-[10px] tabular-nums text-slate-400 line-through">
                              ₹{(item.originalPrice * item.quantity).toFixed(2)}
                            </p>
                          )}
                      </div>
                    </div>

                    <p
                      className={`mt-1.5 text-[10px] leading-4 ${
                        remainingStock === null
                          ? 'text-slate-400'
                          : exceedsStock || remainingStock === 0
                            ? 'font-medium text-red-600'
                            : remainingStock < 5
                              ? 'font-medium text-amber-600'
                              : 'text-slate-500'
                      }`}
                    >
                      {remainingStock === null
                        ? 'Stock unavailable'
                        : exceedsStock
                          ? 'Quantity exceeds available stock'
                          : `${remainingStock} left after this bill`}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Checkout stays visible below the scrolling item list */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-3 pb-3 pt-2.5">
            <div
              role="group"
              aria-label="Payment mode"
              className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1"
            >
              {(['Cash', 'UPI', 'Cards', 'Credit'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  disabled={isSubmitting || showInvoice}
                  aria-pressed={paymentMethod === method}
                  onClick={() => setPaymentMethod(method)}
                  className={`flex h-9 items-center justify-center gap-1 rounded-lg text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 disabled:opacity-40 ${
                    paymentMethod === method
                      ? 'bg-white text-orange-700 shadow-sm ring-1 ring-orange-200'
                      : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
                  }`}
                >
                  {method === 'Cash' && <Banknote size={14} />}
                  {method === 'Cards' && <CreditCard size={14} />}
                  {method === 'UPI' && (
                    <Image
                      src="/assets/google-pay-icon.png"
                      alt=""
                      width={14}
                      height={14}
                      className="object-contain"
                    />
                  )}
                  {method === 'Cards' ? 'Card' : method}
                </button>
              ))}
            </div>

            {paymentMethod === 'Credit' && (
              <details className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] leading-4 text-amber-800">
                <summary className="cursor-pointer font-medium">
                  Credit sale · collection is your responsibility
                </summary>
                <p className="mt-1">
                  Store owners are solely responsible for collecting credit
                  payments. Aiva Stores bears no responsibility for outstanding
                  customer dues.
                </p>
              </details>
            )}

            <div className="flex items-end justify-between gap-3 py-3">
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Total payable
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {cartUnits} units · {paymentMethod === 'Cards' ? 'Card' : paymentMethod}
                </p>
              </div>

              <p className="break-all text-right text-2xl font-bold leading-none tracking-tight tabular-nums text-orange-600">
                ₹{totalAmount.toFixed(2)}
              </p>
            </div>

            <button
              type="button"
              disabled={isSubmitting || showInvoice}
              onClick={handleCheckout}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Generating bill…
                </>
              ) : (
                paymentMethod === 'Credit'
                  ? 'Confirm Credit Sale'
                  : 'Generate Bill'
              )}
            </button>
          </div>
        </aside>
      )}

      <InvoiceDialog 
        isOpen={showInvoice}
        onClose={() => {
          setShowInvoice(false)
          setCustomerPhone('')
          setInvoiceUrl(null)
          setSuggestions([])
          setShowSuggestions(false)
          billingLockedRef.current = false
          void resumePhoneScanner()
        }}
        orderId={lastOrderId}
        totalAmount={checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
        storeName={profile?.store_name || 'Our Store'}
        upiId={profile?.upi_id}
        cartItems={checkoutCart}
        onShareWhatsApp={() => {
          const url = getWhatsAppUrl(customerPhone, checkoutCart, profile?.store_name || 'Our Store', checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0), invoiceUrl || undefined)
          window.open(url, '_blank')
        }}
      />
    </div>
  )
}