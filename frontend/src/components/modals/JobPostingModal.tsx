import React from 'react';
import { X } from 'lucide-react';
import type { Company } from '../../types';

interface JobPostingModalProps {
  company: Company | null;
  onClose: () => void;
}

export const JobPostingModal: React.FC<JobPostingModalProps> = ({ company, onClose }) => {
  if (!company) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-[fade-in_0.2s]"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="bg-slate-800 text-slate-300 text-sm px-4 py-1.5 rounded-md w-1/2 text-center truncate">
            {company.sourceUrl}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 bg-white overflow-y-auto">
          <img
            src={`https://via.placeholder.com/1024x2048.png/FFFFFF/000000?text=Job+Posting+for+${company.company.replace(' ', '+')}`}
            alt={`${company.company} job posting`}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
