import React, { useState } from 'react';

interface ImportViewProps {
  handleImportFromSheet?: (url: string) => Promise<void>;
  handleImportFromJson?: (data: any[]) => Promise<void>;
  isLoading?: boolean;
}

export default function ImportView({
  handleImportFromSheet,
  handleImportFromJson,
  isLoading
}: ImportViewProps) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState('sheet');

  const handleImportSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sheetUrl.trim()) {
      await handleImportFromSheet?.(sheetUrl);
      setSheetUrl('');
    }
  };

  const handleImportJson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (jsonInput.trim()) {
      try {
        const data = JSON.parse(jsonInput);
        await handleImportFromJson?.(data);
        setJsonInput('');
      } catch {
        alert('JSON ไม่ถูกต้อง');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold mb-2">📥 นำเข้าข้อมูล</h2>
        <p className="text-purple-100">นำเข้าเอกสารจาก Google Sheet หรือ JSON</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-300">
        <button
          onClick={() => setActiveTab('sheet')}
          className={`px-6 py-3 font-bold transition ${
            activeTab === 'sheet'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          📊 Google Sheet
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`px-6 py-3 font-bold transition ${
            activeTab === 'json'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          📋 JSON
        </button>
      </div>

      {/* Google Sheet Tab */}
      {activeTab === 'sheet' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4">📊 นำเข้าจาก Google Sheet</h3>
          
          <form onSubmit={handleImportSheet} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                URL ของ Google Sheet
              </label>
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm"
                required
              />
              <p className="text-xs text-slate-500 mt-2 italic">
                💡 ให้แน่ใจว่า Sheet สามารถเข้าถึงได้โดยใครก็ได้
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !sheetUrl.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white font-bold rounded-lg transition"
            >
              {isLoading ? '⏳ กำลังนำเข้า...' : '📥 นำเข้าข้อมูล'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-bold text-blue-900 mb-2">📋 รูปแบบ Sheet ที่ต้องการ:</h4>
            <p className="text-sm text-blue-800 mb-3">Sheet ต้องมีคอลัมน์ดังต่อไปนี้:</p>
            <div className="bg-white p-3 rounded border border-blue-300 text-xs font-mono text-slate-700 overflow-x-auto">
              <code>objective | proposer_name | submission_date | department | planning_status | ...</code>
            </div>
          </div>
        </div>
      )}

      {/* JSON Tab */}
      {activeTab === 'json' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4">📋 นำเข้าจาก JSON</h3>
          
          <form onSubmit={handleImportJson} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                ข้อมูล JSON
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"objective":"...", "proposer_name":"...", ...}, ...]'
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm h-64"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !jsonInput.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold rounded-lg transition"
            >
              {isLoading ? '⏳ กำลังนำเข้า...' : '📥 นำเข้าข้อมูล'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-bold text-purple-900 mb-2">📋 ตัวอย่าง JSON:</h4>
            <div className="bg-white p-3 rounded border border-purple-300 text-xs font-mono text-slate-700 overflow-x-auto">
              <code>{`[
  {
    "objective": "...",
    "proposer_name": "...",
    "submission_date": "2567-02-08",
    "department": "...",
    "work_group": "...",
    "planning_status": "...",
    "procurement_status": "...",
    "finance_status": "...",
    "budget_status": "..."
  }
]`}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
