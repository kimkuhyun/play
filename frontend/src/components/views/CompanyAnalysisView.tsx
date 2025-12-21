import React, { useState } from 'react';
import type { Company } from '../../types';
import { COMPANY_DETAILS } from '../../utils/mockData';

interface CompanyAnalysisViewProps {
  companies: Company[];
}

const AnalysisCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
    <div className="text-sm text-slate-400 mb-1">{title}</div>
    <div className="text-lg font-semibold text-slate-100">{value}</div>
  </div>
);

export const CompanyAnalysisView: React.FC<CompanyAnalysisViewProps> = ({ companies }) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectCompany = (companyId: string) => {
    if (!companyId) {
      setAnalysis(null);
      return;
    }
    setIsLoading(true);
    setAnalysis(null);

    setTimeout(() => {
      setAnalysis(COMPANY_DETAILS[companyId] || { error: '분석 데이터를 찾을 수 없습니다.' });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-full p-2 animate-[fade-in_0.3s]">
      <div className="h-full bg-slate-900 rounded-3xl p-8 text-white border border-slate-800 overflow-y-auto custom-scrollbar">
        <h2 className="text-2xl font-bold mb-6">기업 분석</h2>
        <div className="mb-6">
          <select
            onChange={(e) => handleSelectCompany(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">분석할 회사 선택...</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-2 border-slate-700 rounded-full"></div>
              <div className="absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-400 animate-pulse">AI가 기업 정보를 분석 중입니다...</p>
          </div>
        )}

        {analysis && !analysis.error && (
          <div className="space-y-6 animate-[fade-in_0.3s]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnalysisCard title="기업 규모" value={analysis.size} />
              <AnalysisCard title="누적 투자" value={analysis.funding} />
              <AnalysisCard title="최근 매출" value={analysis.revenue} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-300 mb-3">최신 동향</h3>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                <p>
                  <strong className="text-slate-300">뉴스:</strong> {analysis.news}
                </p>
                <p>
                  <strong className="text-slate-300">프로젝트:</strong> {analysis.projects}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-300 mb-3">관련 링크</h3>
              <div className="flex gap-4">
                <a
                  href={analysis.links.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-slate-700 hover:bg-slate-600 p-3 rounded-lg font-semibold"
                >
                  홈페이지
                </a>
                <a
                  href={analysis.links.blog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-slate-700 hover:bg-slate-600 p-3 rounded-lg font-semibold"
                >
                  기술 블로그
                </a>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !analysis && <div className="text-center text-slate-500 py-8">분석할 회사를 선택해주세요.</div>}
      </div>
    </div>
  );
};
