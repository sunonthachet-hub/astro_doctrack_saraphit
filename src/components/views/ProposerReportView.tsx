import React, { useMemo, useState } from 'react';

interface Staff {
  id: string;
  fullName: string;
  Department: string;
  email: string;
}

interface ProposerReportViewProps {
  documents: any[];
  staff: Staff[];
  REPORT_YEAR: number;
  SUBJECT_GROUPS: string[];
  onOpenStaffModal: (staff: any) => void;
  onDeleteStaff?: (id: string) => void;
}

export default function ProposerReportView({
  documents,
  staff,
  REPORT_YEAR,
  SUBJECT_GROUPS,
  onOpenStaffModal,
  onDeleteStaff
}: ProposerReportViewProps) {
  const [showStaffPanel, setShowStaffPanel] = useState(false);
  // Filter documents for REPORT_YEAR (พุทธศักราช) - convert to CE: year - 543
  const ceYear = REPORT_YEAR - 543;
  const docsInYear = useMemo(() => {
    return documents.filter(doc => {
      if (!doc.submission_date) return false;
      const d = new Date(doc.submission_date);
      return d.getFullYear() === ceYear;
    });
  }, [documents, ceYear]);

  // Stats per proposer, grouped by department (กลุ่มสาระ)
  const proposerStats = useMemo(() => {
    const byProposer: Record<string, { count: number; department: string }> = {};
    docsInYear.forEach(doc => {
      const name = doc.proposer_name || 'ไม่ระบุ';
      if (!byProposer[name]) {
        byProposer[name] = { count: 0, department: doc.department || 'อื่นๆ' };
      }
      byProposer[name].count += 1;
    });
    return Object.entries(byProposer)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [docsInYear]);

  // Staff grouped by กลุ่มสาระ
  const staffByDept = useMemo(() => {
    const grouped: Record<string, Staff[]> = {};
    staff.forEach(s => {
      const dept = s.Department || 'อื่นๆ';
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(s);
    });
    return SUBJECT_GROUPS.filter(g => grouped[g]).map(g => ({ dept: g, list: grouped[g] }))
      .concat(
        Object.entries(grouped)
          .filter(([dept]) => !SUBJECT_GROUPS.includes(dept))
          .map(([dept, list]) => ({ dept, list }))
      );
  }, [staff, SUBJECT_GROUPS]);

  // Group by กลุ่มสาระ
  const byDepartment = useMemo(() => {
    const grouped: Record<string, typeof proposerStats> = {};
    proposerStats.forEach(p => {
      const dept = p.department || 'อื่นๆ';
      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push(p);
    });
    // Sort departments by SUBJECT_GROUPS order
    return SUBJECT_GROUPS.filter(g => grouped[g]).map(g => ({ dept: g, list: grouped[g] }))
      .concat(
        Object.entries(grouped)
          .filter(([dept]) => !SUBJECT_GROUPS.includes(dept))
          .map(([dept, list]) => ({ dept, list }))
      );
  }, [proposerStats, SUBJECT_GROUPS]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">📊 รายงานผู้เสนอ</h2>
          <p className="text-slate-600 mt-1">สถิติผู้เสนอเอกสาร ปี {REPORT_YEAR} แยกตามกลุ่มสาระ</p>
        </div>
        <button
          onClick={() => setShowStaffPanel(!showStaffPanel)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition"
        >
          <span className="material-icons-outlined">people</span>
          {showStaffPanel ? 'ซ่อนการจัดการบุคลากร' : 'จัดการบุคลากร'}
        </button>
      </div>

      {/* Staff management panel - แบ่งตามกลุ่มสาระ */}
      {showStaffPanel && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">จัดการบุคลากร (แบ่งตามกลุ่มสาระ)</h3>
            <button
              onClick={() => onOpenStaffModal(null)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
            >
              + เพิ่มบุคลากร
            </button>
          </div>
          <div className="space-y-6">
            {staffByDept.map(({ dept, list }) => (
              <div key={dept} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h4 className="font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">{dept}</h4>
                <div className="grid gap-2">
                  {list.map(s => (
                    <div
                      key={s.id}
                      className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-slate-100"
                    >
                      <div>
                        <span className="font-medium text-slate-800">{s.fullName}</span>
                        <span className="text-sm text-slate-500 ml-2">({s.email})</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onOpenStaffModal(s)} className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded">แก้ไข</button>
                        {onDeleteStaff && (
                          <button onClick={() => onDeleteStaff(s.id)} className="px-3 py-1 text-red-600 hover:bg-red-50 rounded">ลบ</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">สถิติตามกลุ่มสาระเรียนรู้</h3>
        <div className="space-y-6">
          {byDepartment.map(({ dept, list }) => (
            <div key={dept} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="font-bold text-slate-800 mb-3 text-base border-b border-slate-200 pb-2">{dept}</h4>
              <div className="grid gap-2">
                {list.map(p => (
                  <div
                    key={p.name}
                    className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-slate-100"
                  >
                    <span className="font-medium text-slate-800">{p.name}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold">{p.count} เอกสาร</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {proposerStats.length === 0 && (
          <p className="text-center text-slate-500 py-8">ไม่พบข้อมูลผู้เสนอในปี {REPORT_YEAR}</p>
        )}
      </div>
    </div>
  );
}
