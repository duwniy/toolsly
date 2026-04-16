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
    NEW: "bg-emerald-50 text-emerald-700 border-emerald-100",
    USED: "bg-blue-50 text-blue-700 border-blue-100",
    DAMAGED: "bg-rose-50 text-rose-700 border-rose-100"
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${styles[condition] || "bg-slate-50 text-slate-700 border-slate-100"}`}>
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
    
    // Check if all items have conditions set
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
        <h1 className="text-4xl font-black tracking-tighter italic uppercase underline decoration-black/10 transition-all hover:decoration-black">TOOL RETURN</h1>
        <p className="text-slate-400 font-medium italic">Validate condition and storage capacity</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 z-0" />
        <form onSubmit={handleSearch} className="flex gap-4 relative z-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-black rounded-2xl outline-none transition-all font-bold tracking-tight text-lg" 
              placeholder="ENTER ORDER ID (UUID)..."
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
            />
          </div>
          <button className="px-8 bg-black text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 italic">
            FIND ORDER
          </button>
        </form>
      </div>

      {searchError && !isSearching && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl flex items-center gap-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-bold text-sm italic uppercase tracking-tight">Order not found or search failed. Ensure the ID is a valid UUID.</span>
        </div>
      )}

      {isSearching && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-black rounded-full animate-spin" />
            <p className="font-black italic text-slate-300 text-2xl uppercase tracking-tighter">AUTHENTICATING ORDER...</p>
        </div>
      )}
      
      {order && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-bl-full -mr-16 -mt-16 z-0 transition-all group-hover:scale-110" />
               <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black tracking-tighter italic">EQUIPMENT BATCH</h2>
                    <span className="text-[10px] bg-black text-white px-4 py-1.5 rounded-full font-black uppercase tracking-widest ring-4 ring-black/5">{order.status}</span>
                </div>

                <div className="space-y-4">
                  {order?.items?.map(item => (
                    <div key={item.id} className="p-6 bg-slate-50 rounded-2xl flex justify-between items-center group/item hover:bg-white border-2 border-transparent hover:border-black/5 hover:shadow-xl hover:shadow-black/5 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover/item:scale-110 transition-transform">
                           <Wrench className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{item.serialNumber}</p>
                          <p className="font-black text-lg tracking-tight">{item.model.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                         <div className="hidden sm:block">
                            <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase text-right">CURRENT</p>
                            <div className="text-right">
                                <ConditionBadge condition={item.condition} />
                            </div>
                         </div>
                         
                         <div className="hidden sm:block w-px h-10 bg-slate-200" />

                         <div>
                            <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">RETURN CONDITION</p>
                            <div className="flex gap-2">
                               {['NEW', 'USED', 'DAMAGED'].map(c => (
                                 <button
                                   key={c}
                                   type="button"
                                   onClick={() => setItemConditions(prev => ({...prev, [item.id]: c}))}
                                   className={`px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all ${
                                     itemConditions[item.id] === c 
                                       ? "bg-black border-black text-white scale-110 shadow-lg shadow-black/20" 
                                       : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
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
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8 sticky top-8">
               <h3 className="text-xl font-black italic tracking-tighter uppercase underline decoration-black/5 decoration-4 underline-offset-4">LOGISTICS PARAMS</h3>
               
               <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-2 font-black uppercase text-[10px] tracking-widest">
                       <MapPin className="w-3 h-3" /> RETURN TARGET BRANCH
                    </div>
                    <select 
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold italic text-sm border-2 border-transparent focus:border-black transition-all appearance-none cursor-pointer"
                      value={selectedBranchId}
                      onChange={e => setSelectedBranchId(e.target.value)}
                    >
                       <option value="">SELECT BRANCH...</option>
                       {branches?.map(b => (
                         <option key={b.id} value={b.id}>{b.name}</option>
                       ))}
                    </select>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">CONTRACTOR</p>
                        <p className="font-black text-xl tracking-tight italic break-all">{order?.renterEmail}</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 text-xs">DEADLINE</p>
                            <p className="font-bold tracking-tight text-slate-900 italic text-xs">
                                {order?.plannedEndDate ? new Date(order.plannedEndDate).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 text-xs">BASE PRICE</p>
                            <p className="font-black tracking-tight text-black text-xs">{order?.totalPrice.toLocaleString()} ₸</p>
                        </div>
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleConfirm}
                  disabled={returnMutation.isPending}
                  className="group relative w-full overflow-hidden"
                >
                  <div className="absolute inset-0 bg-black transition-all group-hover:bg-slate-900 rounded-2xl" />
                  <div className="relative py-5 text-white font-black italic text-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                    {returnMutation.isPending ? "INTERNAL API CALL..." : (
                        <>CONFIRM RECEIPT <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </div>
               </button>
            </div>

            <div className="bg-amber-50/50 p-6 rounded-2xl border border-dashed border-amber-200">
               <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-[10px] font-bold text-amber-800 leading-relaxed italic uppercase">
                    SYSTEM WILL AUTOMATICALLY CALCULATE ANY OVERDUE PENALTIES (1.5X RATE) AND CONDITION FINES (UP TO 50% MV).
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 grayscale-0">
          <div className="bg-white max-w-lg w-full rounded-[2.5rem] p-10 space-y-8 animate-in zoom-in-95 duration-200 shadow-[0_0_100px_rgba(255,255,255,0.1)]">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-black tracking-tighter italic uppercase leading-tight">FINALIZE<br/>RETURN?</h2>
                <div className="w-12 h-2 bg-black mt-4" />
              </div>
              <button 
                onClick={() => setShowConfirm(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="font-medium text-slate-500 italic">You are confirming the return of tools to <span className="text-black font-black uppercase underline">{branches?.find(b => b.id === selectedBranchId)?.name}</span>. This action will:</p>
              <ul className="space-y-3 font-black text-sm uppercase italic tracking-tight">
                <li className="flex items-center gap-3 text-emerald-600">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full" /> Update item repository status
                </li>
                <li className="flex items-center gap-3 text-rose-600">
                    <div className="w-2 h-2 bg-rose-600 rounded-full" /> Apply penalties based on condition
                </li>
                <li className="flex items-center gap-3 text-slate-900">
                    <div className="w-2 h-2 bg-black rounded-full" /> Close active rental contract
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button 
                onClick={() => setShowConfirm(false)}
                className="py-5 border-2 border-slate-100 rounded-2xl font-black uppercase italic hover:bg-slate-50 transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={finalizeReturn}
                disabled={returnMutation.isPending}
                className="py-5 bg-black text-white rounded-2xl font-black uppercase italic shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all"
              >
                {returnMutation.isPending ? "SYSTEM CALL..." : "CONFIRM"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
