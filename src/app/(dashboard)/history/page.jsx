'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { historyService } from '@/services/historyService';
import { useAuth } from '@/components/AuthProvider';
import { 
  Search, 
  ChevronRight, 
  Wrench, 
  ShoppingBag,
  User,
  MapPin,
  Smartphone,
  SlidersHorizontal
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'sales' ? 'sales' : 'services';
  const todayParam = searchParams.get('today');

  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [services, setServices] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('Returned');
const [showFilters, setShowFilters] = useState(false);
const filtersRef = useRef(null);
  const [view, setView] = useState('list');
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    if (profile) {
      fetchHistory();
    }
  }, [activeTab, profile]);


  useEffect(() => {
    function handleClickOutside(event) {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSearchQuery('');
    setBrandFilter('all');
    setDateFrom('');
    setDateTo('');
    setShowFilters(false);

    if (activeTab === 'services') {
      setStatusFilter('Returned');
    }
  }, [activeTab]);
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    if (activeTab === 'services') {
      setStatusFilter('Returned');
    }

    if (todayParam === 'returned' && activeTab === 'services') {
      setDateFrom(today);
      setDateTo(today);
      setStatusFilter('Returned');
    } else if (todayParam === 'true') {
      setDateFrom(today);
      setDateTo(today);
    }
  }, [todayParam, activeTab]);

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

  const filteredServices = services.filter(s => {
    const matchesSearch = 
      s.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.device_brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.device_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.issue_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.issue_description && s.issue_description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesBrand = brandFilter === 'all' || s.device_brand.toLowerCase() === brandFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    
    // Date filtering for services
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const serviceDate = new Date(s.returned_at || s.updated_at || s.created_at);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      
      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && serviceDate >= fromDate;
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && serviceDate <= toDate;
      }
    }
    
    return matchesSearch && matchesBrand && matchesStatus && matchesDate;
  });

  const filteredSales = sales.filter(s => {
    const matchesSearch = 
      s.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.brand_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBrand = brandFilter === 'all' || s.brand_type.toLowerCase() === brandFilter.toLowerCase();
    
    // Date filtering for sales
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const saleDate = new Date(s.created_at);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      
      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && saleDate >= fromDate;
      }
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && saleDate <= toDate;
      }
    }
    
    return matchesSearch && matchesBrand && matchesDate;
  });

  return (
    <div className="space-y-6">
      {view === 'details' && selectedService ? (
        <ServiceHistoryDetails 
          service={selectedService} 
          onBack={() => setView('list')} 
          profile={profile}
        />
      ) : (
        <>
          <div className="flex justify-start">
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
      <div className="relative space-y-4" ref={filtersRef}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "relative rounded-xl border p-2.5 transition-colors shrink-0",
                showFilters
                  ? "border-orange-500 bg-orange-50 text-orange-600"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              <SlidersHorizontal className="h-5 w-5" />
              {(
                brandFilter !== 'all' ||
                dateFrom ||
                dateTo ||
                (activeTab === 'services' && statusFilter !== 'Returned')
              ) && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-orange-500"></span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        {activeTab === 'services' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</span>
            <div className="flex flex-wrap gap-1">
              {['Returned', 'Completed', 'Not Repairable', 'all'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                    statusFilter === status
                      ? "bg-orange-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Popup */}
        {showFilters && (
          <div className="absolute right-0 top-[72px] z-30 w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
            <div className="flex flex-wrap items-center gap-4">
              {/* Brand Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Brand:</span>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="all">All Brands</option>
                  {activeTab === 'services' ? (
                    <>
                      <option value="samsung">Samsung</option>
                      <option value="apple">Apple</option>
                      <option value="oneplus">OnePlus</option>
                      <option value="xiaomi">Xiaomi</option>
                      <option value="oppo">Oppo</option>
                      <option value="vivo">Vivo</option>
                      <option value="realme">Realme</option>
                      <option value="motorola">Motorola</option>
                      <option value="other">Other</option>
                    </>
                  ) : (
                    <>
                      <option value="accessories">Accessories</option>
                      <option value="chargers">Chargers</option>
                      <option value="cases">Cases</option>
                      <option value="screen protectors">Screen Protectors</option>
                      <option value="other">Other</option>
                    </>
                  )}
                </select>
              </div>

              {/* Date Filters */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200"></div>)
        ) : activeTab === 'services' ? (
          filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div 
                key={service.id} 
                onClick={() => { setSelectedService(service); setView('details'); }}
                className="cursor-pointer rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
              >
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
        </>
      )}
    </div>
  );
}

function ServiceHistoryDetails({ service, onBack, profile }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [service.id]);

  async function fetchHistory() {
    try {
      setLoading(false);
      // For history view, we can get the service history from the service object or fetch additional details
      // Since this is history, we'll show what we have
    } catch (err) {
      console.error('Error fetching history:', err);
      setLoading(false);
    }
  }

  // Role-based data display
  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner';
  const isTechnician = profile?.role === 'technician';

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={onBack} className="rounded-full bg-white p-2 shadow-sm">
          <ChevronRight className="h-6 w-6 rotate-180" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{service.customer_name}</h2>
          <p className="text-sm font-bold text-orange-600 uppercase">{service.ticket_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Device Info */}
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem label="Mobile Number" value={service.customer_mobile} icon={User} />
              <InfoItem label="Address/Area" value={service.customer_address || 'N/A'} icon={MapPin} />
              <InfoItem label="Device" value={`${service.device_brand} ${service.device_model}`} icon={Smartphone} />
              <InfoItem label="Issue Type" value={service.issue_type} icon={Wrench} />
            </div>
            
            {service.issue_description && (
              <div className="border-t pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase">Issue Description</p>
                <p className="mt-1 text-sm text-gray-600">{service.issue_description}</p>
              </div>
            )}
          </div>

          {/* Photos */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-gray-900">Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {service.customer_photo_url ? (
                <img 
                  src={service.customer_photo_url} 
                  alt="Customer" 
                  className="aspect-square rounded-lg object-cover cursor-pointer hover:opacity-80"
                  onClick={() => window.open(service.customer_photo_url, '_blank')}
                />
              ) : <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center text-[10px] text-gray-400">No Customer Photo</div>}
              
              {service.device_front_photo_url ? (
                <img 
                  src={service.device_front_photo_url} 
                  alt="Device Front" 
                  className="aspect-square rounded-lg object-cover cursor-pointer hover:opacity-80"
                  onClick={() => window.open(service.device_front_photo_url, '_blank')}
                />
              ) : <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center text-[10px] text-gray-400">No Front Photo</div>}
              
              {service.device_back_photo_url ? (
                <img 
                  src={service.device_back_photo_url} 
                  alt="Device Back" 
                  className="aspect-square rounded-lg object-cover cursor-pointer hover:opacity-80"
                  onClick={() => window.open(service.device_back_photo_url, '_blank')}
                />
              ) : <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center text-[10px] text-gray-400">No Back Photo</div>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Service Summary */}
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">Service Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Received Date:</span>
                <span className="text-sm font-medium">{new Date(service.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Returned Date:</span>
                <span className="text-sm font-medium">{new Date(service.returned_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Estimated Cost:</span>
                <span className="text-sm font-medium">{formatCurrency(service.estimated_cost)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm font-medium text-gray-700">Final Amount:</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(service.final_amount)}</span>
              </div>
            </div>
          </div>

          {/* Role-based Information */}
          {isAdmin && (
            <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900">Business Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Profit/Loss:</span>
                  <span className={`text-sm font-bold ${service.final_amount >= service.estimated_cost ? 'text-green-600' : 'text-red-600'}`}>
                    {service.final_amount >= service.estimated_cost ? '+' : ''}{formatCurrency(service.final_amount - service.estimated_cost)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Service Duration:</span>
                  <span className="text-sm font-medium">
                    {Math.ceil((new Date(service.returned_at) - new Date(service.created_at)) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>
          )}

          {isTechnician && (
            <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900">Technical Notes</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Final Status:</span>
                  <span className="text-sm font-medium text-green-600">Completed</span>
                </div>
                <div className="text-sm text-gray-600">
                  Service completed successfully. Device returned to customer.
                </div>
              </div>
            </div>
          )}

          {/* Service Timeline */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-gray-900">Service Timeline</h3>
            <div className="space-y-4">
              <div className="relative pl-4 border-l-2 border-orange-100">
                <div className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-orange-500" />
                <p className="text-sm font-bold text-gray-900">Service Received</p>
                <p className="text-xs text-gray-500">by {service.profiles?.full_name || 'Staff'}</p>
                <p className="text-[10px] text-gray-400">{new Date(service.created_at).toLocaleString()}</p>
              </div>
              
              <div className="relative pl-4 border-l-2 border-green-100">
                <div className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-green-500" />
                <p className="text-sm font-bold text-gray-900">Service Completed & Returned</p>
                <p className="text-xs text-gray-500">by {service.returned_by_profile?.full_name || 'Staff'}</p>
                <p className="text-[10px] text-gray-400">{new Date(service.returned_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-orange-600" />
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
