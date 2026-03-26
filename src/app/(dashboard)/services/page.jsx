'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { serviceService } from '@/services/serviceService';
import { useAuth } from '@/components/AuthProvider';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  History, 
  Camera, 
  Wrench,
  AlertCircle,
  Smartphone,
  User,
  MapPin,
  IndianRupee,
  XCircle,
  SlidersHorizontal
} from 'lucide-react';
import { cn, formatCurrency, setCookie, getCookie, deleteCookie } from '@/lib/utils';
import { toast } from 'sonner';

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [view, setView] = useState('list');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [issueFilter, setIssueFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const action = searchParams.get('action');
    const serviceId = searchParams.get('serviceId');
    const statusParam = searchParams.get('status'); // <-- 1. Get status from URL

    if (action === 'new') {
      setView('register');
    } else if (serviceId) { // <-- 2. Simplified logic for details
      setView('details');
    } else {
      setView('list');
      // 3. If a status is in the URL, apply it to the filter state
      if (statusParam) {
        setStatusFilter(statusParam);
      } else {
        setStatusFilter('all');
      }
    }

    fetchServices(serviceId);
  }, [searchParams, router]);

  async function fetchServices(serviceId = null) {
    try {
      setLoading(true);
      const data = await serviceService.getActiveServices();
      setServices(data);

      if (serviceId) {
        const id = Number(serviceId);
        const matched = data.find((s) => s.id === id || s.id === serviceId);
        if (matched) {
          setSelectedService(matched);
          setView('details');
        }
      } else if (selectedService) {
        // Update selectedService if it exists in the updated data
        const updatedService = data.find((s) => s.id === selectedService.id);
        if (updatedService) {
          setSelectedService(updatedService);
        }
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredServices = services.filter(s => {
    const matchesSearch = 
      s.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customer_mobile.includes(searchQuery) ||
      s.device_brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.device_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.issue_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.issue_description && s.issue_description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesIssue = issueFilter === 'all' || s.issue_type === issueFilter;
    const matchesBrand = brandFilter === 'all' || s.device_brand.toLowerCase() === brandFilter.toLowerCase();
    
    // Date filtering
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const serviceDate = new Date(s.created_at);
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && serviceDate >= fromDate;
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && serviceDate <= toDate;
      }
    }
    
    return matchesSearch && matchesStatus && matchesIssue && matchesBrand && matchesDate;
  });

  if (view === 'register') return <ServiceRegistration onCancel={() => setView('list')} onComplete={() => { setView('list'); fetchServices(); }} />;
  if (view === 'details' && selectedService) return <ServiceDetails service={selectedService} onBack={() => setView('list')} onUpdate={fetchServices} />;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="relative space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, mobile, brand, model, issue..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setView('register')}
                className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 font-bold text-white transition-colors hover:bg-orange-700"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">New Service</span>
              </button>

              <button 
                onClick={() => router.push('/history?tab=services')}
                className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 hover:bg-gray-50"
              >
                <History className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "relative rounded-xl border p-2.5 transition-colors",
                showFilters
                  ? "border-orange-500 bg-orange-50 text-orange-600"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              <SlidersHorizontal className="h-5 w-5" />
              {(issueFilter !== 'all' || brandFilter !== 'all' || dateFrom || dateTo) && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-orange-500"></span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="space-y-4">
          {/* Always Visible Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Status:</span>
            <div className="flex flex-wrap gap-1">
              {['all', 'Received', 'In Progress', 'Waiting for Parts', 'Completed', 'Not Repairable'].map((status) => (
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
                  {status === 'all' ? 'All Active' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Filters */}
          {showFilters && (
            <div className="absolute right-0 top-[140px] z-30 w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
              <div className="flex flex-wrap items-center gap-4">
                {/* Issue Type Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Issue:</span>
                  <select
                    value={issueFilter}
                    onChange={(e) => setIssueFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none"
                  >
                    <option value="all">All Issues</option>
                    <option value="Display Problem">Display Problem</option>
                    <option value="Battery Problem">Battery Problem</option>
                    <option value="Charging Problem">Charging Problem</option>
                    <option value="Software Issue">Software Issue</option>
                    <option value="Water Damage">Water Damage</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Brand Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Brand:</span>
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none"
                  >
                    <option value="all">All Brands</option>
                    <option value="samsung">Samsung</option>
                    <option value="apple">Apple</option>
                    <option value="oneplus">OnePlus</option>
                    <option value="xiaomi">Xiaomi</option>
                    <option value="oppo">Oppo</option>
                    <option value="vivo">Vivo</option>
                    <option value="realme">Realme</option>
                    <option value="motorola">Motorola</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Date Range Filters */}
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
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-200"></div>)
        ) : filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div 
              key={service.id}
              onClick={() => { setSelectedService(service); setView('details'); }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">{service.ticket_number}</p>
                  <h4 className="mt-1 text-lg font-bold text-gray-900">{service.customer_name}</h4>
                  <p className="text-sm text-gray-500">{service.device_brand} {service.device_model}</p>
                </div>
                <StatusBadge status={service.status} />
              </div>
              
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Wrench className="h-4 w-4" />
                  <span>{service.issue_type}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <Smartphone className="h-16 w-16 opacity-20" />
            <p className="mt-4 font-medium">No active services found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'Received': 'bg-gray-100 text-gray-600',
    'In Progress': 'bg-blue-100 text-blue-600',
    'Waiting for Parts': 'bg-yellow-100 text-yellow-600',
    'Completed': 'bg-green-100 text-green-600',
    'Not Repairable': 'bg-red-100 text-red-600',
  };

  return (
    <span className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase", styles[status])}>
      {status}
    </span>
  );
}

function ServiceRegistration({ onCancel, onComplete }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const COOKIE_KEY = 'serviceRegistrationDraft';
  const [formData, setFormData] = useState({
    customer_mobile: '',
    customer_name: '',
    customer_address: '',
    device_brand: '',
    device_model: '',
    imei: '',
    issue_type: 'Display Problem',
    issue_description: '',
    estimated_cost: '',
  });

  const [photos, setPhotos] = useState({});
  const isRefreshRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = getCookie(COOKIE_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft?.formData) {
          setFormData((prev) => ({ ...prev, ...draft.formData }));
        }
      } catch (err) {
        console.error('Failed to parse service draft cookie', err);
      }
    }

    const beforeUnloadHandler = () => sessionStorage.setItem('serviceRegistrationIsReload', '1');
    window.addEventListener('beforeunload', beforeUnloadHandler);

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      const isReload = sessionStorage.getItem('serviceRegistrationIsReload') === '1';
      if (isReload) {
        isRefreshRef.current = true;
        sessionStorage.removeItem('serviceRegistrationIsReload');
      }

      if (!isReload) {
        deleteCookie(COOKIE_KEY);
      }
    };
  }, []);

  useEffect(() => {
    try {
      setCookie(COOKIE_KEY, JSON.stringify({ formData }), 7);
    } catch (err) {
      console.error('Failed to set service draft cookie', err);
    }
  }, [formData]);

  async function handleMobileBlur() {
    if (formData.customer_mobile.length === 10) {
      try {
        const data = await serviceService.getCustomerLastDetails(formData.customer_mobile);
        if (data) {
          setFormData(prev => ({
            ...prev,
            customer_name: data.customer_name,
            customer_address: data.customer_address || '',
          }));
          toast.info('Customer details auto-filled');
        }
      } catch (err) {
        console.error('Error fetching customer details:', err);
      }
    }
  }

  function clearDraft() {
    deleteCookie(COOKIE_KEY);
  }

  function handleCancel() {
    clearDraft();
    onCancel();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const service = await serviceService.registerService(formData, photos, profile?.id);
      toast.success(`Service registered! Ticket: ${service.ticket_number}`);
      clearDraft();
      onComplete();
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Register New Service</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <XCircle className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Info */}
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-gray-900">
            <User className="h-5 w-5 text-orange-600" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number</label>
              <input
                type="tel"
                required
                maxLength={10}
                className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-orange-500 focus:outline-none"
                value={formData.customer_mobile}
                onBlur={handleMobileBlur}
                onChange={(e) => setFormData({ ...formData, customer_mobile: e.target.value.replace(/\D/g, '') })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Customer Name</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-orange-500 focus:outline-none"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </div>
            <div className="col-span-full space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Address / Area</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-orange-500 focus:outline-none"
                value={formData.customer_address}
                onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {['Bus Stand', 'College Road', 'Market Area'].map(area => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setFormData({ ...formData, customer_address: area })}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Device Info */}
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-gray-900">
            <Smartphone className="h-5 w-5 text-orange-600" />
            Device Information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Mobile Brand</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-orange-500 focus:outline-none"
                value={formData.device_brand}
                onChange={(e) => setFormData({ ...formData, device_brand: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Mobile Model</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-orange-500 focus:outline-none"
                value={formData.device_model}
                onChange={(e) => setFormData({ ...formData, device_model: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Issue Details */}
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-gray-900">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Issue Details
          </h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Issue Type</label>
              <select
                className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-orange-500 focus:outline-none"
                value={formData.issue_type}
                onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
              >
                {['Display Problem', 'Battery Problem', 'Charging Problem', 'Software Issue', 'Water Damage', 'Other'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Description (Optional)</label>
              <textarea
                className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-orange-500 focus:outline-none"
                rows={3}
                value={formData.issue_description}
                onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Estimated Service Cost</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  required
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-gray-900">
            <Camera className="h-5 w-5 text-orange-600" />
            Photos
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <PhotoUpload 
              label="Customer Photo" 
              onFile={(file) => setPhotos({ ...photos, customer: file })} 
            />
            <PhotoUpload 
              label="Device Front" 
              onFile={(file) => setPhotos({ ...photos, front: file })} 
            />
            <PhotoUpload 
              label="Device Back" 
              onFile={(file) => setPhotos({ ...photos, back: file })} 
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-orange-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-orange-700 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? 'Registering Service...' : 'Confirm & Register Service'}
        </button>
      </form>
    </div>
  );
}

function PhotoUpload({ label, onFile }) {
  const [preview, setPreview] = useState(null);
  const [objectUrl, setObjectUrl] = useState('');
  const inputId = `photo-upload-${label.replace(/\s+/g, '-').toLowerCase()}`;

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      onFile(file);
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      setPreview(url);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-gray-500 uppercase">{label}</label>
      <div className="relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-orange-300">
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            <button 
              type="button"
              onClick={() => {
                if (objectUrl) {
                  URL.revokeObjectURL(objectUrl);
                  setObjectUrl('');
                }
                setPreview(null);
                onFile(null);
              }}
              className="absolute bottom-2 right-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 rotate-45" />
            </button>
          </>
        ) : (
          <label 
            htmlFor={inputId}
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-gray-400"
          >
            <Camera className="h-8 w-8" />
            <span className="text-[10px] font-bold uppercase">Capture</span>
            <input 
              id={inputId}
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleChange} 
            />
          </label>
        )}
      </div>
    </div>
  );
}

function ServiceDetails({ service, onBack, onUpdate }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showReturn, setShowReturn] = useState(false);
  const [finalAmount, setFinalAmount] = useState(service.estimated_cost.toString());
  const [statusReason, setStatusReason] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(service.status);
  const [previewIndex, setPreviewIndex] = useState(null);
  const isFinalStatus = service.status === 'Completed' || service.status === 'Not Repairable';

  const photoList = [
    service.customer_photo_url,
    service.device_front_photo_url,
    service.device_back_photo_url,
  ].filter(Boolean);

  useEffect(() => {
    fetchHistory();
  }, [service.id]);

  async function fetchHistory() {
    try {
      const data = await serviceService.getServiceHistory(service.id);
      setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  }

  async function updateStatus() {
    try {
      setLoading(true);
      await serviceService.updateStatus(service.id, selectedStatus, profile?.id, statusReason);
      toast.success(`Status updated to ${selectedStatus}`);
      setStatusReason('');
      onUpdate(); // This will update the selectedService via fetchServices
      // Don't call onBack() - let user see the updated status and go back manually
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReturn() {
    try {
      setLoading(true);
      await serviceService.returnService(service.id, finalAmount, profile?.id);
      toast.success('Mobile returned successfully');
      onUpdate();
      onBack();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
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
          {/* Main Info */}
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Mobile" value={service.customer_mobile} icon={Smartphone} />
              <InfoItem label="Area" value={service.customer_address || 'N/A'} icon={MapPin} />
              <InfoItem label="Device" value={`${service.device_brand} ${service.device_model}`} icon={Smartphone} />
              <InfoItem label="Estimated Cost" value={formatCurrency(service.estimated_cost)} icon={IndianRupee} />
            </div>
            <div className="border-t pt-4">
              <p className="text-xs font-bold text-gray-400 uppercase">Issue</p>
              <p className="mt-1 font-bold text-gray-900">{service.issue_type}</p>
              {service.issue_description && (
                <p className="mt-2 text-sm text-gray-600">{service.issue_description}</p>
              )}
            </div>
          </div>

          {/* Photos */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-gray-900">Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {service.customer_photo_url ? (
                <button
                  type="button"
                  onClick={() => setPreviewIndex(photoList.indexOf(service.customer_photo_url))}
                  className="overflow-hidden rounded-lg border border-gray-200 transition hover:shadow-lg"
                >
                  <img
                    src={service.customer_photo_url}
                    alt="Customer Photo"
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ) : (
                <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center text-[10px] text-gray-400">
                  No Photo
                </div>
              )}

              {service.device_front_photo_url ? (
                <button
                  type="button"
                  onClick={() => setPreviewIndex(photoList.indexOf(service.device_front_photo_url))}
                  className="overflow-hidden rounded-lg border border-gray-200 transition hover:shadow-lg"
                >
                  <img
                    src={service.device_front_photo_url}
                    alt="Device Front"
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ) : (
                <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center text-[10px] text-gray-400">
                  No Front
                </div>
              )}

              {service.device_back_photo_url ? (
                <button
                  type="button"
                  onClick={() => setPreviewIndex(photoList.indexOf(service.device_back_photo_url))}
                  className="overflow-hidden rounded-lg border border-gray-200 transition hover:shadow-lg"
                >
                  <img
                    src={service.device_back_photo_url}
                    alt="Device Back"
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ) : (
                <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center text-[10px] text-gray-400">
                  No Back
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Update */}
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900">Update Status</h3>
            <select
              className={cn(
                "w-full rounded-lg border border-gray-200 p-2.5 focus:border-orange-500 focus:outline-none",
                isFinalStatus && "bg-gray-100 text-gray-500 cursor-not-allowed"
              )}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={loading || isFinalStatus}
            >
              {['Received', 'In Progress', 'Waiting for Parts', 'Completed', 'Not Repairable'].map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {(selectedStatus === 'Waiting for Parts' || selectedStatus === 'Not Repairable') && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Reason / Details (Optional)</label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-orange-500 focus:outline-none"
                  rows={2}
                  placeholder="Enter details..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                />
              </div>
            )}

            <button
              onClick={updateStatus}
              disabled={loading || selectedStatus === service.status || isFinalStatus}
              className="w-full rounded-xl bg-gray-900 py-2.5 font-bold text-white transition-all hover:bg-black disabled:opacity-50"
            >
              Update Status
            </button>
          </div>

          {/* Status History */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-gray-900">Status History</h3>
            <div className="space-y-4">
              {history.map((h, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-orange-100 last:border-0 pb-4">
                  <div className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-orange-500" />
                  <p className="text-sm font-bold text-gray-900">{h.status}</p>
                  {h.reason && <p className="text-xs text-blue-600 font-medium mt-0.5 italic">"{h.reason}"</p>}
                  <p className="text-xs text-gray-500">by {h.profiles?.full_name}</p>
                  <p className="text-[10px] text-gray-400">{new Date(h.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Return Button */}
          <button
            onClick={() => setShowReturn(true)}
            disabled={service.status !== 'Completed' && service.status !== 'Not Repairable'}
            className={cn(
              "w-full rounded-2xl py-4 font-bold text-white shadow-lg transition-all active:scale-[0.98]",
              service.status === 'Completed' || service.status === 'Not Repairable'
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-gray-400 cursor-not-allowed"
            )}
          >
            Return Mobile
          </button>
        </div>
      </div>

      {/* Return Modal */}
      {showReturn && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Confirm Return</h3>
            <p className="mt-2 text-sm text-gray-500">Verify customer details and enter final amount.</p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                {service.customer_photo_url && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(service.customer_photo_url)}
                    className="h-12 w-12 overflow-hidden rounded-full border border-gray-200 p-0 transition hover:shadow-lg"
                  >
                    <img src={service.customer_photo_url} className="h-full w-full object-cover" />
                  </button>
                )}
                <div>
                  <p className="font-bold text-gray-900">{service.customer_name}</p>
                  <p className="text-xs text-gray-500">{service.device_brand} {service.device_model}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Final Collected Amount</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 focus:border-orange-500 focus:outline-none"
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowReturn(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                disabled={loading}
                className="flex-1 rounded-xl bg-orange-600 py-3 font-bold text-white hover:bg-orange-700 disabled:opacity-50"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      {previewIndex !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
          {/* Close Button */}
          <button
            onClick={() => setPreviewIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white text-xl"
            aria-label="Close image preview"
          >
            ×
          </button>

          {/* Left Arrow */}
          {photoList.length > 1 && (
            <button
              onClick={() =>
                setPreviewIndex((prev) => (prev === 0 ? photoList.length - 1 : prev - 1))
              }
              className="absolute left-4 rounded-full bg-black/50 p-3 text-white text-2xl"
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {/* Preview Image */}
          <img
            src={photoList[previewIndex]}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
          />

          {/* Right Arrow */}
          {photoList.length > 1 && (
            <button
              onClick={() =>
                setPreviewIndex((prev) => (prev === photoList.length - 1 ? 0 : prev + 1))
              }
              className="absolute right-4 rounded-full bg-black/50 p-3 text-white text-2xl"
              aria-label="Next image"
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-orange-50 p-2">
        <Icon className="h-4 w-4 text-orange-600" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
