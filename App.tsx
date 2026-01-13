
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, FileInput, BarChart3, ShieldCheck, Zap, Menu, X } from 'lucide-react';
import InputData from './pages/InputData';
import RecapData from './pages/RecapData';
import Dashboard from './pages/Dashboard';
import { Submission } from './types';

const App: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize with some dummy data for preview
  useEffect(() => {
    const saved = localStorage.getItem('pln_submissions');
    if (saved) {
      setSubmissions(JSON.parse(saved));
    } else {
      // Mock data to show something on first load
      const mock: Submission[] = [
        {
          id: '1',
          nama: 'Budi Santoso',
          nip: '9213445Z',
          unit: 'UID Bali',
          buktiSertifikatUrl: '#',
          suratKodeDJPUrl: '#',
          npwpStatus: 'Gabung',
          timestamp: new Date().toISOString()
        }
      ];
      setSubmissions(mock);
      localStorage.setItem('pln_submissions', JSON.stringify(mock));
    }
  }, []);

  const addSubmission = (newSub: Submission) => {
    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    localStorage.setItem('pln_submissions', JSON.stringify(updated));
  };

  const NavItem = ({ to, children, icon: Icon }: { to: string, children: React.ReactNode, icon: any }) => (
    <NavLink
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-6 py-3 transition-all duration-200 border-l-4 ${
          isActive 
            ? 'bg-blue-50 text-[#0059A1] border-[#FFD100] font-semibold' 
            : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-[#0059A1]'
        }`
      }
    >
      <Icon size={20} />
      <span>{children}</span>
    </NavLink>
  );

  return (
    <HashRouter>
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 sticky top-0 h-screen shadow-sm">
          <div className="p-8 flex items-center gap-3 bg-[#0059A1]">
            <Zap className="text-[#FFD100]" fill="#FFD100" size={32} />
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">PLN</h1>
              <p className="text-[#FFD100] text-xs font-medium tracking-widest">CORETAX HUB</p>
            </div>
          </div>
          
          <nav className="flex-1 py-8">
            <NavItem to="/input" icon={FileInput}>Input Data</NavItem>
            <NavItem to="/recap" icon={BarChart3}>Rekap Data</NavItem>
            <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
          </nav>

          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <ShieldCheck size={14} />
              <span>Sistem Terverifikasi</span>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden bg-[#0059A1] text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <Zap className="text-[#FFD100]" fill="#FFD100" size={24} />
            <h1 className="font-bold">PLN Coretax HUB</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-white z-40 flex flex-col pt-20">
            <NavItem to="/input" icon={FileInput}>Input Data</NavItem>
            <NavItem to="/recap" icon={BarChart3}>Rekap Data</NavItem>
            <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-10">
          <Routes>
            <Route path="/" element={<Navigate to="/input" replace />} />
            <Route path="/input" element={<InputData onAdd={addSubmission} />} />
            <Route path="/recap" element={<RecapData submissions={submissions} />} />
            <Route path="/dashboard" element={<Dashboard submissions={submissions} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
