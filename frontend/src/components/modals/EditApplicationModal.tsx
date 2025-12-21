import React, { useState } from 'react';
import type { Company, ApplicationData } from '../../types';

interface EditApplicationModalProps {
  company: Company | null;
  application?: ApplicationData;
  onSave: (companyId: number, details: Partial<ApplicationData>) => void;
  onClose: () => void;
}

export const EditApplicationModal: React.FC<EditApplicationModalProps> = ({ company, application, onSave, onClose }) => {
  if (!company) return null;

  const [customName, setCustomName] = useState(application?.customName || '');
  const [customJob, setCustomJob] = useState(application?.customJob || '');
  const [notes, setNotes] = useState(application?.notes || '');

  const handleSave = () => {
    onSave(company.id, { customName, customJob, notes });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-[fade-in_0.2s]"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white">활동 수정: {company.company}</h3>
          <p className="text-sm text-slate-400 mt-1">지원 활동에 대한 세부 정보를 수정하세요.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">회사 이름 (별칭)</label>
            <input
              type="text"
              className="w-full bg-slate-900 p-2 rounded-md text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={company.company}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">직무</label>
            <input
              type="text"
              className="w-full bg-slate-900 p-2 rounded-md text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Frontend Engineer"
              value={customJob}
              onChange={(e) => setCustomJob(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">메모</label>
            <textarea
              className="w-full h-32 bg-slate-900 p-3 rounded-md text-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="면접 날짜, 담당자, 특이사항 등을 기록하세요..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-4 bg-slate-900/50 border-t border-slate-700">
          <button onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700">
            취소
          </button>
          <button onClick={handleSave} className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500">
            저장
          </button>
        </div>
      </div>
    </div>
  );
};
