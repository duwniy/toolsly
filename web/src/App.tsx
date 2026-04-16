import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { PackageCheck, LayoutGrid, User, Hammer, LogOut } from 'lucide-react';
import IssueToolPage from './pages/IssueToolPage';
import DashboardPage from './pages/DashboardPage';
import ReturnsPage from './pages/ReturnsPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) => 
  `flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 rounded-xl ${
    isActive 
      ? "bg-black text-white shadow-lg shadow-black/10 font-bold" 
      : "font-medium hover:bg-white hover:shadow-sm border border-slate-50 text-slate-600"
  }`;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-white text-black flex">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-slate-50 flex flex-col p-4 space-y-8">
        <div className="flex items-center px-2 gap-2 font-bold text-2xl tracking-tighter">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20">
            T
          </div>
          TOOLSLY
        </div>
        
        <nav className="flex-1 space-y-1">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Menu</p>
          <NavLink to="/" className={navLinkClass}>
            <LayoutGrid className="w-4 h-4" /> Dashboard
          </NavLink>
          
          <div className="pt-6">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Operations</p>
            <div className="space-y-1">
              {user?.role === 'STAFF' && (
                <NavLink to="/issue" className={navLinkClass}>
                  <PackageCheck className="w-4 h-4" /> Issue Tools
                </NavLink>
              )}
              {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
                <NavLink to="/returns" className={navLinkClass}>
                  <Hammer className="w-4 h-4" /> Returns
                </NavLink>
              )}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t bg-white space-y-1">
          <div className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 truncate">
            <User className="w-4 h-4" /> {user?.email}
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b flex items-center px-8 justify-between bg-white backdrop-blur-sm z-10">
          <div className="font-medium text-slate-500">
            {user?.role} Portal / <span className="text-black font-bold uppercase tracking-tight italic">Operations</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold leading-none">{user?.email}</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">BRANCH: {user?.branchId || 'N/A'}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 bg-[#F9FAFB]">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/issue" element={
            <ProtectedRoute>
              <Layout>
                <IssueToolPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/returns" element={
            <ProtectedRoute>
              <Layout>
                <ReturnsPage />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
