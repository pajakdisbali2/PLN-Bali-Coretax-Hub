
import React, { useMemo } from 'react';
import { Submission, UnitStats } from '../types';
import { TrendingUp, Users, CheckCircle, Users2 } from 'lucide-react';

interface RecapDataProps {
  submissions: Submission[];
  unitTotals: UnitStats[];
}

const RecapData: React.FC<RecapDataProps> = ({ submissions, unitTotals }) => {
  const stats = useMemo(() => {
    return unitTotals.map(unit => {
      const unitSubmissions = submissions.filter(s => s.unit === unit.name);
      const count = unitSubmissions.length;
      const totalGabung = unitSubmissions.filter(s => s.npwpStatus === 'Gabung').length;
      const totalPisah = unitSubmissions.filter(s => s.npwpStatus === 'Pisah').length;
      
      return {
        ...unit,
        totalMengisi: count,
        totalGabung,
        totalPisah,
        percentMengisi: unit.totalPegawai > 0 ? ((count / unit.totalPegawai) * 100).toFixed(1) : "0.0",
        percentGabung: unit.totalPegawai > 0 ? ((totalGabung / unit.totalPegawai) * 100).toFixed(1) : "0.0",
        percentPisah: unit.totalPegawai > 0 ? ((totalPisah / unit.totalPegawai) * 100).toFixed(1) : "0.0",
        belumMengisi: unit.totalPegawai - count,
        percentBelum: unit.totalPegawai > 0 ? (((unit.totalPegawai - count) / unit.totalPegawai) * 100).toFixed(1) : "0.0",
      };
    });
  }, [submissions, unitTotals]);

  const aggregate = useMemo(() => {
    const totalP = stats.reduce((acc, curr) => acc + curr.totalPegawai, 0);
    const totalM = stats.reduce((acc, curr) => acc + curr.totalMengisi, 0);
    const totalG = stats.reduce((acc, curr) => acc + curr.totalGabung, 0);
    const totalPi = stats.reduce((acc, curr) => acc + curr.totalPisah, 0);
    
    return {
      totalPegawai: totalP,
      totalMengisi: totalM,
      totalGabung: totalG,
      totalPisah: totalPi,
      percent: totalP > 0 ? ((totalM / totalP) * 100).toFixed(1) : "0.0",
      percentGabung: totalP > 0 ? ((totalG / totalP) * 100).toFixed(1) : "0.0",
      percentPisah: totalP > 0 ? ((totalPi / totalP) * 100).toFixed(1) : "0.0"
    };
  }, [stats]);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Rekap Progres Data</h2>
          <p className="text-gray-500 mt-2">Pantau tingkat pengisian data berdasarkan unit kerja.</p>
        </div>
        <div className="bg-[#FFD100] text-[#0059A1] font-bold px-6 py-3 rounded-2xl flex items-center gap-3 shadow-md">
          <TrendingUp size={20} />
          <span>Total Progres: {aggregate.percent}%</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-[#0059A1] rounded-xl"><Users /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Pegawai</p>
            <p className="text-2xl font-bold">{aggregate.totalPegawai}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Status Gabung (Total)</p>
            <p className="text-2xl font-bold text-green-600">{aggregate.totalGabung} <span className="text-sm font-normal text-gray-400">({aggregate.percentGabung}%)</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Users2 /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Status Pisah (Total)</p>
            <p className="text-2xl font-bold text-amber-600">{aggregate.totalPisah} <span className="text-sm font-normal text-gray-400">({aggregate.percentPisah}%)</span></p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Unit Kerja</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Mengisi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center text-green-600 bg-green-50/30">Gabung</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center text-green-600 bg-green-50/30">% Gabung</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center text-amber-600 bg-amber-50/30">Pisah</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center text-amber-600 bg-amber-50/30">% Pisah</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Belum</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">% Progres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.map((row) => (
                <tr key={row.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 font-bold text-gray-900">{row.name}</td>
                  <td className="px-6 py-5 text-center text-gray-600 font-medium">{row.totalPegawai}</td>
                  <td className="px-6 py-5 text-center font-bold text-blue-600">{row.totalMengisi}</td>
                  <td className="px-6 py-5 text-center font-bold text-green-600 bg-green-50/10">{row.totalGabung}</td>
                  <td className="px-6 py-5 text-center text-xs font-bold text-green-700 bg-green-50/20">{row.percentGabung}%</td>
                  <td className="px-6 py-5 text-center font-bold text-amber-600 bg-amber-50/10">{row.totalPisah}</td>
                  <td className="px-6 py-5 text-center text-xs font-bold text-amber-700 bg-amber-50/20">{row.percentPisah}%</td>
                  <td className="px-6 py-5 text-center font-bold text-red-500">{row.belumMengisi}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full transition-all duration-1000" 
                          style={{ width: `${row.percentMengisi}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-700 w-10">{row.percentMengisi}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
              <tr>
                <td className="px-6 py-4">TOTAL KESELURUHAN</td>
                <td className="px-6 py-4 text-center">{aggregate.totalPegawai}</td>
                <td className="px-6 py-4 text-center text-blue-600">{aggregate.totalMengisi}</td>
                <td className="px-6 py-4 text-center text-green-600">{aggregate.totalGabung}</td>
                <td className="px-6 py-4 text-center text-green-600 bg-green-100/20">{aggregate.percentGabung}%</td>
                <td className="px-6 py-4 text-center text-amber-600">{aggregate.totalPisah}</td>
                <td className="px-6 py-4 text-center text-amber-600 bg-amber-100/20">{aggregate.percentPisah}%</td>
                <td className="px-6 py-4 text-center text-red-500">{aggregate.totalPegawai - aggregate.totalMengisi}</td>
                <td className="px-6 py-4 text-center text-gray-900">{aggregate.percent}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecapData;
