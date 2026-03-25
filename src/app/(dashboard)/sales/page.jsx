'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { salesService } from '@/services/salesService';
import { useAuth } from '@/components/AuthProvider';
import { 
  Plus, 
  Search, 
  ShoppingBag, 
  ChevronRight, 
  History, 
  Package,
  Tag,
  IndianRupee,
  XCircle,
  Minus,
  Plus as PlusIcon
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function SalesPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [view, setView] = useState('list');
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTodaySales();
  }, []);

  async function fetchTodaySales() {
    try {
      setLoading(true);
      const data = await salesService.getTodaySales();
      setSales(data);
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredSales = sales.filter(s => 
    s.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.brand_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (view === 'record') return <RecordSale onCancel={() => setView('list')} onComplete={() => { setView('list'); fetchTodaySales(); }} />;
  if (view === 'details' && selectedSale) return <SaleDetails sale={selectedSale} onBack={() => setView('list')} />;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search product or brand..."
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button 
            onClick={() => setView('record')}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 font-bold text-white transition-colors hover:bg-purple-700"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">New Sale</span>
          </button>
          <button 
            onClick={() => router.push('/history?tab=sales')}
            className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-50"
          >
            <History className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Today's Sales</h3>
        <p className="text-sm font-bold text-purple-600">
          Total: {formatCurrency(filteredSales.reduce((sum, s) => sum + (s.price * s.quantity), 0))}
        </p>
      </div>

      {/* Sales List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200"></div>)
        ) : filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <div 
              key={sale.id}
              onClick={() => { setSelectedSale(sale); setView('details'); }}
              className="group cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{sale.product_name}</h4>
                  <p className="text-sm text-gray-500">{sale.brand_type}</p>
                </div>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(sale.price)}</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <p className="text-xs text-gray-400">Qty: {sale.quantity}</p>
                <ChevronRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <ShoppingBag className="h-16 w-16 opacity-20" />
            <p className="mt-4 font-medium">No sales recorded today</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RecordSale({ onCancel, onComplete }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    brand_type: '',
    quantity: 1,
    price: '',
  });

  const productSuggestions = ['Cable', 'Ear Buds', 'Pouches', 'Screen Guards', 'Watches'];
  const brandSuggestions = {
    'Cable': ['Type C', 'Micro USB', 'Lightning', 'Apple Cable', 'Fast Charging'],
    'Ear Buds': ['Realme T10', 'Boat Airdopes', 'Noise Buds', 'OnePlus Buds', 'Samsung Buds'],
    'Pouches': ['Vivo T3 Lite', 'Samsung A Series', 'Redmi Note Series', 'Realme Narzo', 'Universal'],
    'Screen Guards': ['Vivo', 'Samsung', 'Redmi', 'Realme', 'Universal'],
    'Watches': ['Noise', 'Boat', 'Fire Boltt', 'Realme', 'OnePlus'],
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await salesService.recordSale(formData, profile?.id);
      toast.success('Sale recorded successfully!');
      onComplete();
    } catch (err) {
      toast.error(err.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto pb-20">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Record New Sale</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <XCircle className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Product (Accessory Type)</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-purple-500 focus:outline-none"
              placeholder="e.g. Cable, Ear Buds"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {productSuggestions.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, product_name: p })}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Brand / Type</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-purple-500 focus:outline-none"
              placeholder="e.g. Type C, Samsung Buds"
              value={formData.brand_type}
              onChange={(e) => setFormData({ ...formData, brand_type: e.target.value })}
            />
            {brandSuggestions[formData.product_name] && (
              <div className="mt-2 flex flex-wrap gap-2">
                {brandSuggestions[formData.product_name].map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setFormData({ ...formData, brand_type: b })}
                    className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600 hover:bg-purple-100"
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Quantity</label>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                  className="rounded-md bg-gray-100 p-2 hover:bg-gray-200"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  className="w-full bg-transparent text-center font-bold focus:outline-none"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                  className="rounded-md bg-gray-100 p-2 hover:bg-gray-200"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Price</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  required
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 focus:border-purple-500 focus:outline-none"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-purple-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-purple-700 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Recording Sale...' : 'Record Sale'}
        </button>
      </form>
    </div>
  );
}

function SaleDetails({ sale, onBack }) {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={onBack} className="rounded-full bg-white p-2 shadow-sm">
          <ChevronRight className="h-6 w-6 rotate-180" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Sale Details</h2>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{sale.product_name}</h3>
            <p className="text-gray-500">{sale.brand_type}</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">{formatCurrency(sale.price)}</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <DetailItem label="Quantity" value={sale.quantity} icon={Package} />
          <DetailItem label="Total Amount" value={formatCurrency(sale.price * sale.quantity)} icon={IndianRupee} />
          <DetailItem label="Recorded By" value={sale.profiles?.full_name || 'N/A'} icon={Package} />
          <DetailItem label="Time" value={new Date(sale.created_at).toLocaleString()} icon={Tag} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon: Icon }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-purple-600" />
        <p className="font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
