import React from 'react';

interface FormViewProps {
  documents?: any[];
  staff?: any[];
  SUBJECT_GROUPS?: string[];
  WORK_GROUPS?: string[];
  FOUR_F_STATUSES_DISPLAY?: string[];
  handleOpenDocModal?: (doc: any) => void;
  isLoading?: boolean;
}

export default function FormView({
  documents,
  staff,
  SUBJECT_GROUPS,
  WORK_GROUPS,
  FOUR_F_STATUSES_DISPLAY,
  handleOpenDocModal,
  isLoading
}: FormViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold mb-2">📝 ฟอร์มเสนอเอกสาร</h2>
        <p className="text-blue-100">คลิกปุ่มด้านล่างเพื่อเพิ่มเอกสารใหม่</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 text-center">
        <p className="text-slate-600 mb-6">ยังไม่มีเอกสารอยู่ในรูปแบบ Draft</p>
        <button
          onClick={() => handleOpenDocModal?.(null)}
          className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105"
        >
          <span className="material-icons">add</span>
          เพิ่มเอกสารใหม่
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">💡 วิธีการใช้</h3>
        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
          <li>คลิกปุ่ม "เพิ่มเอกสารใหม่" เพื่อสร้างแบบฟอร์ม</li>
          <li>กรอกข้อมูลเอกสารทั้งหมดให้ครบถ้วน</li>
          <li>แนบไฟล์สนับสนุน (ถ้ามี)</li>
          <li>คลิก "บันทึก" เพื่อส่งไปยังผู้บริหาร</li>
        </ul>
      </div>
    </div>
  );
}
