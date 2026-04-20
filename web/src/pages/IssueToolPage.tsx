import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CheckCircle2, AlertCircle, PackageCheck, Clock, Timer, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
  id: string;
  serialNumber: string;
  condition: string;
  model: {
    name: string;
    marketValue: number;
  };
}

interface Order {
  id: string;
  renterEmail: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  reservedUntil: string;
  branchStartName: string;
  items: OrderItem[];
}

function CountdownTimer({ reservedUntil }: { reservedUntil: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const end = new Date(reservedUntil).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
      setIsExpired(false);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [reservedUntil]);

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono ${
      isExpired ? 'text-red-500' : 'text-emerald-600'
    }`}>
      <Timer className="w-3 h-3" />
      {timeLeft}
    </span>
  );
}

function ConditionBadge({ condition }: { condition: string }) {
  const colors: Record<string, string> = {
    NEW: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    USED: 'bg-amber-50 text-amber-700 border-amber-100',
    WORN: 'bg-orange-50 text-orange-700 border-orange-100',
    DAMAGED: 'bg-red-50 text-red-700 border-red-100',
    BROKEN: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
      colors[condition] || 'bg-neutral-50 text-neutral-600 border-neutral-100'
    }`}>
      {condition}
    </span>
  );
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

  const { data: pendingOrders, isLoading: isLoadingPending } = useQuery({
    queryKey: ['ready-to-issue'],
    queryFn: async () => {
      const res = await apiClient.get('/api/orders/ready-to-issue');
      return res.data as Order[];
    },
    refetchInterval: 30000,
  });

  const issueMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) return;
      await apiClient.post(`/api/orders/${id}/issue`, null, { params: { staffId: user.id } });
    },
    onSuccess: () => {
      refetch();
      toast.success('Order issued successfully!');
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['ready-to-issue'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message);
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchId(orderId);
  };

  const handleStartPickup = (id: string) => {
    setOrderId(id);
    setSearchId(id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
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

      {/* Pending Issues Section */}
      {!searchId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Pending Issues
            </p>
            {pendingOrders && pendingOrders.length > 0 && (
              <span className="bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </div>

          {isLoadingPending && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-neutral-50 border border-neutral-100 rounded-xl p-5 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                  <div className="h-8 bg-neutral-200 rounded w-full" />
                </div>
              ))}
            </div>
          )}

          {pendingOrders && pendingOrders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingOrders.map((po) => (
                <div 
                  key={po.id} 
                  className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 hover:border-neutral-400 hover:shadow-md transition-all group"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-800 truncate">{po.renterEmail}</p>
                      <p className="text-xs font-mono text-neutral-400 mt-0.5">{po.id.substring(0, 8)}...</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-100 flex-shrink-0 ml-2">
                      Reserved
                    </span>
                  </div>

                  {/* Tool items */}
                  {po.items && po.items.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {po.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2 py-1 px-2.5 bg-neutral-50 rounded-lg">
                          <span className="text-xs font-medium text-neutral-700 truncate">{item.model?.name || 'Unknown tool'}</span>
                          <ConditionBadge condition={item.condition} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timer + price row */}
                  <div className="flex items-center justify-between border-t border-neutral-100 pt-3 mt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold tracking-tight">₽{po.totalPrice?.toLocaleString()}</span>
                      {po.reservedUntil && <CountdownTimer reservedUntil={po.reservedUntil} />}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                      <Clock className="w-3 h-3" />
                      {po.createdAt ? new Date(po.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </div>

                  {/* Start Pickup button */}
                  <button
                    onClick={() => handleStartPickup(po.id)}
                    className="w-full mt-3 flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 active:scale-[0.98] transition-all"
                  >
                    <PackageCheck className="w-4 h-4" />
                    Start Pickup
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {pendingOrders && pendingOrders.length === 0 && !isLoadingPending && (
            <div className="text-center py-12 sm:py-16 bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl">
              <Inbox className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 font-medium text-sm">Очередь пуста</p>
              <p className="text-neutral-400 text-xs mt-1">
                Ожидайте новых бронирований в филиале {user?.branchName || 'вашем филиале'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search results */}
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
          
          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 uppercase font-medium tracking-wider">Renter Email</label>
                <p className="text-sm sm:text-base font-medium break-all">{order.renterEmail}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 uppercase font-medium tracking-wider">Total Price</label>
                <p className="text-sm sm:text-base font-semibold">RUB {order.totalPrice?.toLocaleString()}</p>
              </div>
            </div>

            {/* Items in the order */}
            {order.items && order.items.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs text-neutral-400 uppercase font-medium tracking-wider">Tools</label>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 py-2 px-3 bg-neutral-50 rounded-lg">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{item.model?.name || 'Unknown'}</p>
                      <p className="text-xs font-mono text-neutral-400">{item.serialNumber}</p>
                    </div>
                    <ConditionBadge condition={item.condition} />
                  </div>
                ))}
              </div>
            )}

            {/* Countdown */}
            {order.reservedUntil && order.status === 'RESERVED' && (
              <div className="flex items-center gap-2 py-2 px-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <Timer className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700">Time remaining:</span>
                <CountdownTimer reservedUntil={order.reservedUntil} />
              </div>
            )}
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
