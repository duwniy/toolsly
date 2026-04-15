import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, 
  MapPin, 
  Wrench, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface EquipmentItem {
  id: string;
  serialNumber: string;
  model: { name: string };
  condition: string;
}

interface Order {
  id: string;
  renter: { name: string };
  items: EquipmentItem[];
  status: string;
  plannedEndDate: string;
  branchStart: { name: string };
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
  const [orderId, setOrderId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [itemConditions, setItemConditions] = useState<Record<string, string>>({});
  
  const queryClient = useQueryClient();

  // In a real app, you'd fetch the current staff's branch list
  const { data: branches } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => [
      { id: 'b1', name: 'Almaty Main Central', storageCapacity: 100 },
      { id: 'b2', name: 'Almaty North Hub', storageCapacity: 50 },
    ]
  });

  const { data: order, isLoading: isSearching } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId
  });

  const returnMutation = useMutation({
    mutationFn: async (payload: any) => {
      await axios.post(`/api/orders/${orderId}/return`, payload);
    },
    onSuccess: () => {
      alert('Tools successfully returned!');
      setOrderId(null);
      setSearchId('');
      setItemConditions({});
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Error processing return');
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) setOrderId(searchId);
  };

  const handleReturn = () => {
    if (!selectedBranchId) return alert('Select target branch');
    returnMutation.mutate({
      branchId: selectedBranchId,
      itemConditions
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter italic uppercase">TOOL RETURN</h1>
        <p className="text-slate-400 font-medium italic">Validate condition and storage capacity</p>
      </div>

      {/* Search Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
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

      {isSearching && <div className="text-center font-black italic animate-pulse py-20 text-slate-300 text-4xl">SEARCHING...</div>}
      
      {order && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-16 -mt-16 z-0" />
               <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black tracking-tighter italic">EQUIPMENT BATCH</h2>
                    <span className="text-xs bg-black text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest">{order.status}</span>
                </div>

                <div className="space-y-4">
                  {order?.items?.map(item => (
                    <div key={item.id} className="p-6 bg-slate-50 rounded-2xl flex justify-between items-center group hover:bg-white border-2 border-transparent hover:border-black transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                           <Wrench className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{item.serialNumber}</p>
                          <p className="font-black text-lg tracking-tight">{item.model.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase text-right">CURRENT STATUS</p>
                            <div className="text-right">
                                <ConditionBadge condition={item.condition} />
                            </div>
                         </div>
                         
                         <div className="w-px h-10 bg-slate-200" />

                         <div>
                            <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">SET RETURN CONDITION</p>
                            <div className="flex gap-2">
                               {['NEW', 'USED', 'DAMAGED'].map(c => (
                                 <button
                                   key={c}
                                   onClick={() => setItemConditions(prev => ({...prev, [item.id]: c}))}
                                   className={`px-3 py-1 rounded-lg text-[10px] font-black border-2 transition-all ${
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
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
               <h3 className="text-xl font-black italic tracking-tighter uppercase">RETURN DETAILS</h3>
               
               <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-2 font-bold uppercase text-[10px] tracking-widest">
                       <MapPin className="w-3 h-3" /> TARGET BRANCH
                    </div>
                    <select 
                      className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold italic text-sm border-2 border-transparent focus:border-black"
                      value={selectedBranchId}
                      onChange={e => setSelectedBranchId(e.target.value)}
                    >
                       <option value="">SELECT BRANCH...</option>
                       {branches?.map(b => (
                         <option key={b.id} value={b.id}>{b.name} (Cap: {b.storageCapacity})</option>
                       ))}
                    </select>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Renter</p>
                        <p className="font-black text-xl tracking-tight">{order?.renter?.name}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Original Issue Branch</p>
                        <p className="font-black tracking-tight">{order?.branchStart?.name}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Expected Return</p>
                        <p className="font-bold tracking-tight text-slate-600 italic">{order?.plannedEndDate ? new Date(order.plannedEndDate).toLocaleDateString() : 'N/A'}</p>
                     </div>
                  </div>
               </div>

               <button 
                  onClick={handleReturn}
                  disabled={returnMutation.isPending}
                  className="w-full py-5 bg-black text-white rounded-2xl font-black italic text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20 disabled:bg-slate-300"
                >
                  {returnMutation.isPending ? "PROCESSING..." : (
                    <>CONFIRM RETURN <ArrowRight className="w-6 h-6" /></>
                  )}
               </button>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
               <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
                    SYSTEM WILL AUTOMATICALLY CALCULATE ANY OVERDUE PENALTIES AND UPDATE EQUIPMENT REPOSITORY UPON CONFIRMATION.
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
