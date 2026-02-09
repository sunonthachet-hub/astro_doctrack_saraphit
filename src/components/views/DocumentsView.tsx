import React from 'react';
import DocumentCard from '../DocumentCard';

interface DocumentsViewProps {
  documents: any[];
  filters: any;
  setFilters: (filters: any) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  ITEMS_PER_PAGE: number;
  currentUser: any;
  handleOpenDocModal: (doc: any) => void;
  handleDeleteDocument: (docId: string) => void;
  updateDocStatus: (docId: string, newStatus: string) => void;
  formatDate: (dateString: string) => string;
  getStatusInfo: (statusKey: string, statusValue: string) => any;
  isLoading: boolean;
  viewType?: string;
  onlyPending?: boolean;
  onPrint?: (filteredDocs: any[]) => void;
  onImportClick?: () => void;
  exportToGSheet?: (docs: any[]) => Promise<void> | void;
}

export default function DocumentsView({
  documents,
  filters,
  setFilters,
  currentPage,
  setCurrentPage,
  ITEMS_PER_PAGE,
  currentUser,
  handleOpenDocModal,
  handleDeleteDocument,
  updateDocStatus,
  formatDate,
  getStatusInfo,
  isLoading,
  viewType,
  onlyPending,
  onPrint,
  onImportClick,
  exportToGSheet
}: DocumentsViewProps) {
  const SUBJECT_GROUPS = ['ผู้บริหาร', 'กลุ่มสาระการงานอาชีพ', 'กลุ่มสาระคณิตศาสตร์', 'กลุ่มสาระภาษาต่างประเทศ', 'กลุ่มสาระภาษาไทย', 'กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี', 'กลุ่มสาระศิลปะ', 'กลุ่มสาระสังคมศึกษา', 'กลุ่มสาระสุขศึกษา-พละ', 'ฝ่ายสนับสนุนการสอน', 'ครูต่างชาติ', 'พนักงานราชการ', 'ลูกจ้างชั่วคราว', 'อื่นๆ'];
  const PERMISSION_STATUSES_DISPLAY = ['กำลังดำเนินการ', 'อนุมัติแล้ว', 'ไม่อนุมัติ'];

  const dateFrom = filters.dateFrom || '';
  const dateTo = filters.dateTo || '';
  const monthFilter = filters.monthFilter || '';

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (onlyPending && getStatusInfo('permission', doc.permission)?.text !== 'กำลังดำเนินการ') return false;
    const searchTerm = (filters.search || '').toLowerCase();
    const matches = !searchTerm ||
      doc.objective?.toLowerCase().includes(searchTerm) ||
      doc.proposer_name?.toLowerCase().includes(searchTerm) ||
      doc.doc_number?.toLowerCase().includes(searchTerm);

    const groupMatch = !filters.group || doc.department === filters.group;
    const proposerMatch = !filters.proposer || doc.proposer_name === filters.proposer;
    const permissionMatch = !filters.permission || getStatusInfo('permission', doc.permission)?.text === filters.permission;

    // Date filtering: monthFilter takes precedence, else dateFrom/dateTo range, else single date
    let dateMatch = true;
    if (monthFilter) {
      const docDate = new Date(doc.submission_date);
      const [y, m] = monthFilter.split('-').map(Number);
      dateMatch = docDate.getFullYear() === y && docDate.getMonth() + 1 === m;
    } else if (dateFrom || dateTo) {
      const docTime = new Date(doc.submission_date).getTime();
      if (dateFrom) dateMatch = dateMatch && docTime >= new Date(dateFrom).getTime();
      if (dateTo) dateMatch = dateMatch && docTime <= new Date(dateTo + 'T23:59:59').getTime();
    } else if (filters.date) {
      dateMatch = doc.submission_date === filters.date;
    }

    return matches && dateMatch && groupMatch && proposerMatch && permissionMatch;
  }).sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime());

  const handleMonthChange = (ym: string) => {
    if (!ym) {
      setFilters({ ...filters, monthFilter: '', dateFrom: '', dateTo: '' });
      return;
    }
    const parts = ym.split('-').map(Number);
    const y = parts[0] ?? new Date().getFullYear();
    const m = parts[1] ?? 1;
    const firstDay = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0);
    const lastDayStr = lastDay.toISOString().slice(0, 10);
    setFilters({ ...filters, monthFilter: ym, dateFrom: firstDay, dateTo: lastDayStr });
  };

  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetFilters = () => {
    setFilters({ ...filters, search: '', date: '', dateFrom: '', dateTo: '', monthFilter: '', group: '', proposer: '', permission: '' });
    setCurrentPage(1);
  };

  const buildPrintableHtml = (docs: any[]) => {
    const rows = docs.map(d => {
      return `
        <tr>
          <td>${formatDate(d.submission_date)}</td>
          <td style="white-space:normal; min-width: 100px;">${(d.proposer_name||'')}</td>
          <td style="white-space:normal; min-width: 90px;">${(d.work_group||'')}</td>
          <td style="white-space:normal; min-width: 180px;">${(d.objective||'')}</td>
          <td style="white-space:normal; min-width: 80px;">${(d.planning_status||'')}</td>
          <td style="white-space:normal; min-width: 80px;">${(d.procurement_status||'')}</td>
          <td style="white-space:normal; min-width: 80px;">${(d.finance_status||'')}</td>
          <td style="white-space:normal; min-width: 80px;">${(d.budget_status||'')}</td>
          <td style="white-space:normal; min-width: 90px;">${(d.permission||'')}</td>
          <td style="white-space:normal; min-width: 90px;">${formatDate(d.approval_date)}</td>
          <td style="white-space:normal; min-width: 100px;">${(d.notes1||'')}</td>
          <td style="white-space:normal; min-width: 100px;">${(d.notes2||'')}</td>
        </tr>
      `;
    }).join('');

    return `
      <html>
      <head>
        <meta charset="utf-8" />
        <title>พิมพ์เอกสาร</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: "Sarabun", Arial, sans-serif; padding: 10px; margin: 0; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 6px 5px; vertical-align: top; text-align: left; }
          th { background: #f7fafc; font-weight: bold; white-space: nowrap; }
          td { word-break: break-word; white-space: normal; }
          h2 { margin: 0 0 10px 0; font-size: 16px; }
        </style>
      </head>
      <body>
        <h2>รายการเอกสาร</h2>
        <table>
          <thead>
            <tr>
              <th style="min-width: 80px;">วันที่ส่ง</th>
              <th style="min-width: 100px;">ผู้เสนอ</th>
              <th style="min-width: 90px;">กลุ่มงาน</th>
              <th style="min-width: 180px;">วัตถุประสงค์</th>
              <th style="min-width: 80px;">แผนงาน</th>
              <th style="min-width: 80px;">พัสดุ</th>
              <th style="min-width: 80px;">การเงิน</th>
              <th style="min-width: 80px;">งบประมาณ</th>
              <th style="min-width: 90px;">สถานะ</th>
              <th style="min-width: 90px;">วันอนุมัติ</th>
              <th style="min-width: 100px;">หมายเหตุ1</th>
              <th style="min-width: 100px;">หมายเหตุ2</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `;
  };

  const handlePrint = (docs: any[]) => {
    try {
      const html = buildPrintableHtml(docs);
      const w = window.open('', '_blank');
      if (!w) { alert('ไม่สามารถเปิดหน้าต่างพิมพ์ได้ โปรดอนุญาตป็อปอัพ'); return; }
      w.document.open();
      w.document.write(html);
      w.document.close();
      // give browser a short moment to render
      setTimeout(() => { w.print(); }, 500);
    } catch (e) { console.error(e); alert('เกิดข้อผิดพลาดขณะพิมพ์'); }
  };


  return (
    <div className="space-y-6">
      {/* Search & Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 font-['Sarabun']">
        <h3 className="text-lg font-bold text-slate-800 mb-4">🔍 ค้นหาและกรอง</h3>
        
        {/* ช่องค้นหาด้านบน */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="ค้นหาจากวัตถุประสงค์, ชื่อผู้เสนอ, เลขที่เอกสาร..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* ตัวกรอง */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">กลุ่มสาระ</label>
            <select
              value={filters.group || ''}
              onChange={(e) => setFilters({ ...filters, group: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500"
            >
              <option value="">ทุกกลุ่มสาระ</option>
              {SUBJECT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">สถานะอนุมัติ</label>
            <select
              value={filters.permission || ''}
              onChange={(e) => setFilters({ ...filters, permission: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500"
            >
              <option value="">ทุกสถานะ</option>
              {PERMISSION_STATUSES_DISPLAY.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">วันที่เสนอ (จาก)</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, monthFilter: '' })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">วันที่เสนอ (ถึง)</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, monthFilter: '' })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">กรองตามเดือน</label>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500"
            />
          </div>
        </div>

        {/* ปุ่ม ค้นหา, พิมพ์, นำเข้าข้อมูล (ชิดซ้าย) และ ล้างตัวกรอง (ชิดขวา) */}
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(1)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
            >
              ค้นหา
            </button>
            <button
              onClick={() => handlePrint(filteredDocuments)}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg transition"
            >
              พิมพ์เอกสาร
            </button>
            {/* Import button */}
            {onImportClick && (
              <button
                onClick={() => onImportClick()}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition"
              >
                นำเข้าข้อมูล
              </button>
            )}
            {/* Export to Google Sheet */}
            {exportToGSheet && (
              <button
                onClick={() => exportToGSheet(filteredDocuments)}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition"
              >
                ส่งออกไปยัง Google Sheet
              </button>
            )}
          </div>
          <div>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>

      </div>

      {/* Results info */}
      <div className="text-sm text-slate-600">
        พบ <span className="font-bold text-slate-800">{filteredDocuments.length}</span> เอกสาร
        {filteredDocuments.length > ITEMS_PER_PAGE && ` (หน้า ${currentPage}/${totalPages})`}
      </div>

      {/* Documents Grid */}
      {paginatedDocuments.length > 0 ? (
        <div className="grid gap-6">
          {viewType === 'approvals' ? (
            paginatedDocuments.map(doc => (
              <div key={doc.doc_number} className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200">
                <div>
                  <div className="font-medium text-slate-800">{doc.objective}</div>
                  <div className="text-sm text-slate-500">{doc.doc_number} • {doc.proposer_name} • {formatDate(doc.submission_date)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateDocStatus(doc.doc_number, 'อนุมัติ')} className="px-3 py-2 bg-green-600 text-white rounded-lg">อนุมัติ</button>
                  <button onClick={() => updateDocStatus(doc.doc_number, 'ไม่อนุมัติ')} className="px-3 py-2 bg-red-600 text-white rounded-lg">ไม่อนุมัติ</button>
                </div>
              </div>
            ))
          ) : (
            paginatedDocuments.map(doc => (
              <DocumentCard
                key={doc.doc_number}
                doc={doc}
                onEdit={handleOpenDocModal}
                onDelete={handleDeleteDocument}
                onStatusChange={(currentUser?.role === 'Director' || currentUser?.role === 'Admin') ? updateDocStatus : undefined}
                formatDate={formatDate}
                getStatusInfo={getStatusInfo}
                isAdmin={currentUser?.role === 'Admin'}
                isDirector={currentUser?.role === 'Director'}
              />
            ))
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <span className="material-icons text-6xl text-slate-300 block mb-4">folder_open</span>
          <p className="text-slate-600 font-medium">ไม่พบเอกสาร</p>
          <p className="text-sm text-slate-500 mt-2">ลองเปลี่ยนชุดตัวกรองของคุณ</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-slate-200 disabled:opacity-50 rounded-lg hover:bg-slate-300"
          >
            ← ก่อนหน้า
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg font-medium ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-slate-200 disabled:opacity-50 rounded-lg hover:bg-slate-300"
          >
            ถัดไป →
          </button>
        </div>
      )}
    </div>
  );
}
