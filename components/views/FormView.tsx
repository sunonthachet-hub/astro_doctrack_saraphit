import React from 'react';

export default function FormView({ documents, staff, SUBJECT_GROUPS, WORK_GROUPS, FOUR_F_STATUSES_DISPLAY, handleOpenDocModal, isLoading }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-slate-800">📝 ฟอร์มเสนอเอกสาร</h3>
      <button onClick={() => handleOpenDocModal(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        + เพิ่มเอกสารใหม่
      </button>
      <div className="bg-white p-6 rounded-lg text-slate-600">
        <p>สามารถเพิ่มเอกสารใหม่โดยคลิกปุ่มข้างบน</p>
      </div>
    </div>
  );
}
