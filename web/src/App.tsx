import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { PackageCheck, LayoutGrid, User, Settings, Hammer } from 'lucide-react';
import IssueToolPage from './pages/IssueToolPage';
import DashboardPage from './pages/DashboardPage';
import ReturnsPage from './pages/ReturnsPage';

const navLinkClass = ({ isActive }: { isActive: boolean }) => 
  `flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 rounded-xl ${
    isActive 
      ? "bg-black text-white shadow-lg shadow-black/10 font-bold" 
      : "font-medium hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 text-slate-600"
  }`;

function Layout({ children }: { children: React.ReactNode }) {
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
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Staff Operations</p>
            <div className="space-y-1">
              <NavLink to="/issue" className={navLinkClass}>
                <PackageCheck className="w-4 h-4" /> Issue Tools
              </NavLink>
              <NavLink to="/returns" className={navLinkClass}>
                <Hammer className="w-4 h-4" /> Returns
              </NavLink>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t bg-white space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium hover:bg-slate-50 rounded-md transition-colors">
            <User className="w-4 h-4" /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium hover:bg-slate-50 rounded-md transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b flex items-center px-8 justify-between bg-white backdrop-blur-sm z-10">
          <div className="font-medium text-slate-500">
            Staff Portal / <span className="text-black font-bold uppercase tracking-tight italic">Operations</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold leading-none">John Staff</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">BRANCH #12 (MAIN)</p>
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Layout>
            <DashboardPage />
          </Layout>
        } />
        <Route path="/issue" element={
          <Layout>
            <IssueToolPage />
          </Layout>
        } />
        <Route path="/returns" element={
          <Layout>
            <ReturnsPage />
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
