import React, { useMemo, useState } from 'react';

interface DashboardViewProps {
  documents: any[];
  CONFIG: any;
}

export default function DashboardView({ documents, CONFIG }: DashboardViewProps) {
  const currentBuddhistYear = new Date().getFullYear() + 543;
  const [selectedYear, setSelectedYear] = useState<number>(CONFIG?.REPORT_YEAR || currentBuddhistYear);

  const years = useMemo(() => {
    const list: number[] = [];
    const start = currentBuddhistYear;
    for (let i = 0; i < 6; i++) list.push(start - i);
    return list;
  }, [currentBuddhistYear]);

  const docsForYear = useMemo(() => {
    return documents.filter(d => {
      try {
        const dt = new Date(d.submission_date);
        const by = dt.getFullYear() + 543;
        return by === selectedYear;
      } catch { return false; }
    });
  }, [documents, selectedYear]);

  const normalizePermission = (p: string) => {
    if (!p) return '';
    if (String(p).includes('อนุ')) return 'approved';
    if (String(p).includes('กำลัง')) return 'pending';
    if (String(p).includes('ไม่')) return 'rejected';
    return String(p);
  };

  const stats = useMemo(() => {
    const total = docsForYear.length;
    const approved = docsForYear.filter(d => normalizePermission(d.permission) === 'approved').length;
    const pending = docsForYear.filter(d => normalizePermission(d.permission) === 'pending').length;
    const rejected = docsForYear.filter(d => normalizePermission(d.permission) === 'rejected').length;

    return { total, approved, pending, rejected };
  }, [docsForYear]);

  const statusByDepartment = useMemo(() => {
    const departments = [...new Set(docsForYear.map(d => d.department))];
    return departments.reduce((acc, dept) => {
      const deptDocs = docsForYear.filter(d => d.department === dept);
      acc[dept] = {
        total: deptDocs.length,
        approved: deptDocs.filter(d => normalizePermission(d.permission) === 'approved').length,
      };
      return acc;
    }, {} as Record<string, any>);
  }, [docsForYear]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center py-8">
        <img src={CONFIG.SCHOOL_LOGO_URL} alt="Logo" className="w-20 h-20 mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2" style={{fontFamily: 'Sarabun'}}>{CONFIG.SCHOOL_NAME}</h1>
        <p className="text-slate-600" style={{fontFamily: 'Sarabun'}}>{CONFIG.SYSTEM_TITLE}</p>
      </div>

      {/* Year selector */}
      <div className="flex items-center justify-end gap-3">
        <label className="text-sm text-slate-600">แสดงสถิติตามปี พ.ศ.</label>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="p-2 rounded-lg border border-slate-300">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Key Stats - New Format */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-200 hover:shadow-xl transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold mb-1" style={{fontFamily: 'Sarabun'}}>เอกสารทั้งหมด</p>
              <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <span className="material-icons text-4xl text-blue-400">receipt_long</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-yellow-200 hover:shadow-xl transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold mb-1" style={{fontFamily: 'Sarabun'}}>กำลังดำเนินการ</p>
              <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <span className="material-icons text-4xl text-yellow-400">hourglass_top</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-200 hover:shadow-xl transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold mb-1" style={{fontFamily: 'Sarabun'}}>อนุมัติแล้ว</p>
              <p className="text-4xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <span className="material-icons text-4xl text-green-400">verified</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-200 hover:shadow-xl transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold mb-1" style={{fontFamily: 'Sarabun'}}>ไม่อนุมัติ</p>
              <p className="text-4xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <span className="material-icons text-4xl text-red-400">cancel</span>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
        <h3 className="text-2xl font-bold text-slate-800 mb-6" style={{fontFamily: 'Sarabun'}}>📖 คำอธิบายสถานะ</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* 4F Status */}
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-4" style={{fontFamily: 'Sarabun'}}>สถานะ 4 ฝ่าย:</h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-2xl">⏳</span>
                <div>
                  <p className="font-semibold text-slate-800" style={{fontFamily: 'Sarabun'}}>กำลังดำเนินการ</p>
                  <p className="text-sm text-slate-600" style={{fontFamily: 'Sarabun'}}>เอกสารอยู่ระหว่างการตรวจสอบในขั้นตอนต่างๆ</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-slate-800" style={{fontFamily: 'Sarabun'}}>ผ่านการตรวจสอบ</p>
                  <p className="text-sm text-slate-600" style={{fontFamily: 'Sarabun'}}>เอกสารผ่านการตรวจสอบจากฝ่ายนี้แล้ว</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">⏭️</span>
                <div>
                  <p className="font-semibold text-slate-800" style={{fontFamily: 'Sarabun'}}>ข้ามขั้นตอนนี้</p>
                  <p className="text-sm text-slate-600" style={{fontFamily: 'Sarabun'}}>เอกสารไม่จำเป็นต้องผ่านการตรวจสอบในแผนกนี้</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-slate-800" style={{fontFamily: 'Sarabun'}}>ไม่ผ่าน-แก้ไข</p>
                  <p className="text-sm text-slate-600" style={{fontFamily: 'Sarabun'}}>เอกสารไม่ผ่านการตรวจสอบ ต้องมีการแก้ไข</p>
                </div>
              </div>
            </div>
          </div>

          {/* Final Status */}
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-4" style={{fontFamily: 'Sarabun'}}>สถานะอนุมัติสุดท้าย:</h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-2xl">✔️</span>
                <div>
                  <p className="font-semibold text-slate-800" style={{fontFamily: 'Sarabun'}}>อนุมัติ</p>
                  <p className="text-sm text-slate-600" style={{fontFamily: 'Sarabun'}}>เอกสารได้รับการอนุมัติขั้นสุดท้ายแล้ว</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="font-semibold text-slate-800" style={{fontFamily: 'Sarabun'}}>ไม่อนุมัติ</p>
                  <p className="text-sm text-slate-600" style={{fontFamily: 'Sarabun'}}>เอกสารไม่ได้รับการอนุมัติขั้นสุดท้าย</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status by Department */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6" style={{fontFamily: 'Sarabun'}}>📊 สถานะตามกลุ่มสาระ</h2>
        <div className="grid gap-4">
          {Object.entries(statusByDepartment).map(([dept, status]: [string, any]) => (
            <div key={dept} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-1" style={{fontFamily: 'Sarabun'}}>{dept}</h3>
                <div className="w-full bg-slate-300 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(status.approved / status.total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className="text-2xl font-bold text-slate-800">{status.approved}</div>
                <div className="text-xs text-slate-600" style={{fontFamily: 'Sarabun'}}>จาก {status.total}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6" style={{fontFamily: 'Sarabun'}}>📄 เอกสารล่าสุด</h2>
        <div className="space-y-3">
          {[...documents].sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime()).slice(0, 5).map(doc => (
            <div key={doc.doc_number} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
              <div className="flex-1">
                <p className="font-semibold text-slate-800 line-clamp-1" style={{fontFamily: 'Sarabun'}}>{doc.objective}</p>
                <p className="text-xs text-slate-600" style={{fontFamily: 'Sarabun'}}>{doc.proposer_name} • {doc.doc_number}</p>
              </div>
              <div className="ml-4 text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  doc.permission === 'อนุมัติ' ? 'bg-green-100 text-green-800' :
                  doc.permission === 'กำลังดำเนินการ' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`} style={{fontFamily: 'Sarabun'}}>
                  {doc.permission === 'อนุมัติ' ? '✅' : doc.permission === 'กำลังดำเนินการ' ? '⏳' : '❌'} {doc.permission}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Only on Dashboard */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-2xl p-8 text-center border-t-4 border-blue-500 mt-12">
        <p className="font-bold mb-2" style={{fontFamily: 'Sarabun'}}>👨‍💻 ผู้พัฒนาระบบ</p>
        <p className="text-sm mb-4" style={{fontFamily: 'Sarabun'}}>นายทักษิณพัฒน์ ศรีขวาชัย | 086-2371771</p>
        <p className="text-sm mb-6" style={{fontFamily: 'Sarabun'}}>ศุภณันทเชษฐ์ สุขกุลพัชญ์ | 085-4545104</p>
        <p className="text-xs border-t border-slate-500 pt-4 text-slate-300" style={{fontFamily: 'Sarabun'}}>© 2025 งานเทคโนโลยีสารสนเทศ (ICT) โรงเรียนสารคามพิทยาคม</p>
      </div>
    </div>
  );
}
