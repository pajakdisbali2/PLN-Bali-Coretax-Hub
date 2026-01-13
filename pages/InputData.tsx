
import React, { useState } from 'react';
import { Upload, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Submission, UnitName } from '../types';
import { UNITS } from '../constants';

interface InputDataProps {
  onAdd: (sub: Submission) => void;
}

const InputData: React.FC<InputDataProps> = ({ onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    unit: '' as UnitName,
    npwpStatus: 'Gabung' as 'Gabung' | 'Pisah',
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    buktiSertifikat: null,
    suratKodeDJP: null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unit || !files.buktiSertifikat || !files.suratKodeDJP) {
      alert("Harap lengkapi semua data dan file.");
      return;
    }

    setLoading(true);
    
    // Simulate API Call / Google Sync
    setTimeout(() => {
      const newSubmission: Submission = {
        id: Math.random().toString(36).substr(2, 9),
        nama: formData.nama,
        nip: formData.nip,
        unit: formData.unit,
        buktiSertifikatUrl: URL.createObjectURL(files.buktiSertifikat!),
        suratKodeDJPUrl: URL.createObjectURL(files.suratKodeDJP!),
        npwpStatus: formData.npwpStatus,
        timestamp: new Date().toISOString()
      };

      onAdd(newSubmission);
      setLoading(false);
      setSuccess(true);
      
      // Reset form
      setFormData({
        nama: '',
        nip: '',
        unit: '' as UnitName,
        npwpStatus: 'Gabung'
      });
      setFiles({
        buktiSertifikat: null,
        suratKodeDJP: null
      });

      // Clear success after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Input Data Pegawai</h2>
        <p className="text-gray-500 mt-2">Lengkapi formulir pendataan Coretax di bawah ini secara akurat.</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 />
          <p className="font-semibold">Data berhasil dikirim dan tersinkronisasi!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
          
          {/* Basic Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Nama Pegawai</label>
              <input
                required
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0059A1] focus:border-transparent outline-none transition-all"
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">NIP</label>
              <input
                required
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({...formData, nip: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0059A1] focus:border-transparent outline-none transition-all"
                placeholder="Nomor Induk Pegawai"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Unit</label>
            <select
              required
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value as UnitName})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0059A1] focus:border-transparent outline-none transition-all appearance-none bg-white"
            >
              <option value="" disabled>Pilih Unit Kerja</option>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <hr className="border-gray-100" />

          {/* File Uploads */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* File 1 */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <label className="block text-sm font-semibold text-gray-700">Bukti Penerimaan Surat (Sertifikat Elektronik)</label>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3 border border-blue-100">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Dapat diunduh pada <strong>Portal Saya</strong> lalu pilih <strong>Dokumen Saya</strong> lalu <strong>Refresh</strong>.
                </p>
              </div>
              <div className={`relative border-2 border-dashed rounded-xl p-4 transition-colors text-center ${files.buktiSertifikat ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleFileChange(e, 'buktiSertifikat')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} className={files.buktiSertifikat ? 'text-green-500' : 'text-gray-400'} />
                  <span className="text-sm text-gray-600 font-medium">
                    {files.buktiSertifikat ? files.buktiSertifikat.name : 'Upload PDF/PNG'}
                  </span>
                </div>
              </div>
            </div>

            {/* File 2 */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <label className="block text-sm font-semibold text-gray-700">Surat Penerbitan Kode Otorisasi DJP</label>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3 border border-blue-100">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Dapat diunduh pada <strong>Portal Saya</strong> lalu pilih <strong>Dokumen Saya</strong> lalu <strong>Refresh</strong>.
                </p>
              </div>
              <div className={`relative border-2 border-dashed rounded-xl p-4 transition-colors text-center ${files.suratKodeDJP ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleFileChange(e, 'suratKodeDJP')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} className={files.suratKodeDJP ? 'text-green-500' : 'text-gray-400'} />
                  <span className="text-sm text-gray-600 font-medium">
                    {files.suratKodeDJP ? files.suratKodeDJP.name : 'Upload PDF/PNG'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Radio Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-semibold text-gray-700">Apakah anda sudah melakukan penggabungan NPWP dengan suami/istri?</label>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg flex items-start gap-3 border border-amber-100">
              <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Dapat dilihat pada <strong>Portal Saya</strong> &rarr; <strong>Profil Saya</strong> &rarr; <strong>Informasi Umum</strong> &rarr; <strong>Edit</strong> &rarr; <strong>Unit Pajak Keluarga</strong>. 
                <span className="font-semibold block mt-1 italic text-red-600">NPWP istri harus dinonaktifkan terlebih dahulu!</span>
              </p>
            </div>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.npwpStatus === 'Gabung' ? 'bg-blue-50 border-[#0059A1] text-[#0059A1] font-bold' : 'border-gray-100 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="npwp"
                  value="Gabung"
                  checked={formData.npwpStatus === 'Gabung'}
                  onChange={() => setFormData({...formData, npwpStatus: 'Gabung'})}
                  className="hidden"
                />
                Gabung
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.npwpStatus === 'Pisah' ? 'bg-blue-50 border-[#0059A1] text-[#0059A1] font-bold' : 'border-gray-100 hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="npwp"
                  value="Pisah"
                  checked={formData.npwpStatus === 'Pisah'}
                  onChange={() => setFormData({...formData, npwpStatus: 'Pisah'})}
                  className="hidden"
                />
                Pisah
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-2xl text-lg font-bold shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0059A1] hover:bg-[#004a86] text-white'}`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Memproses Sinkronisasi...
            </>
          ) : (
            <>Kirim & Sinkronisasi ke Database</>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputData;
