//src/app/partners/dashboard/walkin-billing/page.tsx
'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { Search, ShoppingCart, Trash2, ChevronLeft, History, Loader2, Package, Banknote, CreditCard, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CartProduct, createWalkinOrder, getRecentCustomerPhones } from '@/lib/partners/walkin-billing/utils'
import { getWhatsAppUrl } from '@/lib/partners/walkin-billing/whatsapp'
import { generateAndUploadInvoice } from '@/lib/partners/walkin-billing/pdf-service'
import { usePartnerProfile } from '@/components/partners/PartnerProfileProvider'
import ProductCard from '@/components/partners/walkin-billing/ProductCard'
import InvoiceDialog from '@/components/partners/walkin-billing/InvoiceDialog'

interface Product {
  id: string; name: string; price: number; stock_quantity: number; frozen_quantity: number; image_url?: string | null; 
  category_name?: string; unit_value: number; unit_metric: string; brand?: string | null; 
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

  // Fetch Products
  useEffect(() => {
    async function loadData() {
      if (!profile?.id) return
      
      // Fetch Products and Categories in parallel
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select(`
            id, name, price, stock_quantity, frozen_quantity, brand, image_url, unit_value, unit_metric,
            global_categories(name),
            discounts (discount_type, discount_value)
          `)
          .eq('store_id', profile.id)
          .order('name', { ascending: true }),
        supabase
          .from('global_categories')
          .select('name, image_url')
      ])

      if (prodRes.data) {
        setProducts(prodRes.data.map((p: any) => ({
          ...p,
          category_name: p.global_categories?.name || 'Others'
        })))
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

  const cartItems = Object.values(cart)
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleAddToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (quantity <= 0) {
        delete newCart[product.id]
      } else {
        const sellingPrice = product.discounts
          ? product.discounts.discount_type === 'percent'
            ? product.price * (1 - product.discounts.discount_value / 100)
            : product.price - product.discounts.discount_value
          : product.price
        
        newCart[product.id] = {
          id: product.id,
          name: product.name,
          price: sellingPrice,
          quantity,
          unit_metric: product.unit_metric,
          unit_value: product.unit_value,
          originalPrice: product.price,
          image_url: product.image_url,
          brand: product.brand
        }
      }
      return newCart
    })
  }

  const handleCheckout = async () => {
    if (!profile?.id || cartItems.length === 0) return;
    // Validation: Credit requires phone number
    if (paymentMethod === 'Credit' && (!customerPhone || customerPhone.length < 10)) {
      alert("Customer Phone Number is mandatory for Credit transactions.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const result = await createWalkinOrder(profile.id, cartItems, null, customerPhone, paymentMethod);
      
      if (result.orderId) {
        setLastOrderId(result.orderId);
        setCheckoutCart([...cartItems]);

        // 1. IMMEDIATELY show the dialog so the user isn't stuck loading
        setShowInvoice(true);
        setCart({});

        // 2. Generate PDF in the background
        generateAndUploadInvoice(
          profile.id,
          result.orderId,
          profile.store_name || 'Our Store',
          cartItems,
          totalAmount,
          profile.gstin
        ).then((url) => {
          if (url) {
            setInvoiceUrl(url);
          }
        }).catch(err => {
          console.error("Background PDF generation failed", err);
        });

      } else {
        alert("Order Error: " + result.error);
      }
    } catch (err: any) {
      console.error("Checkout failed:", err);
      alert("Something went wrong during checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-gray-900 overflow-hidden">
      {/* 1. Left Vertical Category Sidebar (Refined & Minimal) */}
      <aside className="w-24 hover:w-64 transition-all duration-300 ease-in-out flex-shrink-0 flex flex-col pt-[104px] pb-8 z-30 group/sidebar">
        <div className="flex-1 overflow-y-auto no-scrollbar px-3">
          {/* Subtle container for categories to scroll within */}
          <div className="bg-white/40 backdrop-blur-sm rounded-[24px] py-3 flex flex-col gap-1 border border-white/50 shadow-sm">
            {activeCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex flex-col group-hover/sidebar:flex-row items-center py-2 px-3 mx-2 rounded-2xl transition-all duration-300 gap-0 group-hover/sidebar:gap-4 ${
                  selectedCategory === cat.name 
                    ? 'bg-white shadow-md ring-1 ring-black/[0.03]' 
                    : 'hover:bg-white/60'
                }`}
              >
                <div className="relative w-10 h-10 flex-shrink-0">
                  {cat.name === 'All' ? (
                    <div className={`w-full h-full rounded-lg flex items-center justify-center transition-all ${
                      selectedCategory === 'All' 
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' 
                        : 'bg-gray-100/50 text-gray-400'
                    }`}>
                      <Package size={18} />
                    </div>
                  ) : (
                    /* The "Frame" with very small padding as requested */
                    <div className={`w-full h-full rounded-lg p-0.5 transition-all ${
                      selectedCategory === cat.name 
                        ? 'bg-orange-100/50' 
                        : 'bg-gray-100/30'
                    }`}>
                      <div className="relative w-full h-full rounded-[12px] overflow-hidden shadow-inner bg-white">
                        <Image
                          src={cat.image_url || '/assets/product_fallback.jpg'}
                          alt={cat.name}
                          fill
                          className="object-cover p-0.5"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <span className={`
                  text-[9px] group-hover/sidebar:text-sm 
                  text-center group-hover/sidebar:text-left 
                  font-bold leading-tight uppercase 
                  tracking-tight group-hover/sidebar:tracking-wider 
                  transition-all duration-300
                  ${selectedCategory === cat.name ? 'text-orange-600' : 'text-gray-400 group-hover/sidebar:text-gray-600'}
                `}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Transparent Header */}
        <header className="px-8 py-6 flex items-center justify-between gap-8">
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

          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by product name or brand..." 
              className="w-full pl-12 pr-4 py-3.5 bg-white border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-300 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link href="/partners/dashboard/walkin-billing/history" className="flex items-center gap-2 text-gray-400 hover:text-orange-600 font-bold transition-colors bg-white px-4 py-3 rounded-2xl shadow-sm">
            <History size={18} />
            <span className="text-sm">History</span>
          </Link>
        </header>

        {/* Seamless Grid Container */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {filteredProducts.length > 0 ? (
            <div className={`grid gap-6 ${
              cartItems.length > 0 ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
            }`}>
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} quantityInCart={cart[p.id]?.quantity || 0} />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 bg-white/50 rounded-[32px] border-2 border-dashed border-gray-100">
              <Package size={80} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-medium">No items found in this section</p>
            </div>
          )}
        </div>
      </main>

      {/* 3. Floating-style Cart Sidebar */}
      {cartItems.length > 0 && (
        <div className="w-[400px] flex flex-col bg-white/70 backdrop-blur-xl rounded-xl border-l border-white/20 animate-in slide-in-from-right duration-500">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                <ShoppingCart size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-none">Order</h2>
                <span className="text-xs text-gray-400 font-medium">{cartItems.length} items added</span>
              </div>
            </div>
            <button onClick={() => setCart({})} className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-[0.2em] transition-colors">Clear</button>
          </div>
          {/* Customer Phone Search - Top Position */}
          <div className="px-8 py-4 bg-orange-50/50 border-b border-orange-100 relative">
            <div className="relative group">
              <label className="text-[10px] font-bold font-black text-orange-500 uppercase tracking-[0.2em] mb-1.5 block ml-1">
                Customer Phone
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-xs font-bold text-orange-400 border-r border-orange-200 pr-2">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="Type number..."
                  className="w-full pl-14 pr-4 py-2.5 border border-orange-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none bg-white transition-all placeholder:font-medium placeholder:text-gray-300"
                  value={customerPhone}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) {
                      setCustomerPhone(val);
                      if (val.length < 3) setShowSuggestions(false);
                    }
                  }}
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute z-[100] left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {suggestions.map((phone) => (
                    <button
                      key={phone}
                      className="w-full px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-orange-50 border-b border-gray-50 last:border-none flex items-center justify-between"
                      onClick={() => {
                        setCustomerPhone(phone);
                        setShowSuggestions(false);
                      }}
                    >
                      <span>{phone}</span>
                      <span className="text-[10px] text-orange-400 font-medium">Existing Customer</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Click away listener to close suggestions */}
            {showSuggestions && <div className="fixed inset-0 z-[90]" onClick={() => setShowSuggestions(false)} />}
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-4 items-start group">
                {/* Product Image */}
                <div className="relative w-12 h-12 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
                  <Image 
                    src={item.image_url || '/assets/product_fallback.jpg'}
                    alt={item.name} 
                    fill 
                    className="object-contain p-1"
                  />
                </div>

                <div className="flex-1 min-w-0 py-1">
                    {item.brand && (
                        <p className="text-[10px] font-medium text-orange-400 uppercase tracking-wider mb-0.5">
                        {item.brand}
                        </p>
                    )}
                    <p className="font-bold text-[13px] text-gray-800 leading-snug break-words">
                        {item.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-1 rounded">
                        {item.unit_value} {item.unit_metric}
                        </span>
                        <span className="text-[10px] font-bold text-gray-900">
                        ₹{item.price.toFixed(2)} 
                        <span className="text-gray-300 font-normal mx-1">×</span> 
                        {item.quantity}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1 ml-2 pt-1">
                    <p className="font-black text-sm text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-[10px] text-green-600 font-bold line-through opacity-70">
                        ₹{(item.originalPrice * item.quantity).toFixed(2)}
                        </p>
                    )}
                    <button 
                        onClick={() => {
                        const { [item.id]: _, ...remainingCart } = cart;
                        setCart(remainingCart);
                        }}
                        className="mt-1 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-2 bg-white border-t border-gray-100">
            {/* Payment Method Selector Heading */}
            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="text-[12px] font-bold font-black uppercase text-orange-400">Payment Mode</h3>
              {paymentMethod === 'Credit' && (
                <div className="group relative">
                  <Info size={14} className="text-orange-500 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 leading-relaxed">
                    <span className="font-bold text-orange-400 block mb-0.5">Store Responsibility Notice:</span>
                    Store owners are solely responsible for collecting credit payments. Aiva Stores bears no responsibility for outstanding customer dues.
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4 flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100">
              {[
                { id: 'CASH', label: 'Cash', icon: <Banknote size={14} /> },
                { id: 'UPI', label: 'UPI', icon: <Image src="/assets/google-pay-icon.png" alt="UPI" width={14} height={14} className="object-contain" /> },
                { id: 'Cards', label: 'Card', icon: <CreditCard size={14} /> },
                { id: 'Credit', label: 'Credit', icon: null }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl transition-all duration-200 ${
                    paymentMethod === method.id 
                      ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/[0.05]' 
                      : 'text-black-400 hover:text-orange-600'
                  }`}
                >
                  <span className={paymentMethod === method.id ? 'opacity-100' : 'opacity-50'}>
                    {method.icon}
                  </span>
                  <span className="text-[10px] font-bold font-black uppercase tracking-regular">{method.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest px-1">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-black text-gray-900 uppercase">Total</span>
                  <span className="text-3xl font-black text-orange-600 tracking-tighter">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              disabled={isSubmitting}
              onClick={handleCheckout}
              className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 tracking-wide ${
                paymentMethod === 'Credit' 
                ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-100 text-white' 
                : 'bg-gray-900 hover:bg-black shadow-gray-200 text-white'
              }`}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  <span className="uppercase text-sm tracking-widest">
                    {paymentMethod === 'Credit' ? 'Confirm Credit Sale' : 'Generate Bill'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <InvoiceDialog 
        isOpen={showInvoice}
        onClose={() => {
          setShowInvoice(false)
          setCustomerPhone('')
          setInvoiceUrl(null)
          setSuggestions([])
          setShowSuggestions(false)
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