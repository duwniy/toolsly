import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

const QUICK_USERS = [
  { name: 'Иван (Staff Central)', email: 'staff_central@toolsly.com', pass: 'password123', role: 'STAFF' },
  { name: 'Елена (Staff North)', email: 'staff_north@toolsly.com', pass: 'password123', role: 'STAFF' },
  { name: 'Покупатель (Client)', email: 'client_verified@mail.com', pass: 'password123', role: 'RENTER' },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent, customMail?: string, customPass?: string) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    const mail = customMail || email;
    const pass = customPass || password;

    try {
      const response = await apiClient.post('/api/auth/login', { email: mail, password: pass });
      login(response.data.token, {
        userId: response.data.userId,
        email: response.data.email,
        role: response.data.role,
        branchId: response.data.branchId,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">Toolsly</h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Secure Equipment Management System
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white rounded-t-md bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white rounded-b-md bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Quick Access (Dev Mode)</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            {QUICK_USERS.map((u) => (
              <button
                key={u.email}
                onClick={() => handleLogin(undefined, u.email, u.pass)}
                className="w-full flex justify-between items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <span>{u.name}</span>
                <span className="text-xs bg-gray-600 px-2 py-0.5 rounded text-gray-400">{u.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
