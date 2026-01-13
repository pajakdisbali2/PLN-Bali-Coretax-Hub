
import React, { useState } from 'react';
import { Submission } from '../types';
import { APP_CONFIG } from '../constants';
import { Lock, FileSpreadsheet, Download, Upload, ExternalLink, Link2, Search, Filter } from 'lucide-react';

interface DashboardProps {
  submissions: Submission[];
}

const Dashboard: React.FC<DashboardProps> = ({ submissions }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === APP_CONFIG.ADMIN_EMAIL && password === APP_CONFIG.ADMIN_PASS) {
      setIsLoggedIn(true);
    } else {
      alert("Email atau Password salah!");
    }
  };

  const filteredData = submissions.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) || 
    s.nip.includes(search) || 
    s.unit.toLowerCase().includes(search.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-blue-50 text-[#0059A1] rounded-2xl mb-4">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-500 mt-2">Sistem ini diproteksi, harap login untuk melanjutkan.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0059A1]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0059A1]"
              />
            </div>
            <button className="w-full py-4 bg-[#0059A1] text-white rounded-xl font-bold hover:bg-[#004a86] transition-all">
              Login ke Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Control</h2>
          <p className="text-gray-500 mt-1">Status: <span className="text-green-600 font-bold">Terhubung ke Google Cloud</span></p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm shadow-sm">
            <Download size={18} /> Template
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm shadow-sm">
            <Upload size={18} /> Import
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-[#FFD100] text-[#0059A1] rounded-xl font-bold hover:brightness-95 transition-all text-sm shadow-sm">
            <FileSpreadsheet size={18} /> Export Data
          </button>
        </div>
      </div>

      {/* Database Quick Links */}
      <div className="grid md:grid-cols-2 gap-4">
        <a href={APP_CONFIG.GOOGLE_SHEET_URL} target="_blank" className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-green-300 group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><FileSpreadsheet size={20} /></div>
            <div>
              <p className="font-bold text-gray-900">Database Spreadsheet</p>
              <p className="text-xs text-gray-500">Sync status: Real-time</p>
            </div>
          </div>
          <ExternalLink size={16} className="text-gray-400 group-hover:text-green-500" />
        </a>
        <a href={APP_CONFIG.DRIVE_FOLDER_URL} target="_blank" className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-blue-300 group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Link2 size={20} /></div>
            <div>
              <p className="font-bold text-gray-900">Drive Cloud Folder</p>
              <p className="text-xs text-gray-500">Location: File Coretax</p>
            </div>
          </div>
          <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-500" />
        </a>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari Nama, NIP atau Unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#0059A1] transition-all"
            />
          </div>
          <button className="px-6 py-3 bg-gray-50 text-gray-600 rounded-xl flex items-center gap-2 font-semibold hover:bg-gray-100">
            <Filter size={18} /> Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Pegawai</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">NIP</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sertifikat</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kode DJP</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status NPWP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? filteredData.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{sub.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sub.nip}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-50 text-[#0059A1] text-xs font-bold rounded-full">
                      {sub.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a href={sub.buktiSertifikatUrl} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-medium">
                      <Link2 size={12} /> Buka File
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <a href={sub.suratKodeDJPUrl} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-medium">
                      <Link2 size={12} /> Buka File
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${sub.npwpStatus === 'Gabung' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {sub.npwpStatus}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
