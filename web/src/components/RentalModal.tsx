import { useState, useEffect } from 'react';
import { X, Calendar, Info, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '../api/apiClient';

interface PriceQuote {
  basePrice: number;
  markupAmount: number;
  discountAmount: number;
  totalPrice: number;
  markupReasons: string[];
  discountReasons: string[];
}

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    modelId: string;
    modelName: string;
    branchId: string;
    branchName: string;
    categoryName: string;
    dailyRate: number;
  };
}

export default function RentalModal({ isOpen, onClose, item }: RentalModalProps) {
  const [endDate, setEndDate] = useState('');
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [booking, setBooking] = useState(false);

  // Default end date: tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setEndDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Fetch quote when end date changes
  useEffect(() => {
    if (!endDate || !item.modelId) return;

    const fetchQuote = async () => {
      setLoadingQuote(true);
      try {
        const { data } = await apiClient.post('/api/orders/calculate-quote', {
          modelId: item.modelId,
          startDate: new Date().toISOString(),
          endDate: new Date(endDate).toISOString()
        });
        setQuote(data);
      } catch (err) {
        console.error('Failed to fetch quote', err);
        toast.error('Could not calculate price breakdown');
      } finally {
        setLoadingQuote(false);
      }
    };

    fetchQuote();
  }, [endDate, item.modelId]);

  const handleBooking = async () => {
    setBooking(true);
    try {
      const { data } = await apiClient.post('/api/orders/wizard-reserve', {
        modelId: item.modelId,
        branchId: item.branchId,
        endDate: new Date(endDate).toISOString()
      });
      toast.success(`Reserved successfully! Order #${data.id.substring(0, 8)}`);
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to reserve item';
      toast.error(errorMsg);
    } finally {
      setBooking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative p-8 bg-slate-50 border-b border-slate-100">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 p-2 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Booking
          </div>
          
          <h2 className="text-3xl font-black tracking-tighter italic uppercase">{item.modelName}</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-tight">{item.categoryName} • {item.branchName}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Start Date
              </label>
              <div className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 font-medium text-sm">
                Today (Now)
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> End Date
              </label>
              <input 
                type="date"
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-black outline-none transition-all font-medium text-sm shadow-sm"
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-black uppercase tracking-tight italic">Price Breakdown</h4>
              {loadingQuote && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </div>

            {quote ? (
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Base Rental (Daily)</span>
                  <span className="font-bold">RUB {quote.basePrice.toLocaleString()}</span>
                </div>
                
                {quote.markupAmount > 0 && (
                  <div className="flex justify-between text-sm text-rose-500">
                    <span className="flex items-center gap-1.5">Markup <Info className="w-3.5 h-3.5" title={quote.markupReasons.join(', ')} /></span>
                    <span className="font-bold">+ RUB {quote.markupAmount.toLocaleString()}</span>
                  </div>
                )}

                {quote.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-500">
                    <span className="flex items-center gap-1.5">Discount <Info className="w-3.5 h-3.5" title={quote.discountReasons.join(', ')} /></span>
                    <span className="font-bold">- RUB {quote.discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Estimate</span>
                  <span className="text-2xl font-black tracking-tighter">RUB {quote.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-slate-300 italic text-sm">
                Select dates to see price preview
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Confirming this rental will reserve the item at <strong>{item.branchName}</strong> for 15 minutes. 
              Please arrive within this window to complete the pickup.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="p-8 pt-0">
          <button 
            disabled={!quote || booking}
            onClick={handleBooking}
            className="w-full py-4 bg-black text-white rounded-2xl font-black italic shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-2 group"
          >
            {booking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                RESERVE NOW
                <ShieldCheck className="w-5 h-5 group-hover:animate-pulse" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
