import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['order', searchId],
    queryFn: async () => {
      if (!searchId) return null;
      const res = await apiClient.get(`/api/orders/${searchId}`);
      return res.data as Order;
    },
    enabled: !!searchId,
  });

  const issueMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.userId) return;
      await apiClient.post(`/api/orders/${id}/issue`);
    },
    onSuccess: () => {
      refetch();
      toast.success('Order issued successfully!');
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Issue Tools</h1>
        <p className="text-muted-foreground">Search for a reserved order to issue tools to the renter.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-black transition-colors" />
          <input
            type="text"
            placeholder="Enter Order ID (UUID)..."
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-xl focus:border-black focus:ring-0 outline-none transition-all shadow-sm placeholder:text-slate-300 font-medium"
          />
        </div>
        <button 
          type="submit"
          className="bg-black text-white px-10 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 shadow-lg shadow-black/10"
          disabled={!orderId}
        >
          Search
        </button>
      </form>

      {isLoading && <div className="text-center py-12">Searching order...</div>}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>Order not found or search failed. Ensure the ID is a valid UUID.</span>
        </div>
      )}

      {order && (
        <div className="bg-white dark:bg-black border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b bg-muted/30">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Order Details</p>
                <h2 className="text-xl font-mono mt-1">{order.id}</h2>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                order.status === 'RESERVED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {order.status}
              </div>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase font-bold">Renter Email</label>
              <p className="text-lg font-medium">{order.renterEmail}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase font-bold">Total Price</label>
              <p className="text-lg font-bold">RUB {order.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-6 bg-muted/10 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Verified User (Check ID card)
            </div>
            
            <button
              onClick={() => issueMutation.mutate(order.id)}
              disabled={order.status !== 'RESERVED' || issueMutation.isPending}
              className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
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
