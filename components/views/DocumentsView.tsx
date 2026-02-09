import React from 'react';

export default function DocumentsView({ documents, filters, setFilters, currentPage, setCurrentPage, ITEMS_PER_PAGE, currentUser, handleOpenDocModal, handleDeleteDocument, updateDocStatus, formatDate, getStatusInfo, isLoading, viewType }: any) {
  const filtered = documents.filter((d: any) => {
    if (!filters.search) return true;
    return d.objective?.toLowerCase().includes(filters.search.toLowerCase()) ||
           d.proposer_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
           d.doc_number?.toLowerCase().includes(filters.search.toLowerCase());
  });

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-slate-800">📋 {viewType === 'approvals' ? 'อนุมัติเอกสาร' : 'ติดตามเอกสาร'}</h3>
        {currentUser?.role === 'Admin' && <button onClick={() => handleOpenDocModal(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ เพิ่มเอกสาร</button>}
      </div>

      <div className="bg-white p-4 rounded-lg space-y-4">
        <input
          type="text"
          placeholder="ค้นหาเอกสาร..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          className="w-full p-2 rounded-lg border border-slate-300"
        />

        {paginated.length > 0 ? (
          <div className="space-y-2">
            {paginated.map((doc: any) => (
              <div key={doc.doc_number} className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{doc.doc_number}</div>
                    <div className="text-sm text-slate-600">{doc.objective}</div>
                    <div className="text-xs text-slate-500">{formatDate(doc.submission_date)} - {doc.proposer_name}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenDocModal(doc)} className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded text-sm">แก้ไข</button>
                    {currentUser?.role === 'Director' && (
                      <select value={doc.permission} onChange={(e) => updateDocStatus(doc.doc_number, e.target.value)} className="text-sm p-1 rounded border border-slate-300">
                        <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                        <option value="อนุมัติ">อนุมัติ</option>
                        <option value="ไม่อนุมัติ">ไม่อนุมัติ</option>
                      </select>
                    )}
                    <button onClick={() => handleDeleteDocument(doc.doc_number)} className="px-3 py-1 text-red-600 hover:bg-red-100 rounded text-sm">ลบ</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-600 py-8">ไม่มีเอกสาร</div>
        )}
      </div>
    </div>
  );
}
