import { useQuery } from '@tanstack/react-query';
import { X, Clock, User, MessageSquare } from 'lucide-react';
import apiClient from '../api/apiClient';

interface HistoryEntry {
  timestamp: string;
  oldCondition: string;
  newCondition: string;
  staffName: string;
  comment: string;
}

interface ItemHistoryModalProps {
  itemId: string;
  itemName: string;
  onClose: () => void;
}

export default function ItemHistoryModal({ itemId, itemName, onClose }: ItemHistoryModalProps) {
  const { data: history, isLoading } = useQuery<HistoryEntry[]>({
    queryKey: ['item-history', itemId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/inventory/items/${itemId}/history`);
      return data;
    }
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <div className="bg-white max-w-2xl w-full rounded-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{itemName}</h2>
            <p className="text-neutral-400 text-sm">Condition Lifecycle History</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-neutral-50 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-8 relative before:absolute before:inset-0 before:left-[17px] before:w-px before:bg-neutral-100">
              {history.map((entry, idx) => (
                <div key={idx} className="relative pl-10">
                  <div className="absolute left-0 top-1 w-9 h-9 bg-white border border-neutral-200 rounded-full flex items-center justify-center z-10">
                    <Clock className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="bg-neutral-50 border border-neutral-100 p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-200 rounded uppercase tracking-wider">
                          {entry.oldCondition || 'NEW'}
                        </span>
                        <span className="text-neutral-300">→</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                           entry.newCondition === 'DAMAGED' || entry.newCondition === 'BROKEN' 
                           ? 'bg-red-100 text-red-600' 
                           : 'bg-black text-white'
                        }`}>
                          {entry.newCondition}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-400 font-medium">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <User className="w-4 h-4 opacity-40" />
                          <span className="font-medium">{entry.staffName}</span>
                       </div>
                    </div>

                    {entry.comment && (
                      <div className="flex gap-2 p-3 bg-white rounded-xl border border-neutral-100">
                        <MessageSquare className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-neutral-600 italic">"{entry.comment}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-neutral-300" />
              </div>
              <p className="text-neutral-400 font-medium">No history recorded for this item yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
