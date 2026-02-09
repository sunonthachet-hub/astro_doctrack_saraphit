import React, { useState } from 'react';

export default function ImportView({ handleImportFromSheet, handleImportFromJson, isLoading }: any) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [jsonText, setJsonText] = useState('');

  const handleSheetImport = () => {
    if (sheetUrl.trim()) {
      handleImportFromSheet(sheetUrl);
      setSheetUrl('');
    }
  };

  const handleJsonImport = () => {
    if (jsonText.trim()) {
      try {
        const data = JSON.parse(jsonText);
        handleImportFromJson(data);
        setJsonText('');
      } catch (e) {
        alert('รูปแบบ JSON ไม่ถูกต้อง');
      }
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-slate-800">📥 นำเข้าข้อมูล</h3>

      {/* Google Sheet Import */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
        <h4 className="font-bold text-lg">นำเข้าจาก Google Sheet</h4>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="ใส่ URL ของ Google Sheet"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            className="w-full p-2 rounded-lg border border-slate-300"
          />
          <button
            onClick={handleSheetImport}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            นำเข้าจาก Google Sheet
          </button>
        </div>
      </div>

      {/* JSON Import */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
        <h4 className="font-bold text-lg">นำเข้าจาก JSON</h4>
        <div className="space-y-2">
          <textarea
            placeholder='ใส่ JSON ที่มีรูปแบบ: [{"proposer_name": "...", "objective": "...", ...}]'
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full p-2 rounded-lg border border-slate-300 h-32"
          />
          <button
            onClick={handleJsonImport}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            นำเข้าจาก JSON
          </button>
        </div>
      </div>
    </div>
  );
}
