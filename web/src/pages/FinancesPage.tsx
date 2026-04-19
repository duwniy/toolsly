import { useState, useEffect } from 'react';
import { CreditCard, History, TrendingUp, AlertCircle, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import apiClient from '../api/apiClient';
import { toast } from 'sonner';
import { formatDate } from '../lib/date-utils';

interface FinanceStats {
  totalSpent: number;
  activeRentalsCost: number;
  potentialFines: number;
  recentPayments: Array<{
    id: string;
    toolName: string;
    createdAt: string;
    plannedEndDate: string;
    finalPrice: number;
    status: string;
  }>;
}

export default function FinancesPage() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinances = async () => {
      try {
        const { data } = await apiClient.get('/api/users/me/finances');
        setStats(data);
      } catch (err) {
        toast.error('Failed to load financial data');
      } finally {
        setLoading(false);
      }
    };
    fetchFinances();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">Finances</h1>
        <p className="text-neutral-500 mt-1 text-sm sm:text-base">Track your spending and manage rental costs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard 
          title="Total Spent" 
          value={`RUB ${(stats?.totalSpent || 0).toLocaleString()}`} 
          subtitle="lifetime expenditure"
          icon={<CreditCard className="w-5 h-5" />}
          trend={<span className="text-neutral-400">Total</span>}
        />
        <StatCard 
          title="Accrued Debt" 
          value={`RUB ${(stats?.activeRentalsCost || 0).toLocaleString()}`} 
          subtitle="for active rentals"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={<span className="text-blue-600 flex items-center gap-1 text-xs"><ArrowUpRight className="w-3 h-3"/> Active</span>}
          titleDecor={
            <span className="w-4 h-4 ml-1 inline-flex items-center justify-center rounded-full bg-neutral-100 text-[10px] text-neutral-500 cursor-help" title="Dynamic calculation in real-time based on hours rented">i</span>
          }
          highlight
        />
        <StatCard 
          title="Reserved Funds" 
          value={`RUB ${(stats?.potentialFines || 0).toLocaleString()}`} 
          subtitle="potential final payments"
          icon={<AlertCircle className="w-5 h-5" />}
          trend={<span className="text-amber-600 flex items-center gap-1 text-xs"><ArrowDownRight className="w-3 h-3"/> Pending</span>}
        />
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-neutral-400" />
            Payment History
          </h2>
        </div>
        
        {/* Mobile Cards View */}
        <div className="sm:hidden divide-y divide-neutral-100">
          {stats?.recentPayments.length === 0 ? (
            <div className="px-4 py-12 text-center text-neutral-400">
              No payment history available
            </div>
          ) : (
            stats?.recentPayments.map((p) => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-neutral-900">{p.toolName}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {formatDate(p.createdAt)} — {p.plannedEndDate ? formatDate(p.plannedEndDate) : 'Active'}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    p.status === 'CLOSED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-neutral-50">
                  <span className="text-xs text-neutral-400 uppercase">Amount</span>
                  <span className="font-semibold">RUB {p.finalPrice.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 uppercase text-[10px] font-bold tracking-widest border-b border-neutral-100">
                <th className="px-4 lg:px-6 py-4">Tool</th>
                <th className="px-4 lg:px-6 py-4">Period</th>
                <th className="px-4 lg:px-6 py-4">Status</th>
                <th className="px-4 lg:px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {stats?.recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 lg:px-6 py-12 text-center text-neutral-400">
                    No payment history available
                  </td>
                </tr>
              ) : (
                stats?.recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 font-medium text-neutral-900">{p.toolName}</td>
                    <td className="px-4 lg:px-6 py-4 text-neutral-500">
                      {formatDate(p.createdAt)} — {p.plannedEndDate ? formatDate(p.plannedEndDate) : 'Active'}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'CLOSED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-right font-semibold">
                      RUB {p.finalPrice.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, highlight, trend, titleDecor }: any) {
  return (
    <div className={`p-6 rounded-2xl border ${highlight ? 'bg-black text-white border-black' : 'bg-white text-neutral-900 border-neutral-200'} shadow-sm`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-neutral-800' : 'bg-neutral-50'}`}>
          {icon}
        </div>
        {trend}
      </div>
      <div>
        <p className={`text-sm font-medium flex items-center ${highlight ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {title}
          {titleDecor}
        </p>
        <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
        <p className={`text-xs mt-1.5 ${highlight ? 'text-neutral-500' : 'text-neutral-400'}`}>{subtitle}</p>
      </div>
    </div>
  );
}
