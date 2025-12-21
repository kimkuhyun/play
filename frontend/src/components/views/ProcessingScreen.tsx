import React from 'react';
import { Layers } from 'lucide-react';

interface ProcessingScreenProps {
  count: number;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ count }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
        <Layers className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={32} />
      </div>
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold animate-pulse">{count}개의 채용 공고를 분석 중입니다...</h2>
        <div className="flex flex-col gap-1 text-sm text-slate-500 font-mono">
          <span>위치 정보 매핑 중...</span>
          <span>기업 인재상 키워드 추출 중...</span>
        </div>
      </div>
    </div>
  );
};
