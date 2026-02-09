
// FIX: Import the 'React' namespace to resolve errors with types like React.FormEvent.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChartData } from 'chart.js';
// FIX: Change to a value import to register Chart.js components.
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import DashboardView from './views/DashboardView';
import DocumentsView from './views/DocumentsView';
import FormView from './views/FormView';
import ImportView from './views/ImportView';
import ProposerReportView from './views/ProposerReportView';
import AdminMenuView from './views/AdminMenuView';
import GuideView from './views/GuideView';

// == IMPORTANT SETUP ==
// 1. Deploy the `Code.gs` script as a Web App.
// 2. Set "Who has access" to "Anyone".
// 3. Copy the Web App URL and paste it below.
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbxRgLQZqCQCNCIHc5jloVreJkp2Uf4UU2oCg1mMGy0dvt7mIAx_ez_--4V6-TCSQW8ZJw/exec'; // <--- PASTE YOUR WEB APP URL HERE

// ===== CONFIGURATION =====
const CONFIG = {
    SCHOOL_NAME: "โรงเรียนสารคามพิทยาคม",
    SCHOOL_YEAR: "(ปีการศึกษา 2567-2569)",
    SCHOOL_LOGO_URL: "https://www.spk.ac.th/home/wp-content/uploads/2026/01/spk-logo-png-new.png",
    SYSTEM_TITLE: "ระบบติดตามเอกสารกลุ่มบริหารงบประมาณ",
    REPORT_YEAR: 2569,
};

const SUBJECT_GROUPS = ['ผู้บริหาร', 'กลุ่มสาระการงานอาชีพ', 'กลุ่มสาระคณิตศาสตร์', 'กลุ่มสาระภาษาต่างประเทศ', 'กลุ่มสาระภาษาไทย', 'กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี', 'กลุ่มสาระศิลปะ', 'กลุ่มสาระสังคมศึกษา', 'กลุ่มสาระสุขศึกษา-พละ', 'ฝ่ายสนับสนุนการสอน', 'ครูต่างชาติ', 'พนักงานราชการ', 'ลูกจ้างชั่วคราว', 'อื่นๆ'];
const WORK_GROUPS = ['วิชาการ', 'บริหารทั่วไป', 'งบประมาณ', 'บุคคล', 'อื่นๆ'];
const PERMISSION_STATUSES = {
  pending: { text: 'กำลังดำเนินการ', className: 'yellow' },
  approved: { text: 'อนุมัติแล้ว', className: 'green' },
  rejected: { text: 'ไม่อนุมัติ', className: 'red' }
};
// Map possible stored Thai & English values to canonical keys
const PERMISSION_INPUT_MAP: Record<string, 'pending'|'approved'|'rejected'> = {
  // Thai
  'กำลังดำเนินการ': 'pending',
  'อนุมัติ': 'approved',
  'อนุมัติแล้ว': 'approved',
  'ไม่อนุมัติ': 'rejected',
  // English
  'In Progress': 'pending',
  'Pending': 'pending',
  'Approved': 'approved',
  'Rejected': 'rejected',
  'Not Approved': 'rejected'
};
const FOUR_F_STATUSES = { notStarted: { text: 'ยังไม่เริ่ม', icon: '⌛', className: 'notStarted' }, approved: { text: 'ผ่านการตรวจสอบ', icon: '✅', className: 'approved' }, notRequired: { text: 'ข้ามขั้นตอนนี', icon: '↪️', className: 'notRequired' }, rejected: { text: 'ไม่ผ่าน(แก้ไขจะระบุในหมายเหตุ)', icon: '❌', className: 'rejected' }};
const FOUR_F_INPUT_MAP: Record<string, 'notStarted'|'approved'|'notRequired'|'rejected'> = {
  // Thai
  'ยังไม่เริ่ม': 'notStarted',
  'ผ่านการตรวจสอบ': 'approved',
  'ข้ามขั้นตอนนี': 'notRequired',
  'ไม่ผ่าน(แก้ไขจะระบุในหมายเหตุ)': 'rejected',
  // English
  'Not Started': 'notStarted',
  'Passed': 'approved',
  'Skip': 'notRequired',
  'Failed': 'rejected'
};
const FOUR_F_STATUSES_DISPLAY = ['ยังไม่เริ่ม', 'ผ่านการตรวจสอบ', 'ข้ามขั้นตอนนี', 'ไม่ผ่าน(แก้ไขจะระบุในหมายเหตุ)'];
const PERMISSION_STATUSES_DISPLAY = ['กำลังดำเนินการ', 'อนุมัติแล้ว', 'ไม่อนุมัติ'];

// FIX: Register Chart.js components at the top level. This replaces the problematic `require` call in `useEffect`.
ChartJS.register(ArcElement, Tooltip, Legend);

// ===== TYPE DEFINITIONS =====
interface User { username: string; fullName: string; role: 'Admin' | 'Director'; }
interface Staff { id: string; fullName: string; Department: string; email: string; }
interface Attachment { file_id: string; file_name: string; file_url: string; }
interface Document {
  doc_number: string; submission_date: string; department: string; proposer_name: string;
  objective: string; planning_status: string; procurement_status: string; finance_status: string;
  budget_status: string; notes1: string; permission: string; approval_date: string;
  notes2: string; work_group: string; attachment: Attachment | null;
}
interface ActivityLog { timestamp: string; user: string; action: string; details: string; }


export default function App() {
  // ===== STATE MANAGEMENT =====
  const [isAppLoading, setAppLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('กำลังโหลด...');
  const [toastMessage, setToastMessage] = useState('');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Modals State
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isDocModalOpen, setDocModalOpen] = useState(false);
  const [isStaffModalOpen, setStaffModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<'url' | 'json' | null>(null);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [editingStaff, setEditingStaff] = useState<Partial<Staff> | null>(null);
  const [isPrintPreviewOpen, setPrintPreviewOpen] = useState(false);


  // Filters State
  const [filters, setFilters] = useState({ search: '', date: '', group: '', proposer: '', permission: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [adminFilters, setAdminFilters] = useState({ search: '', date: '', group: '', proposer: '', permission: '' });
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Visitor Page State
  const [visitorDepartmentFilter, setVisitorDepartmentFilter] = useState('');
  const [visitorProposerFilter, setVisitorProposerFilter] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());

  // ===== API HELPERS =====
  const callApi = useCallback(async (action: string, payload: object = {}) => {
    if (GAS_API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
      alert("กรุณาตั้งค่า GAS_API_URL ในไฟล์ src/components/App.tsx ก่อน");
      throw new Error("API URL not configured.");
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, payload, user: currentUser }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'เกิดข้อผิดพลาดจาก API');
      return result.data;
    } catch (error) {
      console.error('API Call Failed:', error);
      showToast(`เกิดข้อผิดพลาด: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // ===== DATA FETCHING =====
  useEffect(() => {
    const fetchInitialData = async () => {
      if (GAS_API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        alert("กรุณาตั้งค่า GAS_API_URL ในไฟล์ src/components/App.tsx");
        setAppLoading(false);
        return;
      }
      try {
        const response = await fetch(GAS_API_URL);
        const result = await response.json();
        if (result.success) {
          setDocuments(result.data.documents || []);
          setStaff(result.data.staff || []);
          setActivityLog(result.data.recentActivity || []);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        showToast(`ไม่สามารถโหลดข้อมูลเริ่มต้นได้: ${error.message}`);
      } finally {
        setAppLoading(false);
      }
    };
    fetchInitialData();
  }, []);


  // ===== UTILITIES & HELPERS =====
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear() + 543}`;
    } catch (e) { return dateString; }
  };
  
  const getStatusInfo = (statusKey: 'permission' | '4f', statusValue: string) => {
    const value = (statusValue || '').trim();
    if (statusKey === 'permission') {
      const canonicalKey = Object.keys(PERMISSION_INPUT_MAP).find(k => k === value) || 'pending';
      return PERMISSION_STATUSES[PERMISSION_INPUT_MAP[canonicalKey] || 'pending'];
    } else {
      const canonicalKey = Object.keys(FOUR_F_INPUT_MAP).find(k => k === value) || 'notStarted';
      return FOUR_F_STATUSES[FOUR_F_INPUT_MAP[canonicalKey] || 'notStarted'];
    }
  };


  // ===== EVENT HANDLERS =====
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const credentials = Object.fromEntries(formData.entries());
    setLoadingText('กำลังเข้าสู่ระบบ...');
    try {
      const user = await callApi('verifyLogin', { credentials });
      setCurrentUser(user);
      showToast(`ยินดีต้อนรับ, ${user.fullName}`);
      setLoginModalOpen(false);
    } catch (error) {
       showToast('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowResults(false);
    setFilters({ search: '', date: '', group: '', proposer: '', permission: '' });
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };
  
  const handleOpenDocModal = (doc: Document | null) => {
    setEditingDoc(doc);
    setDocModalOpen(true);
  };
  
  const handleSaveDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const docData = Object.fromEntries(formData.entries());
    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    let fileData = null;

    if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if(file.size > 3 * 1024 * 1024) {
            alert('ขนาดไฟล์ต้องไม่เกิน 3MB'); return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result?.toString().split(',')[1];
            fileData = { base64, name: file.name, type: file.type };
            await submitDoc(docData, fileData);
        };
    } else {
        await submitDoc(docData, null);
    }
  };

  const submitDoc = async (docData: any, fileData: any) => {
    setLoadingText('กำลังบันทึกเอกสาร...');
    const payload: any = {
      submission_date: docData.submission_date, department: docData.department || 'ยังไม่ระบุ',
      proposer_name: docData.proposer_name, objective: docData.objective,
      planning_status: docData.planning_status, procurement_status: docData.procurement_status,
      finance_status: docData.finance_status, budget_status: docData.budget_status,
      notes1: docData.notes1, notes2: docData.notes2, work_group: docData.work_group,
      // Allow admin to set final permission from the form; otherwise keep existing or default
      permission: (docData.permission as string) || editingDoc?.permission || 'กำลังดำเนินการ',
      approval_date: editingDoc ? editingDoc.approval_date : (docData.permission === 'อนุมัติ' ? new Date().toISOString().slice(0,10) : ''),
    };
    // include doc_number only when editing an existing document; new docs get server-generated numbers
    if (editingDoc && editingDoc.doc_number) payload.doc_number = editingDoc.doc_number;
    try {
      const updatedDocs = await callApi('saveDocument', { docData: payload, fileData });
      setDocuments(updatedDocs);
      showToast('บันทึกเอกสารเรียบร้อยแล้ว');
      setDocModalOpen(false);
    } catch(e) {}
  };

   const handleDeleteDocument = async (docId: string) => {
    if (window.confirm(`คุณต้องการลบเอกสาร ${docId} ใช่หรือไม่? ไฟล์แนบจะถูกลบด้วย`)) {
      setLoadingText('กำลังลบเอกสาร...');
      try {
        const updatedDocs = await callApi('deleteDocument', { docId });
        setDocuments(updatedDocs);
        showToast('ลบเอกสารเรียบร้อยแล้ว');
      } catch (e) {}
    }
  };

  const updateDocStatus = async (docId: string, newStatus: string) => {
    setLoadingText('กำลังอัปเดตสถานะ...');
    try {
      const updatedDocs = await callApi('updateStatus', { docId, newStatus });
      setDocuments(updatedDocs);
      showToast('อัปเดตสถานะเรียบร้อยแล้ว');
    } catch (e) {}
  };

  const handleImportFromSheet = async (sheetUrl: string) => {
    setLoadingText('กำลังนำเข้าข้อมูลจาก Google Sheet...');
    try {
      const result = await callApi('importFromSheet', { url: sheetUrl });
      if (result.success) {
        setDocuments(result.updatedDocuments);
        showToast(`นำเข้า ${result.importedCount} เอกสารเรียบร้อยแล้ว`);
      } else {
        showToast(`เกิดข้อผิดพลาด: ${result.errors?.map(e => e.message).join(', ')}`);
      }
    } catch (e) {}
  };

  const handleImportFromJson = async (jsonData: any[]) => {
    setLoadingText('กำลังนำเข้าข้อมูลจาก JSON...');
    try {
      const result = await callApi('importFromJson', { jsonData });
      if (result.success) {
        setDocuments(result.updatedDocuments);
        showToast(`นำเข้า ${result.importedCount} เอกสารเรียบร้อยแล้ว`);
      } else {
        showToast(`เกิดข้อผิดพลาด: ${result.errors?.map(e => e.message).join(', ')}`);
      }
    } catch (e) {}
  };

  const handleOpenStaffModal = (staff: Partial<Staff> | null) => {
    setEditingStaff(staff);
    setStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const staffData = Object.fromEntries(formData.entries());
    setLoadingText('กำลังบันทึกข้อมูลบุคลากร...');
    try {
      const updatedStaff = await callApi('saveStaff', { staffData });
      setStaff(updatedStaff);
      showToast('บันทึกข้อมูลบุคลากรเรียบร้อยแล้ว');
      setStaffModalOpen(false);
    } catch (e) {}
  };

  const handleDeleteStaff = async (id: string) => {
    if (window.confirm('คุณต้องการลบข้อมูลบุคลากรนี้ใช่หรือไม่?')) {
      setLoadingText('กำลังลบข้อมูลบุคลากร...');
      try {
        const updatedStaff = await callApi('deleteStaff', { id });
        setStaff(updatedStaff);
        showToast('ลบข้อมูลบุคลากรเรียบร้อยแล้ว');
      } catch (e) {}
    }
  };
  
  const handleShowAllDocs = () => {
    setFilters({ search: '', date: '', group: '', proposer: '', permission: '' });
    setVisitorDepartmentFilter(''); setVisitorProposerFilter('');
    setCurrentPage(1); setShowResults(true);
  };
  
  const handleVisitorSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      setFilters({
          search: formData.get('search') as string || '',
          group: formData.get('department') as string || '',
          proposer: formData.get('proposer') as string || '',
          date: '', permission: '',
      });
      setCurrentPage(1); setShowResults(true);
  };

  const handleExportToGoogleSheet = async (docs: any[]) => {
    setLoadingText('กำลังส่งออกไปยัง Google Sheet...');
    setIsLoading(true);
    try {
      const response = await fetch(GAS_API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'exportToGoogleSheet', payload: { docs }, user: currentUser }) });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'ไม่สามารถส่งออกได้');
      const url = result.url || result.data?.url;
      if (url) {
        showToast('ส่งออกเรียบร้อยแล้ว — เปิด Google Sheet ใหม่');
        window.open(url, '_blank');
      } else {
        showToast('ส่งออกสำเร็จ แต่ไม่พบลิงก์ไฟล์');
      }
    } catch (e: any) { showToast(e.message || 'เกิดข้อผิดพลาดในการส่งออก'); }
    finally { setIsLoading(false); }
  };
  
  // ===== FILTER & PAGINATION LOGIC =====
  const filteredDocuments = useMemo(() => {
    return documents
      .filter(doc => {
        const searchTerm = filters.search.toLowerCase();
        return (
          (doc.objective.toLowerCase().includes(searchTerm) ||
            doc.proposer_name.toLowerCase().includes(searchTerm) ||
            doc.doc_number.toLowerCase().includes(searchTerm)) &&
          (!filters.date || doc.submission_date === filters.date) &&
          (!filters.group || doc.department === filters.group) &&
          (!filters.proposer || doc.proposer_name === filters.proposer) &&
          (!filters.permission || getStatusInfo('permission', doc.permission).text === filters.permission)
        );
      })
      .sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime());
  }, [documents, filters]);

  const paginatedDocuments = useMemo(() => {
    return filteredDocuments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredDocuments, currentPage]);

  const proposersForVisitorFilter = useMemo(() => {
    if (!visitorDepartmentFilter) {
      return [...new Set(staff.map(s => s.fullName))].sort();
    }
    return staff.filter(s => s.Department === visitorDepartmentFilter).map(s => s.fullName).sort();
  }, [staff, visitorDepartmentFilter]);


  // ===== RENDER LOGIC =====
  if (isAppLoading) {
    return (
      <div id="loading-overlay" className="flex"><div className="loader"></div><div id="loading-text">กำลังโหลดข้อมูลเริ่มต้น...</div></div>
    );
  }

  // ===== VISITOR VIEW =====
  if (!currentUser) {
    return (
        <div className="bg-slate-100 min-h-screen flex flex-col font-sans">
            <header className="w-full p-4 flex justify-end">
                 <button onClick={() => setLoginModalOpen(true)} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-all duration-200">เข้าสู่ระบบ</button>
            </header>

            <main className="flex-grow flex flex-col items-center justify-start p-4 text-slate-800">
                <img src={CONFIG.SCHOOL_LOGO_URL} alt="School Logo" className="w-24 h-24 md:w-32 md:h-32 mb-4" />
                <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">{CONFIG.SYSTEM_TITLE}</h1>

                <div className="bg-white shadow-lg w-full max-w-4xl p-6 md:p-8 rounded-2xl">
                    <h2 className="text-xl font-semibold mb-2">ค้นหา</h2>
                    <p className="text-sm text-slate-600 mb-6">ติดตามเอกสารของคุณได้ง่ายๆ เพียงกรอกชื่อวัตถุประสงค์ เลขที่เอกสาร</p>
                    
                    <form onSubmit={handleVisitorSearch} id="visitor-search-form" className="space-y-4">
                        <input type="text" name="search" placeholder="ค้นหาจากวัตถุประสงค์, ชื่อผู้เสนอ, เลขที่เอกสาร..." className="w-full p-3 rounded-lg bg-white text-slate-800 placeholder-gray-400 border border-slate-300 focus:border-amber-400 focus:ring-amber-400 outline-none"/>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <select name="department" value={visitorDepartmentFilter} onChange={(e) => { setVisitorDepartmentFilter(e.target.value); setVisitorProposerFilter(''); }} className="w-full p-3 rounded-lg bg-white border border-slate-300 focus:border-amber-500 outline-none">
                              <option value="">-- เลือกกลุ่มสาระ/ฝ่าย --</option>
                              {SUBJECT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                           </select>
                           <select name="proposer" value={visitorProposerFilter} onChange={(e) => setVisitorProposerFilter(e.target.value)} className="w-full p-3 rounded-lg bg-white border border-slate-300 focus:border-amber-500 outline-none">
                               <option value="">-- เลือกผู้เสนอ --</option>
                               {proposersForVisitorFilter.map(p => <option key={p} value={p}>{p}</option>)}
                           </select>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                            <button type="button" onClick={() => setPrintPreviewOpen(true)} className="w-full sm:w-auto px-5 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold transition-colors">พิมพ์เอกสาร</button>
                            <button type="submit" className="w-full sm:w-auto flex-grow px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors">ค้นหา</button>
                            <button type="button" onClick={handleShowAllDocs} className="w-full sm:w-auto px-5 py-3 rounded-lg bg-slate-500 hover:bg-slate-600 text-white font-bold transition-colors">เอกสารทั้งหมด</button>
                        </div>
                    </form>
                </div>
                
                {showResults && (
                    <div className="bg-white shadow-lg w-full max-w-4xl p-6 md:p-8 rounded-2xl mt-8">
                         <h3 className="text-xl font-semibold mb-4 text-slate-800">ผลการค้นหา</h3>
                         <div id="visitor-docs-list" className="space-y-4">
                            {paginatedDocuments.length > 0 ? (
                                paginatedDocuments.map(doc => (
                                  <div key={doc.doc_number} className={`doc-card bg-white p-4 rounded-xl flex flex-col gap-3 border-l-4 border-${getStatusInfo('permission', doc.permission).className}-400`}>
                                    <div className="flex justify-between items-start gap-4">
                                       <p className="text-slate-900 text-lg font-semibold pr-4">{doc.objective}</p>
                                       <span className={`flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full text-white bg-${getStatusInfo('permission', doc.permission).className}-500`}>
                                          {doc.permission}
                                       </span>
                                    </div>
                                    <div className="flex flex-wrap text-sm text-slate-500 gap-x-4 gap-y-1">
                                      <span><b>เลขที่:</b> {doc.doc_number}</span>
                                      <span><b>ผู้เสนอ:</b> {doc.proposer_name}</span>
                                      <span><b>วันที่เสนอ:</b> {formatDate(doc.submission_date)}</span>
                                    </div>
                                  </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 py-8">ไม่พบเอกสารที่ตรงกับเงื่อนไข</p>
                            )}
                         </div>
                         {filteredDocuments.length > ITEMS_PER_PAGE && (
                              <div id="pagination-controls" className="flex justify-center items-center gap-1 mt-6 flex-wrap">
                                {/* Pagination Component/Logic would go here */}
                             </div>
                         )}
                    </div>
                )}
            </main>
            
            <footer className="w-full text-center p-4 text-xs text-slate-500">
                <p>👨‍💻 ผู้พัฒนาระบบ</p>
                <p>© 2025 งานเทคโนโลยีสารสนเทศ (ICT) โรงเรียนสารคามพิทยาคม</p>
            </footer>

            {isLoading && <div id="loading-overlay" className="flex"><div className="loader"></div><div id="loading-text">{loadingText}</div></div>}
            {toastMessage && <div id="toast" className="show">{toastMessage}</div>}
            {isLoginModalOpen && (
              <div className="modal fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                  <div className="bg-white w-full max-w-sm p-8 rounded-2xl m-4 shadow-2xl">
                      <h3 className="text-2xl font-bold text-center mb-6 text-slate-800">เข้าสู่ระบบ</h3>
                      <form onSubmit={handleLogin} className="space-y-4">
                          <input type="text" name="username" placeholder="ชื่อผู้ใช้" className="w-full p-3 rounded-lg border border-slate-300" required />
                          <input type="password" name="password" placeholder="รหัสผ่าน" className="w-full p-3 rounded-lg border border-slate-300" required />
                          <div className="flex items-center space-x-2 pt-2">
                              <button type="submit" className="w-full py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold">เข้าสู่ระบบ</button>
                              <button type="button" onClick={() => setLoginModalOpen(false)} className="px-4 py-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800">&times;</button>
                          </div>
                      </form>
                  </div>
              </div>
            )}
             {isPrintPreviewOpen && (
                 <div id="print-view">
                    <div className="print-container">
                      <button onClick={() => window.print()} className="no-print absolute top-6 left-6 bg-blue-500 text-white px-4 py-2 rounded">🖨️ พิมพ์</button>
                      <button onClick={() => setPrintPreviewOpen(false)} className="no-print absolute top-6 right-6 bg-red-500 text-white px-3 py-1 rounded">&times; ปิด</button>
                      <div className="print-header">
                          <img src={CONFIG.SCHOOL_LOGO_URL} alt="Logo" style={{width:'80px', height:'80px'}}/>
                          <div style={{textAlign: 'right'}}>
                              <h2 style={{fontWeight:'bold'}}>{CONFIG.SCHOOL_NAME}</h2>
                              <p>รายงานเอกสาร</p>
                              <p>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH')}</p>
                          </div>
                      </div>
                      <h1 className="print-title">รายการเอกสาร</h1>
                      <table className="print-table">
                          <thead>
                              <tr style={{backgroundColor:'#f1f5f9'}}>
                                  <th>เลขที่เอกสาร</th><th>วันที่เสนอ</th><th>วัตถุประสงค์</th><th>ผู้เสนอ</th><th>กลุ่มสาระ/ฝ่าย</th><th>สถานะ</th>
                              </tr>
                          </thead>
                          <tbody>
                              {filteredDocuments.length > 0 ? filteredDocuments.map(doc => (
                                  <tr key={doc.doc_number}>
                                      <td>{doc.doc_number}</td><td>{formatDate(doc.submission_date)}</td><td>{doc.objective}</td>
                                      <td>{doc.proposer_name}</td><td>{doc.department}</td><td>{doc.permission}</td>
                                  </tr>
                              )) : (<tr><td colSpan={6} style={{textAlign: 'center', padding: '1rem'}}>ไม่พบข้อมูล</td></tr>)}
                          </tbody>
                      </table>
                    </div>
                 </div>
             )}
        </div>
    );
  }

  // ===== LOGGED-IN DASHBOARD VIEW =====
  return (
    <>
    <div className="flex flex-col md:flex-row min-h-screen">
      <div id="mobile-menu-overlay" onClick={() => setSidebarOpen(false)} className={`fixed inset-0 bg-black/50 z-30 ${isSidebarOpen ? 'block' : 'hidden'} md:hidden`}></div>
      <aside className={`w-72 bg-gradient-to-b from-blue-600 to-indigo-800 text-white flex-shrink-0 p-6 md:m-4 md:rounded-2xl flex flex-col fixed md:relative h-full z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
            <div className="flex items-center space-x-4 mb-6">
                <img src={CONFIG.SCHOOL_LOGO_URL} alt="Logo SPK" className="w-16 h-16 bg-white p-1 rounded-full"/>
                <div>
                    <h1 className="text-xl font-bold">{CONFIG.SCHOOL_NAME}</h1>
                    <p className="text-sm text-blue-200">{CONFIG.SCHOOL_YEAR}</p>
                </div>
            </div>

             <nav className="space-y-2">
                <a href="#documents" onClick={()=>handleTabClick('documents')} className={`tab-link flex items-center p-3 rounded-lg ${activeTab === 'documents' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    <span className="material-icons-outlined mr-3">description</span>จัดการเอกสาร</a>

                {/* เพิ่มเอกสารใหม่ - ปุ่มสีเขียว (no emoji) */}
                {currentUser?.role === 'Admin' && (
                  <button onClick={() => handleOpenDocModal(null)} className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold">
                    <span className="material-icons-outlined mr-3">note_add</span>เพิ่มเอกสารใหม่
                  </button>
                )}

                {/* เมนูระบบฝ่ายบริหารงบฯ (no inline submenu in sidebar) */}
                <a href="#form" onClick={()=>handleTabClick('form')} className={`tab-link flex items-center p-3 rounded-lg ${activeTab === 'form' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    <span className="material-icons-outlined mr-3">edit</span>เมนูระบบฝ่ายบริหารงบฯ</a>

                <a href="#report" onClick={()=>handleTabClick('report')} className={`tab-link flex items-center p-3 rounded-lg ${activeTab === 'report' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    <span className="material-icons-outlined mr-3">dashboard</span>สถิติและภาพรวม</a>

                <a href="#report" onClick={()=>handleTabClick('report')} className={`tab-link flex items-center p-3 rounded-lg ${activeTab === 'report' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    <span className="material-icons-outlined mr-3">assessment</span>รายงานผู้เสนอ</a>

                {(currentUser.role === 'Director' || currentUser.role === 'Admin') && <>
                  <a href="#approvals" onClick={()=>handleTabClick('approvals')} className={`tab-link flex items-center p-3 rounded-lg ${activeTab === 'approvals' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                    <span className="material-icons-outlined mr-3">done_all</span>อนุมัติเอกสาร</a>
                </>}
                <hr className="my-3 border-white/20" />
                <a href="#guide" onClick={()=>handleTabClick('guide')} className={`tab-link flex items-center p-3 rounded-lg ${activeTab === 'guide' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                  <span className="material-icons-outlined mr-3">help</span>คู่มือการใช้งาน</a>
            </nav>
            
            <footer className="mt-auto pt-6 border-t border-white/20 text-center text-xs text-blue-200">
                <p>👨‍💻 ผู้พัฒนาระบบ</p>
                <p>© 2025 งานเทคโนโลยีสารสนเทศ (ICT) โรงเรียนสารคามพิทยาคม</p>
            </footer>
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
             <header className="flex justify-between items-center mb-8">
                <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-slate-600 hover:bg-slate-200 md:hidden"><span className="material-icons">menu</span></button>
                <div className="flex-1"><h2 className="text-2xl md:text-3xl font-bold text-slate-800">{CONFIG.SYSTEM_TITLE}</h2></div>
                 <div className="flex items-center gap-2 text-sm">
                    <span className="hidden sm:block text-slate-600">สวัสดี, {currentUser.fullName}</span>
                    <button onClick={handleLogout} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-red-500"><span className="material-icons-outlined">logout</span></button>
                 </div>
            </header>
            
            {/* Dashboard and Tab Views */}
            {activeTab === 'documents' && <DocumentsView {...{documents, filters: currentUser?.role === 'Admin' ? adminFilters : filters, setFilters: currentUser?.role === 'Admin' ? setAdminFilters : setFilters, currentPage: currentUser?.role === 'Admin' ? adminCurrentPage : currentPage, setCurrentPage: currentUser?.role === 'Admin' ? setAdminCurrentPage : setCurrentPage, ITEMS_PER_PAGE, currentUser, handleOpenDocModal, handleDeleteDocument, updateDocStatus, formatDate, getStatusInfo, isLoading, onImportClick: () => setImportModalOpen(true), exportToGSheet: handleExportToGoogleSheet}} />}
            {activeTab === 'form' && (currentUser?.role === 'Admin' ? <AdminMenuView activityLog={activityLog} onAddDoc={() => handleOpenDocModal(null)} onImport={() => handleTabClick('import')} onOpenManagers={() => handleTabClick('report')} /> : <FormView {...{documents, staff, SUBJECT_GROUPS, WORK_GROUPS, FOUR_F_STATUSES_DISPLAY, handleOpenDocModal, isLoading}} />)}
            {activeTab === 'import' && currentUser?.role === 'Admin' && <ImportView {...{handleImportFromSheet, handleImportFromJson, isLoading}} />}
            {activeTab === 'report' && (currentUser?.role === 'Admin' || currentUser?.role === 'Director') && <ProposerReportView {...{documents, staff, REPORT_YEAR: CONFIG.REPORT_YEAR, SUBJECT_GROUPS, onOpenStaffModal: handleOpenStaffModal, onDeleteStaff: handleDeleteStaff}} />}
            {activeTab === 'home' && <DashboardView {...{documents, CONFIG}} />}
            {activeTab === 'approvals' && (currentUser?.role === 'Director' || currentUser?.role === 'Admin') && <DocumentsView {...{documents, filters, setFilters, currentPage, setCurrentPage, ITEMS_PER_PAGE, currentUser, handleOpenDocModal, handleDeleteDocument, updateDocStatus, formatDate, getStatusInfo, isLoading, viewType: 'approvals'}} />}
            {activeTab === 'guide' && <GuideView />}
        </main>
    </div>
    
    {isDocModalOpen && (
        <div className="modal fixed inset-0 bg-black/60 items-start justify-center z-50 overflow-y-auto p-4">
            <form onSubmit={handleSaveDocument} className="bg-white w-full max-w-3xl p-8 rounded-2xl shadow-2xl my-8 space-y-4">
                <h3 id="doc-modal-title" className="text-2xl font-bold mb-4 text-slate-800">{editingDoc ? 'แก้ไขเอกสาร' : 'เพิ่มเอกสารใหม่'}</h3>
                {editingDoc && <input type="hidden" name="doc_number" defaultValue={editingDoc?.doc_number || ''}/>} 
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="date" name="submission_date" defaultValue={editingDoc?.submission_date || new Date().toISOString().substring(0, 10)} className="w-full p-2 rounded-lg border border-slate-300" required />
                    <div className="md:col-span-2"><input type="text" name="proposer_name" list="proposer-list" defaultValue={editingDoc?.proposer_name || ''} placeholder="ชื่อผู้เสนอ (เลือกหรือพิมพ์)" className="w-full p-2 rounded-lg border border-slate-300" required /><datalist id="proposer-list">{staff.map(s=><option key={s.id} value={s.fullName} />)}</datalist></div>
                </div>
                
                <select name="department" defaultValue={editingDoc?.department || ''} className="w-full p-2 rounded-lg border border-slate-300" required>
                  <option value="">-- เลือกกลุ่มสาระ/ฝ่าย --</option>
                  {SUBJECT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>

                <fieldset>
                    <legend className="text-sm font-medium text-slate-600 mb-2">กลุ่มงาน</legend>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        {WORK_GROUPS.map(group => (
                            <div key={group} className="flex items-center">
                                <input type="radio" id={`work-group-${group}`} name="work_group" value={group} defaultChecked={editingDoc?.work_group === group} className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" required />
                                <label htmlFor={`work-group-${group}`} className="ml-2 block text-sm text-gray-700">{group}</label>
                            </div>
                        ))}
                    </div>
                </fieldset>

                <textarea name="objective" defaultValue={editingDoc?.objective || ''} placeholder="วัตถุประสงค์" className="w-full p-2 rounded-lg border border-slate-300 h-24" required></textarea>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-slate-600">ฝ่ายแผนงาน</label><select name="planning_status" defaultValue={editingDoc?.planning_status || ''} className="w-full p-2 rounded-lg border border-slate-300 mt-1">{FOUR_F_STATUSES_DISPLAY.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                    <div><label className="text-sm font-medium text-slate-600">ฝ่ายพัสดุ</label><select name="procurement_status" defaultValue={editingDoc?.procurement_status || ''} className="w-full p-2 rounded-lg border border-slate-300 mt-1">{FOUR_F_STATUSES_DISPLAY.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                    <div><label className="text-sm font-medium text-slate-600">ฝ่ายการเงิน</label><select name="finance_status" defaultValue={editingDoc?.finance_status || ''} className="w-full p-2 rounded-lg border border-slate-300 mt-1">{FOUR_F_STATUSES_DISPLAY.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                    <div><label className="text-sm font-medium text-slate-600">ฝ่ายงบประมาณ</label><select name="budget_status" defaultValue={editingDoc?.budget_status || ''} className="w-full p-2 rounded-lg border border-slate-300 mt-1">{FOUR_F_STATUSES_DISPLAY.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                </div>
                <textarea name="notes1" defaultValue={editingDoc?.notes1 || ''} placeholder="หมายเหตุ 1" className="w-full p-2 rounded-lg border border-slate-300 h-20"></textarea>
                <textarea name="notes2" defaultValue={editingDoc?.notes2 || ''} placeholder="หมายเหตุ 2" className="w-full p-2 rounded-lg border border-slate-300 h-20"></textarea>
                
                <div>
                    <label className="text-sm font-medium text-slate-600">แนบไฟล์ (ไม่เกิน 3MB)</label>
                    <input type="file" name="attachment" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    {editingDoc?.attachment && <div className="text-xs text-slate-500 mt-1">ไฟล์ปัจจุบัน: <a href={editingDoc.attachment.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{editingDoc.attachment.file_name}</a></div>}
                </div>

                {currentUser?.role === 'Admin' && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">อนุมัติ (ขั้นตอนสุดท้าย)</label>
                    <select name="permission" defaultValue={editingDoc?.permission || 'กำลังดำเนินการ'} className="w-full p-2 rounded-lg border border-slate-300 mt-1">
                      <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                      <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
                      <option value="ไม่อนุมัติ">ไม่อนุมัติ</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-4">
                    <button type="submit" className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold">บันทึก</button>
                    <button type="button" onClick={() => setDocModalOpen(false)} className="flex-1 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800">ยกเลิก</button>
                </div>
            </form>
        </div>
    )}

    {isImportModalOpen && (
        <div className="modal fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-2xl my-8 space-y-6">
                <h3 className="text-2xl font-bold mb-4 text-slate-800">เลือกวิธีการนำเข้าข้อมูล</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* URL option */}
                    <button
                        onClick={() => setImportType('url')}
                        className="p-6 rounded-lg border-2 border-blue-300 hover:bg-blue-50 text-center transition"
                    >
                        <span className="material-icons text-4xl text-blue-600 flex justify-center mb-3">link</span>
                        <p className="font-bold text-slate-800">นำเข้าจาก Google Sheet</p>
                        <p className="text-sm text-slate-500 mt-2">ข้อมูลจาก Google Sheets URL</p>
                    </button>
                    {/* JSON option */}
                    <button
                        onClick={() => setImportType('json')}
                        className="p-6 rounded-lg border-2 border-green-300 hover:bg-green-50 text-center transition"
                    >
                        <span className="material-icons text-4xl text-green-600 flex justify-center mb-3">data_object</span>
                        <p className="font-bold text-slate-800">นำเข้าจาก JSON</p>
                        <p className="text-sm text-slate-500 mt-2">วาง JSON หรืออัพโหลดไฟล์</p>
                    </button>
                    {/* File option - already handled by JSON, but show it for clarity */}
                    <button
                        onClick={() => setImportType('url')}
                        className="p-6 rounded-lg border-2 border-amber-300 hover:bg-amber-50 text-center transition"
                    >
                        <span className="material-icons text-4xl text-amber-600 flex justify-center mb-3">upload_file</span>
                        <p className="font-bold text-slate-800">นำเข้าจากไฟล์</p>
                        <p className="text-sm text-slate-500 mt-2">อัพโหลด CSV/Excel</p>
                    </button>
                </div>

                {importType === 'url' && (
                    <div className="space-y-4 border-t pt-6">
                        <h4 className="font-bold text-slate-800">ใส่ URL ของ Google Sheet</h4>
                        <input
                            type="text"
                            id="sheet-url"
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                            className="w-full p-3 rounded-lg border border-slate-300"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    const url = (document.getElementById('sheet-url') as HTMLInputElement)?.value;
                                    if (url) {
                                        setImportType(null);
                                        setIsImportModalOpen(false);
                                        handleImportFromSheet(url);
                                    }
                                }}
                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                            >
                                นำเข้า
                            </button>
                            <button
                                onClick={() => setImportType(null)}
                                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg"
                            >
                                ย้อนกลับ
                            </button>
                        </div>
                    </div>
                )}

                {importType === 'json' && (
                    <div className="space-y-4 border-t pt-6">
                        <h4 className="font-bold text-slate-800">วางหรืออัพโหลด JSON</h4>
                        <textarea
                            id="json-input"
                            placeholder='[{"submission_date":"2025-01-15","proposer_name":"John","objective":"..."}]'
                            className="w-full p-3 rounded-lg border border-slate-300 h-32"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    const jsonText = (document.getElementById('json-input') as HTMLTextAreaElement)?.value;
                                    if (jsonText) {
                                        try {
                                            const jsonData = JSON.parse(jsonText);
                                            setImportType(null);
                                            setIsImportModalOpen(false);
                                            handleImportFromJson(jsonData);
                                        } catch (e) {
                                            alert('JSON ไม่ถูกต้อง: ' + (e as any).message);
                                        }
                                    }
                                }}
                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
                            >
                                นำเข้า
                            </button>
                            <button
                                onClick={() => setImportType(null)}
                                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg"
                            >
                                ย้อนกลับ
                            </button>
                        </div>
                    </div>
                )}

                {!importType && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsImportModalOpen(false)}
                            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg"
                        >
                            ปิด
                        </button>
                    </div>
                )}
            </div>
        </div>
    )}

    {isStaffModalOpen && (
        <div className="modal fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto p-4">
            <form onSubmit={handleSaveStaff} className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-2xl my-8 space-y-4">
                <h3 className="text-2xl font-bold mb-4 text-slate-800">{editingStaff?.id ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากรใหม่'}</h3>
                <input type="hidden" name="id" defaultValue={editingStaff?.id || ''}/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="fullName" defaultValue={editingStaff?.fullName || ''} placeholder="ชื่อเต็ม" className="w-full p-2 rounded-lg border border-slate-300" required />
                    <select name="Department" defaultValue={editingStaff?.Department || ''} className="w-full p-2 rounded-lg border border-slate-300" required>
                        <option value="">-- เลือกกลุ่มสาระ/ฝ่าย --</option>
                        {SUBJECT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <input type="email" name="email" defaultValue={editingStaff?.email || ''} placeholder="อีเมล" className="w-full p-2 rounded-lg border border-slate-300" required />
                <div className="flex items-center space-x-2 pt-4">
                    <button type="submit" className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold">บันทึก</button>
                    <button type="button" onClick={() => setStaffModalOpen(false)} className="flex-1 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800">ยกเลิก</button>
                </div>
            </form>
        </div>
    )}

    {isImportModalOpen && (
        <div className="modal fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-slate-800">นำเข้าข้อมูล</h3>
                <p className="text-slate-600 mb-6">เลือกวิธีการนำเข้าข้อมูล:</p>
                
                <div className="grid gap-4">
                    <button onClick={() => { setImportModalOpen(false); handleTabClick('import'); }} className="flex items-center gap-4 p-6 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition text-left">
                        <span className="material-icons text-4xl text-blue-500">link</span>
                        <div>
                            <h4 className="font-bold text-slate-800">นำเข้าจาก Google Sheet URL</h4>
                            <p className="text-sm text-slate-600">วาง URL ของ Google Sheet ประสงค์</p>
                        </div>
                    </button>

                    <button onClick={() => { setImportModalOpen(false); handleTabClick('import'); }} className="flex items-center gap-4 p-6 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition text-left">
                        <span className="material-icons text-4xl text-green-500">upload_file</span>
                        <div>
                            <h4 className="font-bold text-slate-800">นำเข้าจากไฟล์ JSON</h4>
                            <p className="text-sm text-slate-600">อัปโหลดไฟล์ JSON ที่มีข้อมูลเอกสาร</p>
                        </div>
                    </button>

                    <button onClick={() => { setImportModalOpen(false); handleTabClick('import'); }} className="flex items-center gap-4 p-6 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition text-left">
                        <span className="material-icons text-4xl text-amber-500">paste</span>
                        <div>
                            <h4 className="font-bold text-slate-800">วาง JSON โดยตรง</h4>
                            <p className="text-sm text-slate-600">วาง JSON data ลงไป</p>
                        </div>
                    </button>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={() => setImportModalOpen(false)} className="px-6 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium">ปิด</button>
                </div>
            </div>
        </div>
    )}

    {isLoading && <div id="loading-overlay" className="flex"><div className="loader"></div><div id="loading-text">{loadingText}</div></div>}
    {toastMessage && <div id="toast" className="show">{toastMessage}</div>}
    </>
  );
}
