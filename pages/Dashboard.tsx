
import React, { useState } from 'react';
import { Submission } from '../types';
import { APP_CONFIG } from '../constants';
import { Lock, FileSpreadsheet, Download, Upload, ExternalLink, Link2, Search, Filter, Copy, Check, Github, Globe, HelpCircle, Code } from 'lucide-react';

interface DashboardProps {
  submissions: Submission[];
}

const Dashboard: React.FC<DashboardProps> = ({ submissions }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'config'>('data');

  const gasCode = `/**
 * GOOGLE APPS SCRIPT - PLN CORETAX HUB SYNC
 * 1. Buka Google Sheet (https://docs.google.com/spreadsheets/d/1V4TsEVXv4Y5F7OzGuxV9Q-AiLh30sBnmW5JwHn1c3dg/edit)
 * 2. Menu Extensions -> Apps Script
 * 3. Copy/Paste kode ini dan simpan
 * 4. Deploy sebagai Web App (Akses: Anyone)
 */

const SHEET_ID = '1V4TsEVXv4Y5F7OzGuxV9Q-AiLh30sBnmW5JwHn1c3dg';
const FOLDER_ID = '1HL7NFQ8t_7MIBh5tS5Ge2vvWNJNtoMUb';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheets()[0];
    const folder = DriveApp.getFolderById(FOLDER_ID);

    let sertifikatUrl = "";
    if (data.file1) {
      const file1Blob = Utilities.newBlob(Utilities.base64Decode(data.file1.data), data.file1.mimeType, "Sertifikat_" + data.nip + "_" + data.nama);
      const file1 = folder.createFile(file1Blob);
      sertifikatUrl = file1.getUrl();
    }

    let djpUrl = "";
    if (data.file2) {
      const file2Blob = Utilities.newBlob(Utilities.base64Decode(data.file2.data), data.file2.mimeType, "KodeDJP_" + data.nip + "_" + data.nama);
      const file2 = folder.createFile(file2Blob);
      djpUrl = file2.getUrl();
    }

    sheet.appendRow([
      new Date(),
      data.nama,
      "'" + data.nip,
      data.unit,
      sertifikatUrl,
      djpUrl,
      data.npwpStatus
    ]);

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const data = ss.getSheets()[0].getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === APP_CONFIG.ADMIN_EMAIL && password === APP_CONFIG.ADMIN_PASS) {
      setIsLoggedIn(true);
    } else {
      alert("Email atau Password salah!");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gasCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <div className="flex gap-4 mt-2">
             <button 
              onClick={() => setActiveTab('data')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'data' ? 'bg-[#0059A1] text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              Database Pegawai
            </button>
            <button 
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-[#0059A1] text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              Konfigurasi Cloud
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm shadow-sm">
            <Download size={18} /> Template
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-[#FFD100] text-[#0059A1] rounded-xl font-bold hover:brightness-95 transition-all text-sm shadow-sm">
            <FileSpreadsheet size={18} /> Export Data
          </button>
        </div>
      </div>

      {activeTab === 'data' ? (
        <>
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
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">NIP</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sertifikat</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">NPWP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.length > 0 ? filteredData.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">{sub.nama}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{sub.nip}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-50 text-[#0059A1] text-xs font-bold rounded-full">{sub.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        <a href={sub.buktiSertifikatUrl} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
                          <Link2 size={12} /> Buka
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${sub.npwpStatus === 'Gabung' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{sub.npwpStatus}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Tidak ada data.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Copy Script Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <Code className="text-[#0059A1]" />
                <h3 className="font-bold text-gray-900">Google Apps Script (GAS)</h3>
              </div>
              <button 
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-[#0059A1] text-white'}`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Tersalin!' : 'Salin Kode'}
              </button>
            </div>
            <div className="p-0">
              <pre className="p-6 text-sm font-mono text-gray-600 bg-gray-900 overflow-x-auto max-h-[400px]">
                <code>{gasCode}</code>
              </pre>
            </div>
          </div>

          {/* Deployment Guides */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Github className="text-gray-900" />
                <h3 className="font-bold text-gray-900">Petunjuk GitHub</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2"><span>1.</span> Simpan file <code>index.html</code> dan <code>index.tsx</code> di root (bukan folder src).</li>
                <li className="flex gap-2"><span>2.</span> Masukkan <code>vercel.json</code> agar routing SPA aktif.</li>
                <li className="flex gap-2"><span>3.</span> Push ke repository publik atau privat Anda.</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-[#0059A1]">
                <Globe />
                <h3 className="font-bold text-gray-900">Petunjuk Vercel (Solusi Blank Screen)</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2"><span>1.</span> Import repo dari GitHub ke Vercel.</li>
                <li className="flex gap-2"><span>2.</span> <strong>Build Settings:</strong> Jika blank, set <i>Build Command</i> ke <code>npm run build</code> dan <i>Output Directory</i> ke <code>dist</code>.</li>
                <li className="flex gap-2"><span>3.</span> <strong>Rewrites:</strong> Pastikan <code>vercel.json</code> sudah ada di repo untuk mengarahkan rute ke index.html.</li>
                <li className="flex gap-2 text-red-600 font-medium"><span>4.</span> Jika masih kosong, cek console log di browser untuk melihat error import module.</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
            <HelpCircle className="text-[#0059A1] shrink-0" />
            <div>
              <p className="font-bold text-[#0059A1]">Masih ada kendala?</p>
              <p className="text-sm text-blue-800 mt-1">Gunakan HashRouter (sudah terpasang di App.tsx) karena paling kompatibel dengan Vercel tanpa konfigurasi server tambahan.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
