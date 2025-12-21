import React from 'react';

interface SettingsViewProps {
  onClearData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onClearData }) => {
  const handleClear = () => {
    if (window.confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      onClearData();
    }
  };

  return (
    <div className="h-full p-2 animate-[fade-in_0.3s]">
      <div className="h-full bg-slate-900 rounded-3xl p-8 text-white border border-slate-800">
        <h2 className="text-2xl font-bold mb-8">설정</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">데이터 관리</h3>
            <button
              onClick={handleClear}
              className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              모든 데이터 초기화
            </button>
            <p className="text-xs text-slate-500 mt-2">분석한 공고, 작성한 이력서, 관심 목록 등 모든 정보가 영구적으로 삭제됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
