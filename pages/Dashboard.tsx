
import React, { useState, useRef } from 'react';
import { Submission, UnitName } from '../types';
import { APP_CONFIG } from '../constants';
import { Lock, FileSpreadsheet, Download, Upload, ExternalLink, Link2, Search, Copy, Check, Code, ShieldCheck, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

interface DashboardProps {
  submissions: Submission[];
  syncStatus: 'connecting' | 'connected' | 'error';
  onRefresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ submissions, syncStatus, onRefresh }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'config'>('data');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gasCode = `/**
 * GOOGLE APPS SCRIPT - PLN CORETAX HUB SYNC
 */
const SHEET_ID = '1V4TsEVXv4Y5F7OzGuxV9Q-AiLh30sBnmW5JwHn1c3dg';
const FOLDER_ID = '1HL7NFQ8t_7MIBh5tS5Ge2vvWNJNtoMUb';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheets()[0];
    const folder = DriveApp.getFolderById(FOLDER_ID);

    let sertifikatUrl = data.buktiSertifikatUrl || "";
    if (data.file1) {
      const file1Blob = Utilities.newBlob(Utilities.base64Decode(data.file1.data), data.file1.mimeType, "Sertifikat_" + data.nip + "_" + data.nama);
      const file1 = folder.createFile(file1Blob);
      sertifikatUrl = file1.getUrl();
    }

    let djpUrl = data.suratKodeDJPUrl || "";
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

  const handleExport = () => {
    if (submissions.length === 0) {
      alert("Tidak ada data untuk di-export.");
      return;
    }
    const headers = ["Timestamp", "Nama Pegawai", "NIP", "Unit", "Bukti Sertifikat", "Surat DJP", "Status NPWP"];
    const csvContent = [
      headers.join(","),
      ...submissions.map(s => [
        s.timestamp,
        `"${s.nama}"`,
        `'${s.nip}`,
        `"${s.unit}"`,
        s.buktiSertifikatUrl,
        s.suratKodeDJPUrl,
        s.npwpStatus
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_PLN_Coretax_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const headers = ["Nama Pegawai", "NIP", "Unit", "Status NPWP (Gabung/Pisah)"];
    const csvContent = [headers.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Template_Upload_Masal_PLN.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const dataToImport = lines.slice(1).filter(line => line.trim() !== "");

      let successCount = 0;
      for (const line of dataToImport) {
        const [nama, nip, unit, npwpStatus] = line.split(",").map(item => item.trim().replace(/^"|"$/g, ''));
        
        if (nama && nip && unit && npwpStatus) {
          try {
            await fetch(APP_CONFIG.WEB_APP_URL, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                nama, 
                nip, 
                unit, 
                npwpStatus,
                buktiSertifikatUrl: "-",
                suratKodeDJPUrl: "-"
              })
            });
            successCount++;
          } catch (err) {
            console.error("Gagal mengimpor baris:", line);
          }
        }
      }

      setImporting(false);
      alert(`Import Selesai! ${successCount} data berhasil diunggah ke Database.`);
      onRefresh(); // Sinkronisasi ulang tabel
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
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
            <p className="text-gray-500 mt-2">Login untuk manajemen database masal.</p>
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
        <div className="flex items-center gap-4">
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
                Salin Script
              </button>
            </div>
          </div>
          <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center transition-all ${syncStatus === 'connected' ? 'bg-green-50 border-green-200 text-green-700' : syncStatus === 'connecting' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {syncStatus === 'connected' ? <ShieldCheck size={24} /> : syncStatus === 'connecting' ? <RefreshCw className="animate-spin" size={24} /> : <AlertCircle size={24} />}
            <span className="text-[10px] font-bold uppercase mt-1">Cloud: {syncStatus}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".csv" />
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm shadow-sm"
          >
            <Download size={18} /> Template
          </button>
          <button 
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-sm shadow-sm border ${importing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-[#0059A1] border-blue-100 hover:bg-blue-100'}`}
          >
            {importing ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            {importing ? 'Mengimpor...' : 'Import Masal'}
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-3 bg-[#FFD100] text-[#0059A1] rounded-xl font-bold hover:brightness-95 transition-all text-sm shadow-sm"
          >
            <FileSpreadsheet size={18} /> Export CSV
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
                  <p className="font-bold text-gray-900">Database Live</p>
                  <p className="text-xs text-gray-500">Total data: {submissions.length} entri</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-400 group-hover:text-green-500" />
            </a>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><RefreshCw size={20} className={syncStatus === 'connecting' ? 'animate-spin' : ''} /></div>
                <div>
                  <p className="font-bold text-gray-900">Sinkronisasi Tabel</p>
                  <button onClick={onRefresh} className="text-xs text-blue-600 hover:underline">Klik untuk refresh tabel sekarang</button>
                </div>
              </div>
              <button onClick={onRefresh} className="p-2 hover:bg-gray-50 rounded-lg transition-all"><RefreshCw size={16} /></button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari Nama, NIP atau Unit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-[#0059A1] transition-all"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">NIP</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">File Sertifikat</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">NPWP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.length > 0 ? filteredData.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{sub.nama}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{sub.nip}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-50 text-[#0059A1] text-[10px] font-bold rounded-full uppercase tracking-wider">{sub.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        {sub.buktiSertifikatUrl && sub.buktiSertifikatUrl !== "-" ? (
                          <a href={sub.buktiSertifikatUrl} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-medium">
                            <Link2 size={12} /> Buka Link Drive
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Tanpa File</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${sub.npwpStatus === 'Gabung' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{sub.npwpStatus}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {syncStatus === 'connecting' ? <div className="flex flex-col items-center gap-2"><Loader2 className="animate-spin text-blue-600" /> Sinkronisasi data...</div> : 'Data tidak ditemukan.'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <Code className="text-[#0059A1]" />
                <h3 className="font-bold text-gray-900">Salin Data Script Google Apps Script</h3>
              </div>
              <button 
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${copied ? 'bg-green-500 text-white' : 'bg-[#0059A1] text-white hover:bg-[#004a86]'}`}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
                {copied ? 'Tersalin!' : 'Salin Kode App Script'}
              </button>
            </div>
            <div className="p-0">
              <pre className="p-8 text-sm font-mono text-gray-400 bg-gray-900 overflow-x-auto max-h-[500px] leading-relaxed">
                <code>{gasCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
