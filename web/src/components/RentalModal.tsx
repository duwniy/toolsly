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

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setEndDate(tomorrow.toISOString().split('T')[0]);
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden border border-neutral-100 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-6 border-b border-neutral-100">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black text-white rounded-full text-xs font-medium mb-3">
            <ShieldCheck className="w-3 h-3" />
            Secure Booking
          </div>
          
          <h2 className="text-xl font-semibold tracking-tight">{item.modelName}</h2>
          <p className="text-neutral-400 text-sm">{item.categoryName} - {item.branchName}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Start Date
              </label>
              <div className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-100 rounded-lg text-neutral-400 text-sm">
                Today (Now)
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> End Date
              </label>
              <input 
                type="date"
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-lg focus:border-black outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-100 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Price Breakdown</h4>
              {loadingQuote && <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />}
            </div>

            {quote ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Base Rental (Daily)</span>
                  <span className="font-medium">RUB {quote.basePrice.toLocaleString()}</span>
                </div>
                
                {quote.markupAmount > 0 && (
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span title={quote.markupReasons.join(', ')} className="cursor-help flex items-center gap-1">
                      <Info className="w-3 h-3" /> Markup
                    </span>
                    <span className="font-medium">+ RUB {quote.markupAmount.toLocaleString()}</span>
                  </div>
                )}

                {quote.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span title={quote.discountReasons.join(', ')} className="cursor-help flex items-center gap-1">
                      <Info className="w-3 h-3" /> Discount
                    </span>
                    <span className="font-medium">- RUB {quote.discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-neutral-200 flex justify-between items-end">
                  <span className="text-xs text-neutral-400 uppercase tracking-wider">Total</span>
                  <span className="text-xl font-semibold tracking-tight">RUB {quote.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center text-neutral-300 text-sm">
                Select dates to see price preview
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
            <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-500 leading-relaxed">
              Confirming this rental will reserve the item at <strong className="text-neutral-700">{item.branchName}</strong> for 15 minutes. 
              Please arrive within this window to complete the pickup.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="p-6 pt-0">
          <button 
            disabled={!quote || booking}
            onClick={handleBooking}
            className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-30 disabled:hover:bg-black flex items-center justify-center gap-2"
          >
            {booking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Reserve Now
                <ShieldCheck className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
