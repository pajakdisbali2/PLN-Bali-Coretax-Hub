
import React, { useMemo } from 'react';
import { Submission } from '../types';
import { UNIT_TOTALS } from '../constants';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

interface RecapDataProps {
  submissions: Submission[];
}

const RecapData: React.FC<RecapDataProps> = ({ submissions }) => {
  const stats = useMemo(() => {
    return UNIT_TOTALS.map(unit => {
      const count = submissions.filter(s => s.unit === unit.name).length;
      return {
        ...unit,
        totalMengisi: count,
        percentMengisi: ((count / unit.totalPegawai) * 100).toFixed(1),
        belumMengisi: unit.totalPegawai - count,
        percentBelum: (((unit.totalPegawai - count) / unit.totalPegawai) * 100).toFixed(1),
      };
    });
  }, [submissions]);

  const aggregate = useMemo(() => {
    const totalP = stats.reduce((acc, curr) => acc + curr.totalPegawai, 0);
    const totalM = stats.reduce((acc, curr) => acc + curr.totalMengisi, 0);
    return {
      totalPegawai: totalP,
      totalMengisi: totalM,
      percent: ((totalM / totalP) * 100).toFixed(1)
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-sm text-gray-500 font-medium">Sudah Mengisi</p>
            <p className="text-2xl font-bold">{aggregate.totalMengisi}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl"><Clock /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Belum Mengisi</p>
            <p className="text-2xl font-bold">{aggregate.totalPegawai - aggregate.totalMengisi}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><TrendingUp /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sisa Persentase</p>
            <p className="text-2xl font-bold">{(100 - parseFloat(aggregate.percent)).toFixed(1)}%</p>
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
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Total Pegawai</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Sudah Mengisi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">% Mengisi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Belum Mengisi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">% Belum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.map((row) => (
                <tr key={row.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 font-bold text-gray-900">{row.name}</td>
                  <td className="px-6 py-5 text-center text-gray-600 font-medium">{row.totalPegawai}</td>
                  <td className="px-6 py-5 text-center font-bold text-green-600">{row.totalMengisi}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full transition-all duration-1000" 
                          style={{ width: `${row.percentMengisi}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-12">{row.percentMengisi}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-red-500">{row.belumMengisi}</td>
                  <td className="px-6 py-5 text-center font-bold text-gray-400">{row.percentBelum}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecapData;
