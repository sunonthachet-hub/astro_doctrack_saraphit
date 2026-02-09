import React from 'react';

export default function DashboardView({ documents, CONFIG }: any) {
  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-slate-800">📊 แดชบอร์ด</h3>
      <p className="text-slate-600">ยินดีต้อนรับสู่ {CONFIG.SYSTEM_TITLE}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{documents?.length || 0}</div>
          <div className="text-slate-600">เอกสารทั้งหมด</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-600">{documents?.filter((d: any) => d.permission === 'อนุมัติ').length || 0}</div>
          <div className="text-slate-600">อนุมัติแล้ว</div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-600">{documents?.filter((d: any) => d.permission === 'กำลังดำเนินการ').length || 0}</div>
          <div className="text-slate-600">กำลังดำเนินการ</div>
        </div>
      </div>
    </div>
  );
}
