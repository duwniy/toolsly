import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { 
  Shield, 
  Mail, 
  MapPin, 
  UserCheck, 
  UserX, 
  Building2, 
  Package, 
  Wallet, 
  Calendar,
  Clock,
  ChevronRight,
  Key,
  Bell,
  HelpCircle,
  ClipboardList,
  TrendingUp
} from 'lucide-react';

interface ProfileStats {
  totalOrders: number;
  activeOrders: number;
  totalSpent: number;
  memberSince: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useQuery<ProfileStats>({
    queryKey: ['profile-stats'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/api/users/me/stats');
        return data;
      } catch {
        // Return default stats if endpoint doesn't exist
        return {
          totalOrders: 0,
          activeOrders: 0,
          totalSpent: 0,
          memberSince: new Date().toISOString()
        };
      }
    },
    staleTime: 30000,
  });

  if (!user) return null;

  const isVerified = user.isVerified;
  const isRenter = user.role === 'RENTER';
  const isStaff = user.role === 'STAFF' || user.role === 'ADMIN';

  const quickActions = [
    ...(isRenter ? [
      { icon: ClipboardList, label: 'My Orders', description: 'View active rentals', href: '/my-orders' },
      { icon: Wallet, label: 'Finances', description: 'Payment history', href: '/finances' },
      { icon: Package, label: 'Catalog', description: 'Browse equipment', href: '/catalog' },
    ] : []),
    ...(isStaff ? [
      { icon: Package, label: 'Issue Tools', description: 'Process pickups', href: '/issue' },
      { icon: TrendingUp, label: 'Dashboard', description: 'View analytics', href: '/' },
      { icon: ClipboardList, label: 'Returns', description: 'Process returns', href: '/returns' },
    ] : []),
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">Profile</h1>
        <p className="text-neutral-400 text-sm sm:text-base">Your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        {/* Avatar Header */}
        <div className="bg-black px-4 sm:px-8 py-6 sm:py-10 flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-5 text-center sm:text-left relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center flex-shrink-0 relative">
            <span className="text-2xl sm:text-3xl font-semibold text-white">
              {user.email[0].toUpperCase()}
            </span>
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-black">
                <UserCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 relative">
            <p className="text-lg sm:text-xl font-semibold text-white truncate">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/90 border border-white/10">
                {user.role}
              </span>
              {isRenter && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                  isVerified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/20 text-amber-300 border border-amber-500/20'
                }`}>
                  {isVerified ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                  {isVerified ? 'Verified' : 'Not Verified'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {isRenter && (
          <div className="grid grid-cols-3 divide-x divide-neutral-100 border-b border-neutral-100 bg-neutral-50/50">
            <StatItem 
              icon={<Package className="w-4 h-4" />} 
              value={stats?.totalOrders ?? 0} 
              label="Total Orders" 
            />
            <StatItem 
              icon={<Clock className="w-4 h-4" />} 
              value={stats?.activeOrders ?? 0} 
              label="Active" 
            />
            <StatItem 
              icon={<Wallet className="w-4 h-4" />} 
              value={`${((stats?.totalSpent ?? 0) / 1000).toFixed(0)}k`} 
              label="Spent (RUB)" 
            />
          </div>
        )}

        {/* Details */}
        <div className="divide-y divide-neutral-100">
          <ProfileRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
          <ProfileRow icon={<Shield className="w-4 h-4" />} label="Role" value={getRoleDescription(user.role)} />
          {user.branchName && (
            <ProfileRow icon={<Building2 className="w-4 h-4" />} label="Branch" value={user.branchName} />
          )}
          {isRenter && (
            <ProfileRow 
              icon={<MapPin className="w-4 h-4" />} 
              label="Verification Status" 
              value={isVerified ? 'Verified — Full access to all equipment' : 'Not verified — Some restrictions apply'} 
              valueClassName={isVerified ? 'text-emerald-600' : 'text-amber-600'}
            />
          )}
          <ProfileRow 
            icon={<Calendar className="w-4 h-4" />} 
            label="Member Since" 
            value={stats?.memberSince ? new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently joined'} 
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-900">Quick Actions</h2>
        </div>
        <div className="divide-y divide-neutral-100">
          {quickActions.map((action) => (
            <button
              key={action.href}
              onClick={() => navigate(action.href)}
              className="w-full flex items-center gap-4 px-4 sm:px-6 py-4 hover:bg-neutral-50 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <action.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">{action.label}</p>
                <p className="text-xs text-neutral-400">{action.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-900">Account Settings</h2>
        </div>
        <div className="divide-y divide-neutral-100">
          <SettingsRow 
            icon={<Key className="w-4 h-4" />} 
            label="Security" 
            description="Password and authentication"
            disabled
          />
          <SettingsRow 
            icon={<Bell className="w-4 h-4" />} 
            label="Notifications" 
            description="Email and push preferences"
            disabled
          />
          <SettingsRow 
            icon={<HelpCircle className="w-4 h-4" />} 
            label="Help & Support" 
            description="Get help with your account"
            disabled
          />
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={logout}
        className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 rounded-xl text-sm font-medium transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="py-4 sm:py-5 px-3 sm:px-4 text-center">
      <div className="flex items-center justify-center gap-1.5 text-neutral-400 mb-1">
        {icon}
      </div>
      <p className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900">{value}</p>
      <p className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ProfileRow({ 
  icon, 
  label, 
  value, 
  valueClassName = '' 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5">
      <div className="text-neutral-400 mt-0.5 sm:mt-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">{label}</p>
        <p className={`text-sm font-medium mt-0.5 break-words ${valueClassName}`}>{value}</p>
      </div>
    </div>
  );
}

function SettingsRow({ 
  icon, 
  label, 
  description,
  disabled = false
}: { 
  icon: React.ReactNode; 
  label: string; 
  description: string;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-neutral-50 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="text-neutral-400">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        <p className="text-xs text-neutral-400">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {disabled && (
          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-400 rounded text-[10px] font-medium uppercase">Soon</span>
        )}
        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
      </div>
    </button>
  );
}

function getRoleDescription(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrator — Full system access';
    case 'STAFF':
      return 'Staff Member — Branch operations';
    case 'RENTER':
      return 'Renter — Equipment rental access';
    default:
      return role;
  }
}
