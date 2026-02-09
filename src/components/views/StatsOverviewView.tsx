import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';

interface StatsOverviewViewProps {
  documents: any[];
  CONFIG: any;
}

export default function StatsOverviewView({ documents, CONFIG }: StatsOverviewViewProps) {
  const stats = useMemo(() => {
    const total = documents.length;
    const approved = documents.filter(d => d.permission === 'อนุมัติ').length;
    const pending = documents.filter(d => d.permission === 'กำลังดำเนินการ').length;
    const rejected = documents.filter(d => d.permission === 'ไม่อนุมัติ').length;
    return { total, approved, pending, rejected };
  }, [documents]);

  const chartData = useMemo(() => ({
    labels: ['อนุมัติ', 'กำลังดำเนินการ', 'ไม่อนุมัติ'],
    datasets: [{
      data: [stats.approved, stats.pending, stats.rejected],
      backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
      borderWidth: 0
    }]
  }), [stats]);

  const byDepartment = useMemo(() => {
    const depts = [...new Set(documents.map(d => d.department))].filter(Boolean);
    return depts.map(dept => {
      const deptDocs = documents.filter(d => d.department === dept);
      return {
        department: dept,
        total: deptDocs.length,
        approved: deptDocs.filter(d => d.permission === 'อนุมัติ').length,
        pending: deptDocs.filter(d => d.permission === 'กำลังดำเนินการ').length,
        rejected: deptDocs.filter(d => d.permission === 'ไม่อนุมัติ').length
      };
    }).sort((a, b) => b.total - a.total);
  }, [documents]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800">📈 สถิติและภาพรวม</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-200 stats-card">
          <p className="text-slate-600 text-sm font-semibold mb-1">เอกสารทั้งหมด</p>
          <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-200 stats-card">
          <p className="text-slate-600 text-sm font-semibold mb-1">กำลังดำเนินการ</p>
          <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200 stats-card">
          <p className="text-slate-600 text-sm font-semibold mb-1">อนุมัติแล้ว</p>
          <p className="text-4xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-200 stats-card">
          <p className="text-slate-600 text-sm font-semibold mb-1">ไม่อนุมัติ</p>
          <p className="text-4xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Pie Chart - สถานะอนุมัติ */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">กราฟสถานะอนุมัติ</h3>
        <div className="max-w-xs mx-auto">
          <Doughnut
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { position: 'bottom' }
              }
            }}
          />
        </div>
      </div>

      {/* สถิติตามกลุ่มสาระเรียนรู้ */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">สถิติตามกลุ่มสาระเรียนรู้</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-bold text-slate-800">กลุ่มสาระ</th>
                <th className="text-center py-3 px-4 font-bold text-slate-800">ทั้งหมด</th>
                <th className="text-center py-3 px-4 font-bold text-green-700">อนุมัติ</th>
                <th className="text-center py-3 px-4 font-bold text-yellow-700">กำลังดำเนินการ</th>
                <th className="text-center py-3 px-4 font-bold text-red-700">ไม่อนุมัติ</th>
              </tr>
            </thead>
            <tbody>
              {byDepartment.map(row => (
                <tr key={row.department} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">{row.department}</td>
                  <td className="py-3 px-4 text-center">{row.total}</td>
                  <td className="py-3 px-4 text-center text-green-600">{row.approved}</td>
                  <td className="py-3 px-4 text-center text-yellow-600">{row.pending}</td>
                  <td className="py-3 px-4 text-center text-red-600">{row.rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
