import React from 'react';
import { Sparkles, Star } from 'lucide-react';
import type { Company, ApplicationData } from '../../types';

interface AnalysisWidgetProps {
  companies: Company[];
  applications: Record<number, ApplicationData>;
  selectedId: number | null;
  onKeywordClick: (keyword: string, companyName: string) => void;
  onToggleStar: (companyId: number) => void;
}

export const AnalysisWidget: React.FC<AnalysisWidgetProps> = ({
  companies,
  applications,
  selectedId,
  onKeywordClick,
  onToggleStar,
}) => {
  const selectedData = companies.find((c) => c.id === selectedId);
  const isStarred = selectedData && applications[selectedData.id]?.starred;

  return (
    <div className="h-full w-full bg-slate-900 rounded-3xl p-4 md:p-6 border border-slate-800 flex flex-col gap-4 overflow-hidden relative">
      {selectedData ? (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 animate-[fade-in_0.3s]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-indigo-400">
              <Sparkles size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">공고</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleStar(selectedData.id)}
                className={`p-1.5 rounded-full transition-colors ${
                  isStarred ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' : 'text-slate-500 hover:bg-slate-700'
                }`}
              >
                <Star size={16} className={`${isStarred ? 'fill-current' : ''}`} />
              </button>
              <div className="text-xs text-slate-500">Source: {selectedData.sourceUrl ? 'User Link' : 'Demo'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <div className="text-[10px] text-slate-500 mb-1">연봉 추정</div>
              <div className="text-sm font-semibold text-slate-200">{selectedData.salary}</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <div className="text-[10px] text-slate-500 mb-1">위치</div>
              <div className="text-sm font-semibold text-slate-200 truncate">{selectedData.location}</div>
            </div>
          </div>

          <div>
            <h3 className="text-xs text-slate-500 font-semibold mb-2 uppercase">핵심 키워드 (클릭하여 이력서에 추가)</h3>
            <div className="flex flex-wrap gap-2">
              {selectedData.keywords.map((kw, idx) => (
                <button
                  key={idx}
                  onClick={() => onKeywordClick(kw, selectedData.company)}
                  className="text-xs bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-md transition-all active:scale-95 text-left"
                >
                  + {kw}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-900/10 p-4 rounded-xl border border-indigo-500/20">
            <p className="text-xs text-indigo-200 leading-relaxed">
              <span className="font-bold block mb-1">💡 {selectedData.company} 공략 팁:</span>
              {selectedData.company}는 <strong>{selectedData.keywords[0]}</strong> 역량을 가장 중요하게 봅니다. 관련 프로젝트
              경험을 최상단에 배치하세요.
            </p>
          </div>

          <div className="border-t border-slate-800/50 pt-4 mt-4">
            <h3 className="text-xs text-slate-500 font-semibold mb-2 uppercase">주요 업무</h3>
            {selectedData.description ? (
              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{selectedData.description}</p>
            ) : (
              <p className="text-sm text-slate-500">공고 내용이 없습니다.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">지도나 탭에서 기업을 선택하세요.</div>
      )}
    </div>
  );
};
