import React, { useState } from 'react';
import DashboardView from './DashboardView';
import DocumentsView from './DocumentsView';

interface ManageDocumentsViewProps {
  documents: any[];
  filters: any;
  setFilters: (f: any) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  ITEMS_PER_PAGE: number;
  currentUser: any;
  handleOpenDocModal: (doc: any) => void;
  handleDeleteDocument: (id: string) => void;
  updateDocStatus: (id: string, status: string) => void;
  formatDate: (s: string) => string;
  getStatusInfo: (key: string, val: string) => any;
  isLoading: boolean;
  CONFIG: any;
  onPrint?: (filteredDocs: any[]) => void;
}

export default function ManageDocumentsView(props: ManageDocumentsViewProps) {
  const [subTab, setSubTab] = useState<'overview' | 'docs'>('overview');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setSubTab('overview')}
          className={`px-6 py-3 font-bold rounded-t-lg transition ${
            subTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          หน้าหลัก
        </button>
        <button
          onClick={() => setSubTab('docs')}
          className={`px-6 py-3 font-bold rounded-t-lg transition ${
            subTab === 'docs'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ติดตามเอกสาร
        </button>
      </div>

      {subTab === 'overview' && (
        <DashboardView documents={props.documents} CONFIG={props.CONFIG} />
      )}
      {subTab === 'docs' && (
        <DocumentsView
          documents={props.documents}
          filters={props.filters}
          setFilters={props.setFilters}
          currentPage={props.currentPage}
          setCurrentPage={props.setCurrentPage}
          ITEMS_PER_PAGE={props.ITEMS_PER_PAGE}
          currentUser={props.currentUser}
          handleOpenDocModal={props.handleOpenDocModal}
          handleDeleteDocument={props.handleDeleteDocument}
          updateDocStatus={props.updateDocStatus}
          formatDate={props.formatDate}
          getStatusInfo={props.getStatusInfo}
          isLoading={props.isLoading}
          onPrint={props.onPrint}
        />
      )}
    </div>
  );
}
