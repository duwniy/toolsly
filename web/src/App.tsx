import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LoginPage } from './pages/LoginPage';
import FinancesPage from './pages/FinancesPage';
import IssueToolPage from './pages/IssueToolPage';
import DashboardPage from './pages/DashboardPage';
import ReturnsPage from './pages/ReturnsPage';
import CatalogPage from './pages/CatalogPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PackageCheck, LayoutGrid, User, Hammer, LogOut, ClipboardList, Wallet, Menu, X } from 'lucide-react';

const navLinkClass = ({ isActive }: { isActive: boolean }) => 
  `flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 rounded-lg ${
    isActive 
      ? "bg-black text-white font-medium" 
      : "text-neutral-600 hover:bg-neutral-100"
  }`;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const NavContent = () => (
    <>
      <nav className="flex-1 space-y-1">
        <p className="px-3 text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Menu</p>
        {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
          <NavLink to="/" className={navLinkClass}>
            <LayoutGrid className="w-4 h-4" /> Dashboard
          </NavLink>
        )}
        
        <NavLink to="/catalog" className={navLinkClass}>
          <PackageCheck className="w-4 h-4" /> Catalog
        </NavLink>

        <NavLink to="/my-orders" className={navLinkClass}>
          <ClipboardList className="w-4 h-4" /> My Orders
        </NavLink>
        
        <NavLink to="/finances" className={navLinkClass}>
          <Wallet className="w-4 h-4" /> Finances
        </NavLink>
        
        <div className="pt-4">
          <p className="px-3 text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Operations</p>
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

      <div className="pt-4 border-t border-neutral-100 space-y-1">
        <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 truncate hover:bg-neutral-50 rounded-lg transition-colors">
          <User className="w-4 h-4" /> 
          <div className="truncate text-left">
            <span className="block truncate font-medium text-black">{user?.email}</span>
            {user?.branchName && <span className="block text-xs text-neutral-400 truncate">{user.branchName}</span>}
          </div>
        </button>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-500 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </>
  );
  
  return (
    <div className="min-h-screen bg-neutral-50 text-black flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-neutral-100 flex-col p-4 space-y-6">
        <div className="flex items-center px-2 gap-2.5 font-semibold text-xl tracking-tight">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-sm">
            T
          </div>
          Toolsly
        </div>
        <NavContent />
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-white border-r border-neutral-100 flex flex-col p-4 space-y-6 z-50 transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center px-2 gap-2.5 font-semibold text-xl tracking-tight">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-sm">
              T
            </div>
            Toolsly
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <NavContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-neutral-100 flex items-center px-4 lg:px-6 justify-between bg-white">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop breadcrumb */}
          <div className="hidden lg:block text-sm text-neutral-500">
            <span className="text-neutral-400">{user?.role}</span> / <span className="text-black font-medium">Operations</span>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 font-semibold">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-xs">
              T
            </div>
            <span className="text-base">Toolsly</span>
          </div>

          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 lg:gap-3 hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{user?.email}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{user?.branchName || 'Global'}{user?.role === 'RENTER' && (user?.isVerified ? ' · Verified' : ' · Not Verified')}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center">
              <span className="text-xs font-medium">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50">
          {children}
        </main>
      </div>
    </div>
  );
}

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          {user?.role === 'RENTER' ? <Navigate to="/catalog" /> : (
            <Layout>
              <DashboardPage />
            </Layout>
          )}
        </ProtectedRoute>
      } />
      <Route path="/catalog" element={
        <ProtectedRoute>
          <Layout>
            <CatalogPage />
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
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <ProfilePage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/my-orders" element={
        <ProtectedRoute>
          <Layout>
            <MyOrdersPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/finances" element={
        <ProtectedRoute>
          <Layout>
            <FinancesPage />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
