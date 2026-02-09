import React from 'react';

interface ActivityLog {
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

interface AdminMenuViewProps {
  activityLog: ActivityLog[];
  onAddDoc: () => void;
  onImport?: () => void;
  onOpenManagers?: () => void;
}

// Format timestamp for display in Thai
function formatActivityDate(ts: string): string {
  try {
    const d = new Date(ts);
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  } catch {
    return ts;
  }
}

export default function AdminMenuView({ activityLog, onAddDoc }: AdminMenuViewProps) {
  // Filter: last 10 days, max 30 items
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  const filteredLog = activityLog
    .filter(a => {
      try {
        const t = new Date(a.timestamp);
        return t >= tenDaysAgo;
      } catch { return false; }
    })
    .slice(0, 30);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">เมนูระบบฝ่ายบริหาร</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onAddDoc}
          className="flex items-center gap-3 p-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg transition"
        >
          <span className="material-icons text-2xl">add</span>
          เพิ่มเอกสารติดตามฯ
        </button>
        <button
          disabled
          className="flex items-center gap-3 p-4 rounded-xl bg-slate-300 text-slate-500 cursor-not-allowed font-medium"
        >
          <span className="material-icons text-2xl">description</span>
          เพิ่มเอกสารทะเบียนติดตามหนี้เงินยืม
        </button>
        <button
          onClick={() => onImport && onImport()}
          className="flex items-center gap-3 p-4 rounded-xl bg-white text-slate-700 hover:bg-slate-50 font-medium"
        >
          <span className="material-icons text-2xl">upload_file</span>
          นำเข้าข้อมูล
        </button>
        <button
          onClick={() => onOpenManagers && onOpenManagers()}
          className="flex items-center gap-3 p-4 rounded-xl bg-white text-slate-700 hover:bg-slate-50 font-medium md:col-span-2"
        >
          <span className="material-icons text-2xl">people</span>
          รายชื่อผู้จัดการเว็บ
        </button>
      </div>

      {/* Activity Log Card - ความเคลื่อนไหวในเว็บ */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">ความเคลื่อนไหวในเว็บ (ย้อนหลัง 10 วัน)</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLog.length > 0 ? (
            filteredLog.map((item, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100"
              >
                <span className="text-xs text-slate-500 flex-shrink-0">{formatActivityDate(item.timestamp)}</span>
                <span className="font-medium text-slate-700">{item.user}</span>
                <span className="text-slate-600">{item.action}</span>
                {item.details && <span className="text-sm text-slate-500 truncate">{item.details}</span>}
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-8">ยังไม่มีความเคลื่อนไหวใน 10 วันที่ผ่านมา</p>
          )}
        </div>
      </div>
    </div>
  );
}
