import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Wrench, 
  AlertCircle,
  ArrowRight,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

interface EquipmentItem {
  id: string;
  serialNumber: string;
  model: { name: string; marketValue: number };
  condition: string;
}

interface Order {
  id: string;
  renterEmail: string;
  items: EquipmentItem[];
  status: string;
  plannedEndDate: string;
  totalPrice: number;
}

interface Branch {
  id: string;
  name: string;
  storageCapacity: number;
}

const ConditionBadge = ({ condition }: { condition: string }) => {
  const styles: any = {
    NEW: "bg-neutral-900 text-white",
    USED: "bg-neutral-200 text-neutral-700",
    WORN: "bg-amber-100 text-amber-700 border border-amber-200",
    DAMAGED: "bg-neutral-100 text-neutral-500"
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[condition] || "bg-neutral-100 text-neutral-600"}`}>
      {condition}
    </span>
  );
};

export default function ReturnsPage() {
  const [searchId, setSearchId] = useState('');
  const { user } = useAuth();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState(user?.branchId || '');
  const [itemConditions, setItemConditions] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: branches } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => {
        const { data } = await apiClient.get('/api/inventory/branches');
        return data;
    }
  });

  const { data: order, isLoading: isSearching, error: searchError } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId
  });

  const returnMutation = useMutation({
    mutationFn: async (payload: any) => {
      await apiClient.post(`/api/orders/${orderId}/return`, payload);
    },
    onSuccess: () => {
      toast.success('Tools successfully returned!');
      setOrderId(null);
      setSearchId('');
      setItemConditions({});
      setShowConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error processing return');
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) setOrderId(searchId);
  };

  const handleConfirm = () => {
    if (!selectedBranchId) return toast.error('Select target branch');
    
    const missingConditions = order?.items.some(item => !itemConditions[item.id]);
    if (missingConditions) return toast.error('Please set return condition for all items');
    
    setShowConfirm(true);
  };

  const finalizeReturn = () => {
    returnMutation.mutate({
      branchId: selectedBranchId,
      itemConditions
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-1">Tool Returns</h1>
        <p className="text-neutral-400">Validate condition and process equipment returns</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-neutral-100">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-black transition-colors" />
            <input 
              className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-100 focus:border-black rounded-xl outline-none transition-all font-medium" 
              placeholder="Enter Order ID (UUID)..."
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
            />
          </div>
          <button className="px-8 bg-black text-white rounded-xl font-medium hover:bg-neutral-800 active:scale-95 transition-all">
            Search
          </button>
        </form>
      </div>

      {searchError && !isSearching && (
        <div className="bg-neutral-50 border border-neutral-200 text-neutral-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-neutral-400 shrink-0" />
          <span>Order not found or search failed. Ensure the ID is a valid UUID.</span>
        </div>
      )}

      {isSearching && (
        <div className="py-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
            <p className="text-neutral-400">Searching order...</p>
        </div>
      )}
      
      {order && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold tracking-tight">Equipment Items</h2>
                <span className="text-xs bg-black text-white px-3 py-1.5 rounded-full font-medium">{order.status}</span>
              </div>

              <div className="space-y-3">
                {order?.items?.map(item => (
                  <div key={item.id} className="p-5 bg-neutral-50 rounded-xl flex justify-between items-center hover:bg-neutral-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-neutral-100">
                         <Wrench className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400 font-medium mb-0.5">{item.serialNumber}</p>
                        <p className="font-medium">{item.model.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                       <div className="hidden sm:block text-right">
                          <p className="text-xs text-neutral-400 mb-1">Current</p>
                          <ConditionBadge condition={item.condition} />
                       </div>
                       
                       <div className="hidden sm:block w-px h-8 bg-neutral-200" />

                       <div>
                          <p className="text-xs text-neutral-400 mb-2">Return Condition</p>
                          <div className="flex gap-1.5">
                             {['NEW', 'USED', 'WORN', 'DAMAGED'].map(c => (
                               <button
                                 key={c}
                                 type="button"
                                 onClick={() => setItemConditions(prev => ({...prev, [item.id]: c}))}
                                 className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                   itemConditions[item.id] === c 
                                     ? "bg-black border-black text-white" 
                                     : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
                                 }`}
                               >
                                 {c}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 space-y-6 sticky top-6">
               <h3 className="text-lg font-semibold tracking-tight">Return Details</h3>
               
               <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-2 text-xs font-medium uppercase tracking-wider">
                       <MapPin className="w-3 h-3" /> Target Branch
                    </div>
                    <select 
                      className="w-full bg-neutral-50 p-3 rounded-xl outline-none font-medium text-sm border border-neutral-100 focus:border-black transition-all appearance-none cursor-pointer"
                      value={selectedBranchId}
                      onChange={e => setSelectedBranchId(e.target.value)}
                    >
                       <option value="">Select branch...</option>
                       {branches?.map(b => (
                         <option key={b.id} value={b.id}>{b.name}</option>
                       ))}
                    </select>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-xl space-y-3 border border-neutral-100">
                     <div>
                        <p className="text-xs text-neutral-400 mb-0.5">Contractor</p>
                        <p className="font-medium text-sm break-all">{order?.renterEmail}</p>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-xs text-neutral-400 mb-0.5">Deadline</p>
                            <p className="font-medium text-sm">
                                {order?.plannedEndDate ? new Date(order.plannedEndDate).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 mb-0.5">Total Price</p>
                            <p className="font-semibold text-sm">{order?.totalPrice.toLocaleString()} RUB</p>
                        </div>
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleConfirm}
                  disabled={returnMutation.isPending}
                  className="w-full py-3.5 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-50"
                >
                  {returnMutation.isPending ? "Processing..." : (
                      <>Confirm Return <ArrowRight className="w-4 h-4" /></>
                  )}
               </button>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
               <div className="flex gap-3">
                  <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    System will automatically calculate any overdue penalties (1.5x rate) and condition fines (up to 50% MV).
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white max-w-md w-full rounded-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Confirm Return</h2>
                <p className="text-neutral-400 text-sm mt-1">This action cannot be undone</p>
              </div>
              <button 
                onClick={() => setShowConfirm(false)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-neutral-500 text-sm">You are confirming the return of tools to <span className="text-black font-medium">{branches?.find(b => b.id === selectedBranchId)?.name}</span>. This will:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-3 text-neutral-600">
                    <div className="w-1.5 h-1.5 bg-black rounded-full" /> Update item repository status
                </li>
                <li className="flex items-center gap-3 text-neutral-600">
                    <div className="w-1.5 h-1.5 bg-black rounded-full" /> Apply penalties based on condition
                </li>
                <li className="flex items-center gap-3 text-neutral-600">
                    <div className="w-1.5 h-1.5 bg-black rounded-full" /> Close active rental contract
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => setShowConfirm(false)}
                className="py-3 border border-neutral-200 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={finalizeReturn}
                disabled={returnMutation.isPending}
                className="py-3 bg-black text-white rounded-xl font-medium hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-50"
              >
                {returnMutation.isPending ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
