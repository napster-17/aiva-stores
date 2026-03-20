//src/app/partners/dashboard/analytics/page.tsx
'use client'
import { RefreshCw } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import { TrendingUp, ShoppingBag, BarChart3, PieChart, Package, AlertCircle, CreditCard, Clock, Users } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts'
import { toast } from 'sonner'

const Shimmer = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
)

// --- REUSABLE COMPONENTS ---
const CardHeader = ({ title, icon: Icon, children }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-2">
      <div className="p-2 bg-orange-50 rounded-lg text-[#FF8500]"><Icon size={16}/></div>
      <h3 className="font-bold text-gray-800 text-[14px] uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
)

function StatCard({ title, icon: Icon, metricKey, data, loading }: any) {
  const getValue = () => {
    if (!data) return '₹0';
    const val = data[metricKey] || 0;
    if (metricKey === 'totalOrders') return val.toString();
    return `₹${Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Check if this specific card is a profit-related card
  const isProfitCard = metricKey === 'totalProfit' || metricKey === 'avgProfitPerOrder';

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-start">
        <CardHeader title={title} icon={Icon} />
        {metricKey === 'totalSales' && (
          <span className="flex h-2 w-2 mt-1">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-end">
        <div className="text-3xl font-black text-gray-800">
          {loading ? <Shimmer className="h-9 w-32" /> : getValue()}
        </div>

        {/* Persistent Disclaimer inside the card, only for profit cards */}
        {!loading && isProfitCard && (
          <div className="flex items-start gap-1.5 mt-4 pt-4 border-t border-gray-50">
            <AlertCircle size={12} className="text-orange-500 mt-0.5 shrink-0" />
            <p className="text-[12px] font-bold text-orange-500 italic leading-tight">
              Values may be inaccurate if Cost Price is missing from products in inventory.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SalesChartSection() {
  const [range, setRange] = useState('7d')
  const [type, setType] = useState('combined')
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChart = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/partners/analytics?range=${range}&type=${type}`)
        const json = await res.json()
        setChartData(json.chart)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    fetchChart()
  }, [range, type])

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <CardHeader title="Sales Trend" range={range} setRange={setRange} type={type} setType={setType} icon={TrendingUp} />
      <div className="h-[300px]">
        {loading ? <Shimmer className="w-full h-full" /> : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF8500" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#FF8500" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}} />
              <Area type="monotone" dataKey="sales" stroke="#FF8500" strokeWidth={3} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function ProductList({ title, color, isTop }: any) {
  const [range, setRange] = useState('7d')
  const [type, setType] = useState('combined')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/partners/analytics?range=${range}&type=${type}`)
        const json = await res.json()
        setItems(isTop ? json.topProducts : json.leastProducts)
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    fetchProducts()
  }, [range, type, isTop])

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <CardHeader title={title} range={range} setRange={setRange} type={type} setType={setType} icon={Package} />
      <div className="space-y-3">
        {loading ? [1, 2, 3, 4, 5].map(i => <Shimmer key={i} className="h-12 w-full" />) :
         items?.map((item: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-300 w-4">#{i+1}</span>
              <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{item.name}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-gray-800">{item.qty} Sold</p>
              <p className={`text-[9px] font-bold ${color === 'emerald' ? 'text-emerald-500' : 'text-red-500'}`}>
                {item.margin >= 0 ? '+' : ''}₹{item.margin.toFixed(0)}
              </p>
            </div>
          </div>
        ))}
        {!loading && (!items || items.length === 0) && <p className="text-[10px] text-center py-10 font-bold text-gray-400 uppercase">No Data Found</p>}
      </div>
    </div>
  )
}

function CategoryAndPaymentSection() {
  // Separate states for Categories
  const [catRange, setCatRange] = useState('7d')
  const [catType, setCatType] = useState('combined')
  const [catData, setCatData] = useState<any>(null)
  const [catLoading, setCatLoading] = useState(true)

  // Separate states for Payments
  const [payRange, setPayRange] = useState('7d')
  const [payType, setPayType] = useState('combined')
  const [payData, setPayData] = useState<any>(null)
  const [payLoading, setPayLoading] = useState(true)

  useEffect(() => {
    const fetchCats = async () => {
      setCatLoading(true)
      try {
        const res = await fetch(`/api/partners/analytics?range=${catRange}&type=${catType}`)
        const json = await res.json()
        setCatData(json)
      } catch (e) { console.error(e) }
      setCatLoading(false)
    }
    fetchCats()
  }, [catRange, catType])

  useEffect(() => {
    const fetchPays = async () => {
      setPayLoading(true)
      try {
        const res = await fetch(`/api/partners/analytics?range=${payRange}&type=${payType}`)
        const json = await res.json()
        setPayData(json)
      } catch (e) { console.error(e) }
      setPayLoading(false)
    }
    fetchPays()
  }, [payRange, payType])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Categories */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader title="Category Sales" range={catRange} setRange={setCatRange} type={catType} setType={setCatType} icon={PieChart} />
        <div className="space-y-4">
          {catLoading ? [1, 2, 3, 4].map(i => <Shimmer key={i} className="h-4 w-full" />) :
            catData?.categories?.map((cat: any) => (
            <div key={cat.name} className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">{cat.name}</span>
              <div className="flex-1 mx-4 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (cat.value / (catData.summary.totalSales || 1)) * 100)}%` }} />
              </div>
              <span className="text-xs font-black text-gray-800">₹{cat.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Payments */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader title="Payment Methods" range={payRange} setRange={setPayRange} type={payType} setType={setPayType} icon={CreditCard} />
        <div className="grid grid-cols-2 gap-4">
          {payLoading ? [1, 2].map(i => <Shimmer key={i} className="h-24 w-full" />) :
            payData?.payments?.map((pay: any) => (
            <div key={pay.name} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase">{pay.name}</p>
              <p className="text-xl font-black text-gray-800">{pay.value}</p>
              <p className="text-[9px] font-bold text-gray-400">Orders</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HeatmapAndCustomerSection({ data, loading }: any) {
  // Find the max count to calculate color intensity
  const maxOrders = Math.max(...(data?.heatmap?.map((h: any) => h.count) || [1]));
  
  // Helper to get color based on density
  const getSquareColor = (count: number) => {
    if (count === 0) return 'bg-gray-50';
    const intensity = count / maxOrders;
    if (intensity <= 0.25) return 'bg-orange-100';
    if (intensity <= 0.5) return 'bg-orange-300';
    if (intensity <= 0.75) return 'bg-orange-500';
    return 'bg-orange-600';
  };

  const peakHour = data?.heatmap?.reduce((prev: any, current: any) => 
    (prev.count > current.count) ? prev : current, {display: 'N/A', count: 0}
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Heatmap Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <CardHeader title="Order Density" icon={Clock} />
          {!loading && peakHour?.count > 0 && (
            <div className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              <p className="text-[10px] font-bold tracking-[0.1em] text-orange-600 uppercase">Peak: {peakHour.display}</p>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {loading ? (
            <Shimmer className="w-full h-32" />
          ) : (
            <div className="space-y-4">
              {/* The Heatmap Grid */}
              <div className="grid grid-cols-12 gap-1.5">
                {data?.heatmap?.map((hour: any, i: number) => (
                  <div key={i} className="group relative">
                    <div 
                      className={`aspect-square rounded-sm transition-all duration-500 ${getSquareColor(hour.count)} hover:ring-2 hover:ring-orange-400 hover:ring-offset-1`}
                    />
                    {/* Custom Tooltip on Hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-[11px] font-semibold px-2 py-1 rounded shadow-xl whitespace-nowrap">
                        {hour.display}: {hour.count} Orders
                      </div>
                      <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend & Labels */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight text-left">12am</span>
                  <div className="flex-1 h-[1px] w-12 bg-gray-100" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight text-center">12pm</span>
                  <div className="flex-1 h-[1px] w-12 bg-gray-100" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight text-right">11pm</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-400 mr-1 uppercase">Less</span>
                  <div className="w-2 h-2 rounded-sm bg-gray-100" />
                  <div className="w-2 h-2 rounded-sm bg-orange-100" />
                  <div className="w-2 h-2 rounded-sm bg-orange-300" />
                  <div className="w-2 h-2 rounded-sm bg-orange-500" />
                  <div className="w-2 h-2 rounded-sm bg-orange-600" />
                  <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">More</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="text-[12px] tracking-normal text-gray-400 font-bold mt-6 uppercase text-center">
          Hourly activity across selected period
        </p>
      </div>

      {/* New vs Returning Customers */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
        <CardHeader title="Customer Retention" icon={Users} />
        
        <div className="flex-1 flex flex-col justify-center">
          {loading ? (
            <Shimmer className="w-full h-32" />
          ) : (
            <div className="space-y-6">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-3xl font-black text-gray-800">
                    {((data?.customers?.new || 0) + (data?.customers?.returning || 0))}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Identified Customers</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-orange-500">
                    {data?.customers?.new + data?.customers?.returning > 0 
                      ? Math.round((data?.customers?.returning / (data?.customers?.new + data?.customers?.returning)) * 100) 
                      : 0}%
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Retention Rate</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Progress Bar */}
                {(() => {
                  const total = (data?.customers?.new || 0) + (data?.customers?.returning || 0) + (data?.customers?.undefined || 0) || 1;
                  const newPct = ((data?.customers?.new || 0) / total) * 100;
                  const retPct = ((data?.customers?.returning || 0) / total) * 100;
                  const undPct = ((data?.customers?.undefined || 0) / total) * 100;

                  return (
                    <div className="h-3 w-full bg-gray-50 rounded-full flex overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-1000" 
                        style={{ width: `${newPct}%` }} 
                      />
                      <div 
                        className="h-full bg-orange-200 transition-all duration-1000" 
                        style={{ width: `${retPct}%` }} 
                      />
                      <div 
                        className="h-full bg-gray-200 transition-all duration-1000" 
                        style={{ width: `${undPct}%` }} 
                      />
                    </div>
                  );
                })()}

                {/* Legend */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-[10px] font-bold text-gray-700 uppercase">New</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{data?.customers?.new || 0}</p>
                  </div>
                  <div className="flex flex-col border-x border-gray-100 px-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full bg-orange-200" />
                      <span className="text-[10px] font-bold text-gray-700 uppercase">Returning</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{data?.customers?.returning || 0}</p>
                  </div>
                  <div className="flex flex-col pl-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full bg-gray-200" />
                      <span className="text-[10px] font-bold text-gray-700 uppercase">Undefined</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">{data?.customers?.undefined || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-50">
          <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
            <span className="font-bold text-gray-500">Undefined:</span> Orders without phone/email tracking (common in quick walk-ins).
          </p>
        </div>
      </div>
    </div>
  )
}

// --- MAIN PAGE ---
export default function AnalyticsPage() {
  const [range, setRange] = useState('7d');
  const [type, setType] = useState('combined');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/partners/analytics?range=${range}&type=${type}`);
      const json = await res.json();
      setData(json);
      
      // Add this line to give the user immediate feedback
      if (isRefresh) toast.success("Data updated successfully");
      
    } catch (e) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range, type]);

  const ranges = [
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
    { label: '1Y', value: '1y' },
    { label: 'All', value: 'all' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
      {/* HEADER WITH CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Store Performance</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Real-time insights across all sales channels</p>
        </header>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            {/* Channel Toggle - Modernized */}
            <div className="flex bg-gray-50 p-1 rounded-xl">
              {[
                { label: 'All', value: 'combined' },
                { label: 'Online', value: 'online' },
                { label: 'Offline', value: 'walkin' }
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase transition-all ${
                    type === t.value ? 'bg-white text-[#FF8500] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-[1px] bg-gray-200 mx-1" />

            {/* Date Range Toggle */}
            <div className="flex bg-gray-50 p-1 rounded-xl">
              {ranges.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase transition-all ${
                    range === r.value ? 'bg-white text-[#FF8500] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh Button moved to the right */}
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            title="Refresh Data"
            className={`p-3 rounded-2xl bg-white border border-gray-100 shadow-sm text-gray-500 hover:text-[#FF8500] hover:border-orange-100 transition-all active:scale-95 ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* CORE STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Revenue" metricKey="totalSales" icon={TrendingUp} data={data?.summary} loading={loading} />
        <StatCard title="Total Orders" metricKey="totalOrders" icon={ShoppingBag} data={data?.summary} loading={loading} />
        <StatCard title="Avg. Order Value" metricKey="avgOrderValue" icon={BarChart3} data={data?.summary} loading={loading} />
      </div>

      {/* SALES CHART */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader title="Sales Trend" icon={TrendingUp} />
        <div className="h-[350px] w-full mt-4">
          {loading ? <Shimmer className="w-full h-full" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.chart || []}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8500" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FF8500" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                   contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} 
                   formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Sales']}
                />
                <Area type="monotone" dataKey="sales" stroke="#FF8500" strokeWidth={3} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* PROFIT STATS - Only shown for Combined or Offline */}
      {type !== 'online' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard 
            title={type === 'combined' ? "Total Profit (Offline Only)" : "Total Estimated Profit"} 
            metricKey="totalProfit" 
            icon={TrendingUp} 
            data={data?.summary} 
            loading={loading} 
          />
          <StatCard 
            title={type === 'combined' ? "Avg. Profit (Offline Only)" : "Avg. Profit per Order"} 
            metricKey="avgProfitPerOrder" 
            icon={BarChart3} 
            data={data?.summary} 
            loading={loading} 
          />
        </div>
      ) : (
        <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-3xl">
          <p className="text-xs font-bold text-orange-600 text-center italic">
            Profit analytics are currently available for Offline (Walk-in) orders only.
          </p>
        </div>
      )}

      {/* HEATMAP & CUSTOMER RETENTION */}
      <HeatmapAndCustomerSection data={data} loading={loading} />

      {/* PRODUCTS, CATEGORIES, PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProductListStatic title="Top Selling Items" items={data?.topProducts} color="emerald" loading={loading} />
        <ProductListStatic title="Least Selling Items" items={data?.leastProducts} color="red" loading={loading} />
      </div>

      <CategoryAndPaymentStatic data={data} loading={loading} />
    </div>
  )
}

// Cleaned up List components that just receive data
function ProductListStatic({ title, items, color, loading }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <CardHeader title={title} icon={Package} />
      <div className="space-y-3">
        {loading ? [1, 2, 3, 4, 5].map(i => <Shimmer key={i} className="h-12 w-full" />) :
          items?.map((item: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-300 w-4">#{i+1}</span>
              <span className="text-xs font-bold text-gray-700 truncate flex-1 max-w-[220px] sm:max-w-[300px]">{item.name}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-gray-800">{item.qty} Sold</p>
              {item.margin > 0 && (
                <p className={`text-[9px] font-bold ${color === 'emerald' ? 'text-emerald-500' : 'text-red-500'}`}>
                  ₹{Number(item.margin).toFixed(0)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CategoryAndPaymentStatic({ data, loading }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader title="Category Sales" icon={PieChart} />
        <div className="space-y-4">
          {loading ? [1, 2, 3, 4].map(i => <Shimmer key={i} className="h-4 w-full" />) :
            data?.categories?.map((cat: any) => (
            <div key={cat.name} className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">{cat.name}</span>
              <div className="flex-1 mx-4 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                {(() => {
                  const catPct = Math.min(100, (cat.value / (data.summary?.totalSales || 1)) * 100);
                  return (
                    <div className="h-full bg-orange-400" 
                      style={{ width: `${catPct}%` }} />
                  );
                })()}
              </div>
              <span className="text-xs font-black text-gray-800">₹{cat.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <CardHeader title="Payment Methods" icon={CreditCard} />
        <div className="grid grid-cols-2 gap-4">
          {loading ? [1, 2].map(i => <Shimmer key={i} className="h-24 w-full" />) :
            data?.payments?.map((pay: any) => (
            <div key={pay.name} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase">{pay.name}</p>
              <p className="text-xl font-black text-gray-800">{pay.value}</p>
              <p className="text-[9px] font-bold text-gray-400">Orders</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}