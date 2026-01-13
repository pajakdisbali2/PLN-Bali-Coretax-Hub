
import React, { useState } from 'react';
import { Upload, Info, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Submission, UnitName } from '../types';
import { UNITS, APP_CONFIG } from '../constants';

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unit || !files.buktiSertifikat || !files.suratKodeDJP) {
      alert("Harap lengkapi semua data dan file.");
      return;
    }

    setLoading(true);

    try {
      // Prepare files for transmission
      const file1Base64 = await fileToBase64(files.buktiSertifikat);
      const file2Base64 = await fileToBase64(files.suratKodeDJP);

      const payload = {
        nama: formData.nama,
        nip: formData.nip,
        unit: formData.unit,
        npwpStatus: formData.npwpStatus,
        file1: {
          data: file1Base64,
          mimeType: files.buktiSertifikat.type
        },
        file2: {
          data: file2Base64,
          mimeType: files.suratKodeDJP.type
        }
      };

      // Send to Google Apps Script
      const response = await fetch(APP_CONFIG.WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // Apps Script requires no-cors if not using specialized headers
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      // Since we use no-cors, we can't read the body, so we assume success if no error thrown
      const newSubmission: Submission = {
        id: Math.random().toString(36).substr(2, 9),
        nama: formData.nama,
        nip: formData.nip,
        unit: formData.unit,
        buktiSertifikatUrl: APP_CONFIG.DRIVE_FOLDER_URL, // Placeholder, usually script returns real URL
        suratKodeDJPUrl: APP_CONFIG.DRIVE_FOLDER_URL,
        npwpStatus: formData.npwpStatus,
        timestamp: new Date().toISOString()
      };

      onAdd(newSubmission);
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

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Sync Error:", error);
      alert("Gagal sinkronisasi ke Google Sheet. Pastikan URL Web App sudah benar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Input Data Pegawai</h2>
        <p className="text-gray-500 mt-2">Data Anda akan otomatis tersinkronisasi dengan Google Sheets & Drive.</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 />
          <p className="font-semibold">Berhasil! Data telah tersimpan di Database PLN & Drive.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
          
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

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Bukti Penerimaan Surat (Sertifikat Elektronik)</label>
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3 border border-blue-100">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">Unduh di Portal Saya &rarr; Dokumen Saya &rarr; Refresh.</p>
              </div>
              <div className={`relative border-2 border-dashed rounded-xl p-4 transition-colors text-center ${files.buktiSertifikat ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'buktiSertifikat')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} className={files.buktiSertifikat ? 'text-green-500' : 'text-gray-400'} />
                  <span className="text-xs font-medium">{files.buktiSertifikat ? files.buktiSertifikat.name : 'Pilih File PDF/PNG'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Surat Penerbitan Kode Otorisasi DJP</label>
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3 border border-blue-100">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">Unduh di Portal Saya &rarr; Dokumen Saya &rarr; Refresh.</p>
              </div>
              <div className={`relative border-2 border-dashed rounded-xl p-4 transition-colors text-center ${files.suratKodeDJP ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 'suratKodeDJP')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} className={files.suratKodeDJP ? 'text-green-500' : 'text-gray-400'} />
                  <span className="text-xs font-medium">{files.suratKodeDJP ? files.suratKodeDJP.name : 'Pilih File PDF/PNG'}</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Apakah sudah melakukan penggabungan NPWP?</label>
            <div className="bg-amber-50 p-3 rounded-lg flex items-start gap-3 border border-amber-100">
              <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">Cek di Portal &rarr; Profil &rarr; Informasi Umum &rarr; Unit Pajak Keluarga.</p>
            </div>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.npwpStatus === 'Gabung' ? 'bg-blue-50 border-[#0059A1] text-[#0059A1] font-bold' : 'border-gray-100 hover:bg-gray-50'}`}>
                <input type="radio" name="npwp" checked={formData.npwpStatus === 'Gabung'} onChange={() => setFormData({...formData, npwpStatus: 'Gabung'})} className="hidden" />
                Gabung
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.npwpStatus === 'Pisah' ? 'bg-blue-50 border-[#0059A1] text-[#0059A1] font-bold' : 'border-gray-100 hover:bg-gray-50'}`}>
                <input type="radio" name="npwp" checked={formData.npwpStatus === 'Pisah'} onChange={() => setFormData({...formData, npwpStatus: 'Pisah'})} className="hidden" />
                Pisah
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-2xl text-lg font-bold shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0059A1] hover:bg-[#004a86] text-white'}`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Menghubungkan ke Cloud...
            </>
          ) : (
            <>Kirim & Sinkronisasi Database</>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputData;
