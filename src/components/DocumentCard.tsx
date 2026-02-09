import React from 'react';

interface DocumentCardProps {
  doc: any;
  onEdit: (doc: any) => void;
  onDelete: (docId: string) => void;
  onStatusChange?: (docId: string, newStatus: string) => void | undefined;
  formatDate: (dateString: string) => string;
  getStatusInfo: (statusKey: string, statusValue: string) => any;
  isAdmin?: boolean;
  isDirector?: boolean;
  FOUR_F_STATUSES_DISPLAY?: string[];
}

export default function DocumentCard({
  doc,
  onEdit,
  onDelete,
  onStatusChange,
  formatDate,
  getStatusInfo,
  isAdmin,
  isDirector,
  FOUR_F_STATUSES_DISPLAY
}: DocumentCardProps) {
  const permissionStatus = getStatusInfo('permission', doc.permission);
  const statusColors: any = {
    'green': 'bg-green-100 text-green-800 border-green-300',
    'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'red': 'bg-red-100 text-red-800 border-red-300'
  };

  const fourF = [
    { name: 'แผนงาน', value: doc.planning_status },
    { name: 'พัสดุ', value: doc.procurement_status },
    { name: 'การเงิน', value: doc.finance_status },
    { name: 'งบประมาณ', value: doc.budget_status }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 overflow-hidden font-['Sarabun']">
      <div className="p-5 space-y-3">
        {/* บรรทัด 1: วัตถุประสงค์ */}
        <div>
          <span className="text-slate-500 text-sm font-medium">วัตถุประสงค์: </span>
          <span className="text-slate-800 font-semibold">{doc.objective || 'ไม่ระบุวัตถุประสงค์'}</span>
        </div>

        {/* บรรทัด 2: ผู้เสนอ กลุ่มสาระ กลุ่มงาน */}
        <div className="text-slate-700 text-sm flex flex-wrap gap-x-4 gap-y-1">
          <span><span className="text-slate-500">ผู้เสนอ:</span> {doc.proposer_name}</span>
          <span><span className="text-slate-500">กลุ่มสาระ</span> {doc.department}</span>
          <span><span className="text-slate-500">กลุ่มงาน</span> {doc.work_group}</span>
        </div>

        {/* บรรทัด 3: วันที่เสนอ เลขที่ */}
        <div className="text-slate-700 text-sm flex flex-wrap gap-x-6 gap-y-1">
          <span><span className="text-slate-500">วันที่เสนอ:</span> {formatDate(doc.submission_date)}</span>
          <span><span className="text-slate-500">เลขที่:</span> {doc.doc_number}</span>
        </div>

        {/* บรรทัด 4: แผนงาน พัสดุ การเงิน งบประมาณ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {fourF.map(({ name, value }) => {
            const info = getStatusInfo('4f', value);
            return (
              <div key={name} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600 text-sm font-medium">{name}</span>
                <span className="text-slate-800 text-sm">{info.text}</span>
              </div>
            );
          })}
        </div>

        {/* บรรทัด 5: หมายเหตุ (ถ้ามี) */}
        {(doc.notes1 || doc.notes2) && (
          <div className="space-y-1 text-sm">
            {doc.notes1 && (
              <p><span className="text-slate-500">หมายเหตุแก้ไข:</span> <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">{doc.notes1}</span></p>
            )}
            {doc.notes2 && (
              <p><span className="text-slate-500">หมายเหตุเพิ่มเติม:</span> <span className="text-slate-700">{doc.notes2}</span></p>
            )}
          </div>
        )}

        {/* สถานะ + ปุ่ม */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 status-description-card">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm">สถานะ:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[permissionStatus.className] || 'bg-gray-100'}`}>
              {permissionStatus.text}
            </span>
            {(isAdmin || isDirector) && onStatusChange && (
              <select
                value={doc.permission || ''}
                onChange={(e) => onStatusChange(doc.doc_number, e.target.value)}
                className="text-sm px-2 py-1 border border-slate-300 rounded-lg bg-white text-slate-700"
              >
                <option value="">-- อนุมัติ --</option>
                <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                <option value="อนุมัติ">อนุมัติ</option>
                <option value="ไม่อนุมัติ">ไม่อนุมัติ</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            {doc.attachment ? (
              <a href={doc.attachment.file_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200">
                <span className="material-icons-outlined text-base">attachment</span>
                แนบไฟล์
              </a>
            ) : (
              <span className="text-xs text-slate-400 italic">ไม่มีไฟล์แนบ</span>
            )}
            <button onClick={() => onEdit(doc)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200">
              <span className="material-icons-outlined text-base">edit</span>แก้ไข
            </button>
            <button onClick={() => onDelete(doc.doc_number)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200">
              <span className="material-icons-outlined text-base">delete</span>ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
