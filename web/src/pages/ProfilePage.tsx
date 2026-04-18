import { useAuth } from '../context/AuthContext';
import { Shield, Mail, MapPin, UserCheck, UserX, Building2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const isVerified = user.verified;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-1">Profile</h1>
        <p className="text-neutral-400">Your account information</p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
        {/* Avatar Header */}
        <div className="bg-black px-8 py-10 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
            <span className="text-2xl font-semibold text-white">
              {user.email[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80">
                {user.role}
              </span>
              {user.role === 'RENTER' && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                  isVerified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {isVerified ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                  {isVerified ? 'Verified' : 'Not Verified'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="divide-y divide-neutral-100">
          <ProfileRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
          <ProfileRow icon={<Shield className="w-4 h-4" />} label="Role" value={user.role} />
          {user.branchName && (
            <ProfileRow icon={<Building2 className="w-4 h-4" />} label="Branch" value={user.branchName} />
          )}
          {user.role === 'RENTER' && (
            <ProfileRow icon={<MapPin className="w-4 h-4" />} label="Verification" value={isVerified ? 'Verified — can rent all equipment' : 'Not verified — restrictions apply'} />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 px-8 py-5">
      <div className="text-neutral-400">{icon}</div>
      <div>
        <p className="text-xs text-neutral-400 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}
