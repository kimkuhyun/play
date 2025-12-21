import React from 'react';
import { Building2, Star } from 'lucide-react';
import type { Company, ApplicationData } from '../../types';

interface StarredViewProps {
  companies: Company[];
  applications: Record<number, ApplicationData>;
  onToggleStar: (companyId: number) => void;
  onShowPosting: (company: Company) => void;
}

const STATUS_MAP: Record<string, string> = {
  starred: '관심 등록',
  'to-apply': '지원 예정',
  applied: '지원 완료',
  interview: '면접 진행',
};

const PlaceholderView: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="h-full p-2">
    <div className="h-full bg-slate-900 rounded-3xl p-8 text-white border border-slate-800 flex flex-col animate-[fade-in_0.3s]">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="flex-1 flex items-center justify-center text-slate-500 text-center px-4">{children || '준비 중인 기능입니다.'}</div>
    </div>
  </div>
);

export const StarredView: React.FC<StarredViewProps> = ({ companies, applications, onToggleStar, onShowPosting }) => {
  const starredCompanies = companies.filter((c) => applications[c.id]?.starred);

  if (starredCompanies.length === 0) {
    return (
      <PlaceholderView title="관심 공고">지도에서 관심있는 공고의 ⭐를 눌러 추가해보세요.</PlaceholderView>
    );
  }

  return (
    <div className="h-full p-2 animate-[fade-in_0.3s]">
      <div className="h-full bg-slate-900 rounded-3xl p-8 text-white border border-slate-800 overflow-y-auto custom-scrollbar">
        <h2 className="text-2xl font-bold mb-6">관심 공고 ({starredCompanies.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {starredCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 group transition-all hover:shadow-xl hover:border-indigo-500/50"
            >
              <div className="h-36 w-full bg-slate-700 flex items-center justify-center">
                <Building2 size={48} className="text-slate-500" />
              </div>
              <div className="p-4 relative">
                <button
                  onClick={() => onToggleStar(company.id)}
                  className="absolute top-3 right-3 text-yellow-400 p-1 rounded-full hover:bg-slate-700"
                >
                  <Star size={18} fill="currentColor" />
                </button>
                <h3 className="font-bold text-white text-lg pr-8">{company.company}</h3>
                <p className="text-sm text-slate-400 mt-1">Frontend Engineer</p>
                <div className="mt-4 bg-slate-700/50 p-2 rounded-md text-xs">
                  <span className="text-slate-400">진행 상태: </span>
                  <span className="font-semibold text-indigo-300">{STATUS_MAP[applications[company.id]?.status as string] || '미지정'}</span>
                </div>
                <button
                  onClick={() => onShowPosting(company)}
                  className="mt-4 w-full text-center text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg"
                >
                  공고 보기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
