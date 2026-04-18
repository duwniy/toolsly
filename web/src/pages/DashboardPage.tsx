import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell
} from 'recharts';
import { 
  TrendingUp, Users, Package, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#000000', '#262626', '#525252', '#737373', '#a3a3a3'];

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  averageOccupancy: number;
  damageRate: number;
  topModels: Array<{ modelName: string; rentalCount: number }>;
  revenueTrend: Array<{ date: string; amount: number }>;
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-neutral-100 hover:border-neutral-200 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-neutral-50 rounded-xl group-hover:bg-black group-hover:text-white transition-colors duration-300">
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
          trend === 'up' ? 'text-neutral-900 bg-neutral-100' : 'text-neutral-500 bg-neutral-50'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trendValue}%
        </div>
      )}
    </div>
    <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
    <p className="text-3xl font-semibold tracking-tight">{value}</p>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading, isError, error, refetch } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', user?.branchId],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/reporting/dashboard-stats', {
        params: { branchId: user?.branchId }
      });
      return data;
    },
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-36 bg-neutral-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="p-5 bg-neutral-100 rounded-full">
          <AlertCircle className="w-10 h-10 text-neutral-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Connection Failed</h2>
          <p className="text-neutral-400 max-w-md">
            {(error as any)?.response?.data?.message || 'Unable to load dashboard data. The backend service may be unreachable.'}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-neutral-800 active:scale-95 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-1">Dashboard</h1>
          <p className="text-neutral-400">Real-time business intelligence and asset health</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" /> Live
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats?.totalRevenue?.toLocaleString()}`} 
          icon={TrendingUp}
          trend="up"
          trendValue="12.5"
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.totalOrders} 
          icon={Users}
          trend="up"
          trendValue="8.2"
        />
        <StatCard 
          title="Branch Occupancy" 
          value={`${stats?.averageOccupancy}%`} 
          icon={Package}
          trend="down"
          trendValue="3.1"
        />
        <StatCard 
          title="Damage Rate" 
          value={`${stats?.damageRate}%`} 
          icon={AlertCircle}
          trend="down"
          trendValue="0.8"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-8 rounded-2xl border border-neutral-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold tracking-tight">Revenue Trend</h3>
            <select className="bg-neutral-50 border border-neutral-100 rounded-lg text-sm font-medium px-3 py-2 outline-none focus:border-neutral-200">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#a3a3a3', fontSize: 11}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#a3a3a3', fontSize: 11}}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e5e5e5', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    fontSize: '13px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#000" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#000', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#000' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-neutral-100">
          <h3 className="text-lg font-semibold tracking-tight mb-6">Top Rental Models</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.topModels} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="modelName" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#171717', fontSize: 12, fontWeight: 500}}
                  width={140}
                />
                <Tooltip 
                   contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e5e5e5',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                />
                <Bar 
                  dataKey="rentalCount" 
                  fill="#000" 
                  radius={[0, 6, 6, 0]} 
                  barSize={20}
                >
                  {stats?.topModels?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
