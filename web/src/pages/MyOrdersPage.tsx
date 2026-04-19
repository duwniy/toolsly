import { useState, useEffect } from 'react';
import { Clock, Loader2, Package } from 'lucide-react';
import apiClient from '../api/apiClient';
import { toast } from 'sonner';
import { formatDate } from '../lib/date-utils';

interface Order {
  id: string;
  items: Array<{
    id: string;
    model?: { name: string };
    serialNumber: string;
  }>;
  status: 'RESERVED' | 'ISSUED' | 'RETURN_PENDING' | 'RETURNED' | 'CLOSED' | 'CANCELLED';
  totalPrice: number;
  currentAccruedPrice: number | null;
  plannedEndDate: string;
  actualEndDate?: string;
  createdAt: string;
  issuedAt: string | null;
  reservedUntil: string | null;
  targetBranchName?: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get('/api/orders/my');
        setOrders(data);
      } catch (err) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const activeOrders = orders.filter(o => {
    const s = o.status?.toUpperCase();
    return s === 'RESERVED' || s === 'ISSUED' || s === 'RETURN_PENDING';
  });
  
  const historyOrders = orders.filter(o => {
    const s = o.status?.toUpperCase();
    return s === 'RETURNED' || s === 'CLOSED' || s === 'CANCELLED';
  });

  const displayedOrders = activeTab === 'active' ? activeOrders : historyOrders;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">My Orders</h1>
        <p className="text-neutral-500 mt-1 text-sm sm:text-base">Manage your active rentals and order history.</p>
      </div>

      <div className="flex bg-neutral-100 p-1 rounded-xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'active' 
              ? 'bg-white text-neutral-900 shadow-sm' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'history' 
              ? 'bg-white text-neutral-900 shadow-sm' 
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          History
        </button>
      </div>

      <div className="space-y-4">
        {displayedOrders.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
            <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No {activeTab} orders found</p>
          </div>
        ) : (
          displayedOrders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onUpdate={() => {
                // Refresh orders after action
                apiClient.get('/api/orders/my').then(({ data }) => setOrders(data));
              }} 
            />
          ))
        )}
      </div>
    </div>
  );
}

function renderDate(dateStr: string | undefined) {
  return formatDate(dateStr);
}

function OrderCard({ order, onUpdate }: { order: Order; onUpdate: () => void }) {
  const [requestingReturn, setRequestingReturn] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showBranchSelect, setShowBranchSelect] = useState(false);
  const status = order.status?.toUpperCase();

  const handleInitiateReturn = async (branchId: string) => {
    setRequestingReturn(true);
    try {
      await apiClient.patch(`/api/orders/${order.id}/request-return?targetBranchId=${branchId}`);
      toast.success('Return requested successfully!');
      setShowBranchSelect(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request return');
    } finally {
      setRequestingReturn(false);
    }
  };

  const fetchBranches = async () => {
    if (branches.length > 0) {
      setShowBranchSelect(true);
      return;
    }
    try {
      const { data } = await apiClient.get('/api/branches');
      setBranches(data);
      setShowBranchSelect(true);
    } catch (err) {
      toast.error('Failed to load branches');
    }
  };
  
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                status === 'RESERVED' ? 'bg-amber-100 text-amber-700' :
                status === 'ISSUED' ? 'bg-blue-100 text-blue-700' :
                status === 'RETURN_PENDING' ? 'bg-purple-100 text-purple-700' :
                'bg-neutral-100 text-neutral-600'
              }`}>
                {status.replace('_', ' ')}
              </span>
              <span className="text-xs sm:text-sm font-medium text-neutral-500">#{order.id.substring(0, 8)}</span>
            </div>
            <h3 className="text-base sm:text-lg font-medium mt-1">
              {order.items.map((i, idx) => i.model?.name || `Item ${idx+1}`).join(', ')}
            </h3>
          </div>
          <div className="sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
            <p className="text-xs sm:text-sm text-neutral-500">{status === 'ISSUED' ? 'Accrued Cost' : 'Price'}</p>
            <p className={`text-lg sm:text-xl font-semibold ${status === 'ISSUED' ? 'text-blue-600' : ''}`}>
              {status === 'ISSUED' && order.currentAccruedPrice !== null ? (
                <AccruedCostCounter initialValue={order.currentAccruedPrice} issuedAt={order.issuedAt!} />
              ) : (
                `RUB ${(order.totalPrice || 0).toLocaleString()}`
              )}
            </p>
          </div>
        </div>

        {status === 'RESERVED' && order.reservedUntil && (
          <div className="mb-4 bg-amber-50 p-3 rounded-xl border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
              <Clock className="w-4 h-4" />
              Reservation expires in:
            </div>
            <CountdownTimer reservedUntil={order.reservedUntil} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:gap-8 pt-4 border-t border-neutral-100">
          <div>
            <p className="text-[10px] sm:text-xs text-neutral-400 uppercase font-bold tracking-widest mb-1">Rented On</p>
            <p className="text-xs sm:text-sm font-medium">{renderDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-neutral-400 uppercase font-bold tracking-widest mb-1">Return Due</p>
            <p className="text-xs sm:text-sm font-medium">{renderDate(order.plannedEndDate)}</p>
          </div>
        </div>

        {status === 'ISSUED' && (
          <div className="mt-4 sm:mt-6">
            {!showBranchSelect ? (
              <button 
                onClick={fetchBranches}
                className="w-full py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
              >
                Initiate Return
              </button>
            ) : (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Select Return Branch</p>
                <div className="grid grid-cols-1 gap-2">
                  {branches.map(branch => (
                    <button
                      key={branch.id}
                      onClick={() => handleInitiateReturn(branch.id)}
                      disabled={requestingReturn}
                      className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-100 rounded-xl hover:border-neutral-300 transition-all text-sm group"
                    >
                      <span className="font-medium">{branch.name}</span>
                      {requestingReturn ? (
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-neutral-300 group-hover:text-black transition-colors" />
                      )}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setShowBranchSelect(false)}
                  className="w-full py-2 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {status === 'RETURN_PENDING' && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-3">
            <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">Return Pending</p>
              <p className="text-xs sm:text-sm text-purple-700 mt-0.5">
                Drop off items at <strong className="text-purple-900">{order.targetBranchName}</strong>. 
                Staff will inspect conditions and finalize the order.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CountdownTimer({ reservedUntil }: { reservedUntil: string }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expires = new Date(reservedUntil).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, expires - now);
      return Math.floor(diff / 1000);
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [reservedUntil]);

  if (timeLeft <= 0) return <span className="text-amber-800 font-bold">Expired</span>;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <span className="text-amber-800 font-mono font-bold">
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}

function AccruedCostCounter({ initialValue }: { initialValue: number, issuedAt: string }) {
  const [currentValue, setCurrentValue] = useState(initialValue);

  useEffect(() => {
    // We don't know the exact hourly rate from here, but we can simulate the "tick"
    // to make it feel alive. Real precision comes from refresh or backend.
    // Assuming a tool costs ~500-2000 RUB/day, that's ~0.005-0.02 RUB per second.
    const interval = setInterval(() => {
      setCurrentValue(prev => prev + 0.01); // Subtle tick for visual effect
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <span>RUB {currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
}
