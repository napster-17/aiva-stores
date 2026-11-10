//src/components/partners/products/ScannerNewProductForm.tsx
'use client';

import React, { useState } from 'react';
import { ArrowLeft, ImagePlus, Loader2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadProductImage } from '@/lib/partners/product-upload';
import { toast } from 'sonner';

type Category = { id: string; name: string };
type Props = {
  barcode: string;
  storeId: string;
  categories: Category[];
  onBack: () => void;
  onResolved: (product: any, alreadyInStore: boolean, barcode: string) => void;
};

const field = 'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100';

export default function ScannerNewProductForm({ barcode, storeId, categories, onBack, onResolved }: Props) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitType, setUnitType] = useState('pack');
  const [unitMetric, setUnitMetric] = useState('pcs');
  const [unitValue, setUnitValue] = useState('1');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadProductImage(createClient(), file, storeId);
      setImageUrl(url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return toast.error('Enter a product name');
    if (!unitValue || Number(unitValue) <= 0) return toast.error('Enter a valid unit value');
    if (price && (!Number.isFinite(Number(price)) || Number(price) < 0)) return toast.error('Enter a valid price');
    setSaving(true);
    try {
      const response = await fetch('/api/partners/scanner/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create', barcode,
          product: {
            name: name.trim(), brand: brand.trim(),
            category_id: categoryId || null,
            unit_type: unitType, unit_metric: unitMetric,
            unit_value: Number(unitValue),
            price: price === '' ? null : Number(price),
            image_url: imageUrl || null,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not create product');
      onResolved(result.product, result.alreadyInStore, barcode);
      toast.success('Product created in global catalog');
    } catch (error: any) {
      toast.error(error.message || 'Could not create product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600">
        <ArrowLeft size={14} /> Back to matching
      </button>
      <div>
        <h4 className="text-sm font-bold text-slate-900">Create global product</h4>
        <p className="mt-1 text-xs leading-5 text-slate-500">The scanned barcode will be saved as this product’s primary barcode.</p>
      </div>
      <div className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-2 font-mono text-xs font-semibold text-orange-800">{barcode}</div>
      <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Product name *</label><input required maxLength={180} className={field} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amul Cheese Slices" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Brand</label><input maxLength={120} className={field} value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Amul" /></div>
        <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Category</label><select className={field} value={categoryId} onChange={e => setCategoryId(e.target.value)}><option value="">Uncategorized</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Type</label><select className={field} value={unitType} onChange={e => setUnitType(e.target.value)}><option value="pack">Pack</option><option value="loose">Loose</option></select></div>
        <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Metric</label><select className={field} value={unitMetric} onChange={e => setUnitMetric(e.target.value)}>{['pcs','nos','gms','kg','ml','litre'].map(v => <option key={v} value={v}>{v}</option>)}</select></div>
        <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Value *</label><input required type="number" min="0.001" step="any" className={field} value={unitValue} onChange={e => setUnitValue(e.target.value)} /></div>
      </div>
      <div className="space-y-1"><label className="text-xs font-semibold text-slate-600">Suggested selling price (₹)</label><input type="number" min="0" step="0.01" className={field} value={price} onChange={e => setPrice(e.target.value)} placeholder="Optional; editable before import" /></div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-600">Product image</label>
        <label className="flex min-h-20 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 hover:border-orange-300">
          {imageUrl ? <img src={imageUrl} alt="Product preview" className="h-14 w-14 rounded-lg bg-white object-contain" /> : <ImagePlus size={24} className="text-slate-400" />}
          <span className="text-xs font-medium text-slate-500">{uploading ? 'Uploading image...' : imageUrl ? 'Change image' : 'Upload product image (optional)'}</span>
          <input type="file" accept="image/*" className="hidden" disabled={uploading || saving} onChange={e => { const file = e.target.files?.[0]; if (file) void uploadImage(file); e.currentTarget.value = ''; }} />
        </label>
      </div>
      <button type="submit" disabled={saving || uploading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create and select product
      </button>
    </form>
  );
}