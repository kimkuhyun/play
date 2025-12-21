import React from 'react';
import { MapPin, Building2, X, Sparkles, Star, FileText } from 'lucide-react';
import type { Company, ApplicationData } from '../../types';

interface MapWidgetProps {
  companies: Company[];
  applications: Record<number, ApplicationData>;
  activeNodeId: number | null;
  onNodeClick: (companyId: number | null) => void;
  onAction: (action: string, companyId: number) => void;
}

export const MapWidget: React.FC<MapWidgetProps> = ({ companies, applications, activeNodeId, onNodeClick, onAction }) => {
  return (
    <div
      className="h-full w-full bg-slate-900 rounded-3xl overflow-hidden relative group border border-slate-800 flex flex-col shadow-2xl"
      onClick={() => onNodeClick(null)}
    >
      <div className="absolute top-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3 shadow-lg">
        <MapPin size={18} className="text-indigo-400" />
        <div className="text-sm font-bold text-white">
          채용 지도 ({companies.length}){' '}
          <span className="text-slate-500 font-normal text-xs ml-2">기업을 클릭하여 작업 선택</span>
        </div>
      </div>

      <div className="flex-1 bg-[#1a1b26] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(#2c2e3e 1px, transparent 1px), linear-gradient(90deg, #2c2e3e 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.3,
          }}
        ></div>
        <svg className="absolute inset-0 w-full h-full stroke-slate-700/50 fill-none" strokeWidth="2">
          <path d="M-10 100 Q 150 150 300 100 T 600 150" />
          <path d="M100 -10 L 120 400" />
          <path d="M450 -10 L 420 400" />
        </svg>

        {companies.map((company) => (
          <div
            key={company.id}
            className="absolute transition-all duration-500 cursor-pointer flex flex-col items-center group/pin z-10"
            style={{ top: `${company.lat}%`, left: `${company.lng}%` }}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick(company.id);
            }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                activeNodeId === company.id
                  ? 'bg-indigo-500 scale-125 z-20'
                  : 'bg-slate-700 hover:bg-slate-600 hover:scale-110'
              }`}
            >
              <Building2 size={16} className="text-white" />
            </div>

            {activeNodeId !== company.id && (
              <div className="mt-2 bg-slate-900/90 text-white px-2.5 py-1 rounded-md border border-slate-700 whitespace-nowrap text-xs">
                <span className="font-semibold">{company.company}</span>
                <span className={`ml-2 text-red-400 ${company.deadline === '상시' ? 'text-emerald-400' : ''}`}>
                  {company.deadline}
                </span>
              </div>
            )}

            {activeNodeId === company.id && (
              <div
                className="absolute top-10 flex flex-col gap-1 bg-slate-800 border border-slate-700 p-1.5 rounded-xl shadow-2xl z-50 animate-[fade-in_0.2s] min-w-[150px] cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-xs font-bold text-white px-2 py-1 border-b border-slate-700 mb-1 flex justify-between items-center">
                  {company.company}
                  <button onClick={() => onNodeClick(null)}>
                    <X size={12} className="text-slate-500 hover:text-white" />
                  </button>
                </div>
                <button
                  onClick={() => onAction('analyze', company.id)}
                  className="flex items-center gap-2 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white px-2 py-1.5 rounded-lg transition-colors text-left"
                >
                  <Sparkles size={12} /> 기업 공고
                </button>
                <button
                  onClick={() => onAction('star', company.id)}
                  className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-colors text-left ${
                    applications[company.id]?.starred
                      ? 'text-yellow-300 hover:bg-slate-700'
                      : 'text-slate-300 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  <Star size={12} /> {applications[company.id]?.starred ? '관심 해제' : '관심 등록'}
                </button>
                <button
                  onClick={() => onAction('resume', company.id)}
                  className="flex items-center gap-2 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white px-2 py-1.5 rounded-lg transition-colors text-left"
                >
                  <FileText size={12} /> 이력서 작성
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
