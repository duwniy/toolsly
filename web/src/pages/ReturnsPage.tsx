import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Wrench, 
  AlertCircle,
  ArrowRight,
  X,
  History,
  MessageSquare,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import ItemHistoryModal from '../components/ItemHistoryModal';
import { formatDate } from '../lib/date-utils';

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
  createdAt: string;
  plannedEndDate: string;
  actualEndDate?: string;
  totalPrice: number;
  staffComment?: string;
  isIncident?: boolean;
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
    DAMAGED: "bg-neutral-100 text-neutral-500",
    BROKEN: "bg-red-100 text-red-600"
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
  const [staffComment, setStaffComment] = useState('');
  const [isIncident, setIsIncident] = useState(false);
  const [historyItem, setHistoryItem] = useState<{id: string, name: string} | null>(null);
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

  const { data: recentReturns } = useQuery<Order[]>({
    queryKey: ['recent-returns', selectedBranchId],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/orders/returned', {
        params: { branchId: selectedBranchId }
      });
      return data;
    },
    enabled: !!selectedBranchId
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
      setStaffComment('');
      setIsIncident(false);
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-returns'] });
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
      itemConditions,
      staffComment,
      isIncident
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">Tool Returns</h1>
        <p className="text-neutral-400 text-sm sm:text-base">Validate condition and process equipment returns</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-black transition-colors" />
            <input 
              className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-neutral-50 border border-neutral-100 focus:border-black rounded-xl outline-none transition-all font-medium text-sm sm:text-base" 
              placeholder="Enter Order ID (UUID)..."
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
            />
          </div>
          <button className="px-6 sm:px-8 py-3 sm:py-0 bg-black text-white rounded-xl font-medium hover:bg-neutral-800 active:scale-95 transition-all">
            Search
          </button>
        </form>
      </div>

      {searchError && !isSearching && !recentReturns && (
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-semibold tracking-tight">Equipment Items</h2>
                <div className="flex items-center gap-2">
                   <span className="text-xs bg-black text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium">{order.status}</span>
                   <button onClick={() => setOrderId(null)} className="p-1.5 hover:bg-neutral-100 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="space-y-3">
                {order?.items?.map(item => (
                  <div key={item.id} className="p-3 sm:p-5 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center border border-neutral-100 flex-shrink-0">
                         <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs text-neutral-400 font-medium mb-0.5 truncate">{item.serialNumber}</p>
                        <div className="flex items-center gap-2">
                           <p className="font-medium text-sm sm:text-base truncate">{item.model.name}</p>
                           <button 
                             onClick={() => setHistoryItem({id: item.id, name: item.model.name})}
                             className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-black transition-colors flex-shrink-0"
                             title="View Item History"
                           >
                             <History className="w-3.5 h-3.5" />
                           </button>
                        </div>
                      </div>
                      <div className="hidden lg:block text-right flex-shrink-0">
                        <p className="text-xs text-neutral-400 mb-1">Current</p>
                        <ConditionBadge condition={item.condition} />
                      </div>
                    </div>
                    
                    <div className="lg:hidden flex items-center gap-2 mb-3">
                      <span className="text-xs text-neutral-400">Current:</span>
                      <ConditionBadge condition={item.condition} />
                    </div>
                    
                    <div className="sm:mt-3 lg:mt-0 lg:pt-3 lg:border-t lg:border-neutral-100">
                      <p className="text-xs text-neutral-400 mb-2">Return Condition</p>
                      <div className="flex flex-wrap gap-1.5">
                         {['NEW', 'USED', 'WORN', 'DAMAGED', 'BROKEN'].map(c => (
                           <button
                             key={c}
                             type="button"
                             onClick={() => setItemConditions(prev => ({...prev, [item.id]: c}))}
                             className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium border transition-all ${
                               itemConditions[item.id] === c 
                                 ? "bg-black border-black text-white shadow-sm" 
                                 : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
                             }`}
                           >
                             {c}
                           </button>
                         ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-100 space-y-4 sm:space-y-6 lg:sticky lg:top-6 shadow-sm">
               <h3 className="text-base sm:text-lg font-semibold tracking-tight border-b border-neutral-50 pb-3 sm:pb-4">Return Details</h3>
               
               <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-2 text-[10px] font-bold uppercase tracking-widest">
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

                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-2 text-[10px] font-bold uppercase tracking-widest">
                       <MessageSquare className="w-3 h-3" /> Staff Comment
                    </div>
                    <textarea 
                      placeholder="Add return notes (damages, usage notes)..."
                      className="w-full bg-neutral-50 p-3 rounded-xl outline-none font-medium text-sm border border-neutral-100 focus:border-black transition-all resize-none h-24"
                      value={staffComment}
                      onChange={e => setStaffComment(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-4 h-4 ${isIncident ? 'text-red-500' : 'text-neutral-300'}`} />
                      <span className="text-sm font-medium">Flag as Incident</span>
                    </div>
                    <button 
                      onClick={() => setIsIncident(!isIncident)}
                      className={`w-10 h-6 rounded-full transition-all relative ${isIncident ? 'bg-red-500' : 'bg-neutral-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isIncident ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>
               </div>

               <div className="p-4 bg-black text-white rounded-xl space-y-2">
                  <div className="flex justify-between text-xs opacity-60">
                    <span>Contractor</span>
                    <span>{order?.renterEmail}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Price</span>
                    <span>{order?.totalPrice.toLocaleString()} RUB</span>
                  </div>
               </div>

               <button 
                  onClick={handleConfirm}
                  disabled={returnMutation.isPending}
                  className="w-full py-3.5 bg-black text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-black/10"
                >
                  {returnMutation.isPending ? "Processing..." : (
                      <>Confirm Return <ArrowRight className="w-4 h-4" /></>
                  )}
               </button>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
               <div className="flex gap-3">
                  <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-neutral-500 leading-relaxed uppercase font-bold tracking-tight">
                    Penalties: Overdue (1.5x rate), Condition (Damaged: 30%, Broken: 50% MV).
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Returns List */}
      {!order && !isSearching && recentReturns && recentReturns.length > 0 && (
        <div className="space-y-4 pb-10 sm:pb-20 animate-in fade-in duration-700">
           <div className="flex items-center gap-2">
             <History className="w-5 h-5 text-neutral-400" />
             <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Recent Returns</h2>
           </div>
           
           {/* Mobile Cards View */}
           <div className="sm:hidden space-y-3">
             {recentReturns.map((ret) => (
               <div key={ret.id} className="bg-white border border-neutral-100 rounded-xl p-4 space-y-3">
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="text-sm font-medium">{ret.items[0]?.model?.name}</p>
                     {ret.items.length > 1 && <p className="text-[10px] text-neutral-400">+{ret.items.length - 1} more items</p>}
                   </div>
                   {ret.isIncident ? (
                     <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold">INCIDENT</span>
                   ) : (
                     <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded text-[10px] font-medium uppercase">Clean</span>
                   )}
                 </div>
                 <div className="flex justify-between items-center text-xs text-neutral-500">
                   <span>{ret.renterEmail}</span>
                   <span>{formatDate(ret.actualEndDate || ret.createdAt || ret.plannedEndDate)}</span>
                 </div>
                 <button 
                   onClick={() => setOrderId(ret.id)}
                   className="w-full py-2 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                 >
                   <FileText className="w-4 h-4" />
                   View Details
                 </button>
               </div>
             ))}
           </div>

           {/* Desktop Table View */}
           <div className="hidden sm:block bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-100">
                      <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Date</th>
                      <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Customer</th>
                      <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Equipment</th>
                      <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                      <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {recentReturns.map((ret) => (
                      <tr key={ret.id} className="hover:bg-neutral-50 transition-colors group">
                        <td className="px-4 lg:px-6 py-4">
                          <p className="text-sm font-medium">{formatDate(ret.actualEndDate || ret.createdAt || ret.plannedEndDate)}</p>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm font-medium">{ret.renterEmail}</td>
                        <td className="px-4 lg:px-6 py-4">
                          <p className="text-sm font-medium">{ret.items[0]?.model?.name}</p>
                          {ret.items.length > 1 && <p className="text-[10px] text-neutral-400">+{ret.items.length - 1} more items</p>}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center gap-2">
                             {ret.isIncident ? (
                               <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold">INCIDENT</span>
                             ) : (
                               <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded text-[10px] font-medium uppercase">Clean</span>
                             )}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-right">
                           <button 
                             onClick={() => setOrderId(ret.id)}
                             className="p-2 hover:bg-black hover:text-white rounded-lg transition-all"
                           >
                             <FileText className="w-4 h-4" />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 space-y-4 sm:space-y-6 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Confirm Return</h2>
                <p className="text-neutral-400 text-sm mt-1">This action will close the rental contract</p>
              </div>
              <button 
                onClick={() => setShowConfirm(false)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 p-3 sm:p-4 bg-neutral-50 rounded-xl">
              <p className="text-neutral-500 text-xs sm:text-sm italic break-all">{`"Customer: ${order?.renterEmail}"`}</p>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-center gap-3 text-neutral-600">
                    <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0" /> Update item repository status
                </li>
                <li className="flex items-center gap-3 text-neutral-600">
                    <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0" /> Apply penalties based on condition
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => setShowConfirm(false)}
                className="py-2.5 sm:py-3 border border-neutral-200 rounded-xl font-medium hover:bg-neutral-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={finalizeReturn}
                disabled={returnMutation.isPending}
                className="py-2.5 sm:py-3 bg-black text-white rounded-xl font-medium hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-50 text-sm sm:text-base"
              >
                {returnMutation.isPending ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item History Modal */}
      {historyItem && (
        <ItemHistoryModal 
          itemId={historyItem.id}
          itemName={historyItem.name}
          onClose={() => setHistoryItem(null)}
        />
      )}
    </div>
  );
}
