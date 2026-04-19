import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CheckCircle2, AlertCircle, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

interface Order {
  id: string;
  renterEmail: string;
  status: string;
  totalPrice: number;
}

export default function IssueToolPage() {
  const [orderId, setOrderId] = useState('');
  const [searchId, setSearchId] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['order', searchId],
    queryFn: async () => {
      if (!searchId) return null;
      const res = await apiClient.get(`/api/orders/${searchId}`);
      return res.data as Order;
    },
    enabled: !!searchId,
  });

  const { data: reservedOrders, isLoading: isLoadingReserved } = useQuery({
    queryKey: ['reserved-orders', user?.branchId],
    queryFn: async () => {
      if (!user?.branchId) return [];
      const res = await apiClient.get(`/api/orders/reserved?branchId=${user.branchId}`);
      return res.data as Order[];
    },
    enabled: !!user?.branchId,
  });

  const issueMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) return;
      await apiClient.post(`/api/orders/${id}/issue`);
    },
    onSuccess: () => {
      refetch();
      toast.success('Order issued successfully!');
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message);
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchId(orderId);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Issue Tools</h1>
        <p className="text-neutral-400 text-sm sm:text-base">Search for a reserved order to issue tools to the renter.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-black transition-colors" />
          <input
            type="text"
            placeholder="Enter Order ID (UUID)..."
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white border border-neutral-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-all font-medium text-sm sm:text-base"
          />
        </div>
        <button 
          type="submit"
          className="bg-black text-white px-6 sm:px-8 py-3 sm:py-0 rounded-xl font-medium hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-black"
          disabled={!orderId}
        >
          Search
        </button>
      </form>

      {reservedOrders && reservedOrders.length > 0 && !searchId && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Recent Reservations in this Branch
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reservedOrders.map((ro) => (
              <div 
                key={ro.id} 
                className="p-4 bg-white border border-neutral-200 rounded-xl hover:border-black transition-all cursor-pointer group flex flex-col justify-between min-h-[100px] shadow-sm hover:shadow-md" 
                onClick={() => {
                  setOrderId(ro.id);
                  setSearchId(ro.id);
                }}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-mono text-neutral-500">{ro.id.substring(0, 8)}...</p>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                      Reserved
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate text-neutral-800">{ro.renterEmail}</p>
                </div>
                <div className="flex justify-between items-end mt-3 border-t border-neutral-50 pt-3">
                  <span className="text-sm font-semibold tracking-tight">₽{ro.totalPrice.toLocaleString()}</span>
                  <span className="text-blue-600 text-sm font-medium group-hover:translate-x-0.5 transition-transform">Issue &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoadingReserved && !searchId && (
        <div className="flex gap-4 opacity-50 py-4">
          <div className="animate-pulse w-full h-24 bg-neutral-100 rounded-xl" />
          <div className="animate-pulse w-full h-24 bg-neutral-100 rounded-xl hidden sm:block" />
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12 text-neutral-400">Searching order...</div>
      )}

      {error && (
        <div className="bg-neutral-50 border border-neutral-200 text-neutral-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-neutral-400" />
          <span>Order not found or search failed. Ensure the ID is a valid UUID.</span>
        </div>
      )}

      {order && (
        <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-neutral-100 bg-neutral-50">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-1">Order Details</p>
                <h2 className="text-sm sm:text-lg font-mono truncate">{order.id}</h2>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium self-start ${
                order.status === 'RESERVED' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'
              }`}>
                {order.status}
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 uppercase font-medium tracking-wider">Renter Email</label>
              <p className="text-sm sm:text-base font-medium break-all">{order.renterEmail}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-neutral-400 uppercase font-medium tracking-wider">Total Price</label>
              <p className="text-sm sm:text-base font-semibold">RUB {order.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <CheckCircle2 className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <span>Verified User (Check ID card)</span>
            </div>
            
            <button
              onClick={() => issueMutation.mutate(order.id)}
              disabled={order.status !== 'RESERVED' || issueMutation.isPending}
              className="flex items-center justify-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-50 disabled:hover:bg-black w-full sm:w-auto"
            >
              <PackageCheck className="w-5 h-5" />
              {issueMutation.isPending ? 'Issuing...' : 'Complete Issuance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
