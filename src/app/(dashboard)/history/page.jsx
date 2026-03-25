'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { historyService } from '@/services/historyService';
import { useAuth } from '@/components/AuthProvider';
import { 
  Search, 
  ChevronRight, 
  Wrench, 
  ShoppingBag
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'sales' ? 'sales' : 'services';
  
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [services, setServices] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (profile) {
      fetchHistory();
    }
  }, [activeTab, profile]);

  async function fetchHistory() {
    try {
      setLoading(true);
      if (activeTab === 'services') {
        const data = await historyService.getServiceHistory(profile);
        setServices(data);
      } else {
        const data = await historyService.getSalesHistory(profile);
        setSales(data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredServices = services.filter(s => 
    s.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.device_model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSales = sales.filter(s => 
    s.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.brand_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Past History</h2>
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab('services')}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all",
              activeTab === 'services' ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Wrench className="h-4 w-4" />
            Services
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all",
              activeTab === 'sales' ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            Sales
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200"></div>)
        ) : activeTab === 'services' ? (
          filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div key={service.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">{service.customer_name}</h4>
                    <p className="text-xs text-gray-500">{service.device_brand} {service.device_model}</p>
                  </div>
                  <p className="text-xs font-bold text-orange-600 uppercase">{service.ticket_number}</p>
                </div>
                <div className="mt-4 border-t pt-4 flex justify-between items-center text-[10px] text-gray-400">
                  <span>Returned: {new Date(service.returned_at).toLocaleDateString()}</span>
                  <span className="font-bold text-green-600">{formatCurrency(service.final_amount)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <Wrench className="h-16 w-16 opacity-20" />
              <p className="mt-4 font-medium">No service history found</p>
            </div>
          )
        ) : (
          filteredSales.length > 0 ? (
            filteredSales.map((sale) => (
              <div key={sale.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">{sale.product_name}</h4>
                    <p className="text-xs text-gray-500">{sale.brand_type}</p>
                  </div>
                  <p className="text-lg font-bold text-purple-600">{formatCurrency(sale.price)}</p>
                </div>
                <div className="mt-4 border-t pt-4 flex justify-between items-center text-[10px] text-gray-400">
                  <span>By: {sale.profiles?.full_name || 'N/A'}</span>
                  <span>{new Date(sale.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <ShoppingBag className="h-16 w-16 opacity-20" />
              <p className="mt-4 font-medium">No sales history found</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
