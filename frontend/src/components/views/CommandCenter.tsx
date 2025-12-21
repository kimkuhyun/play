import React, { useState } from 'react';
import { Globe, X, Layers } from 'lucide-react';

interface CommandCenterProps {
  onAnalyze: (urls: string[]) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onAnalyze }) => {
  const [currentInput, setCurrentInput] = useState('');
  const [urls, setUrls] = useState<string[]>([]);

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput) {
      setUrls([...urls, currentInput]);
      setCurrentInput('');
    }
  };

  const removeUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="z-10 w-full max-w-2xl px-6 flex flex-col items-center">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-indigo-200">
            Career Map 3.0
          </h1>
          <p className="text-slate-400 text-lg">
            관심 있는 공고 링크들을 모두 붙여넣으세요.<br/>
            <span className="text-indigo-400 text-sm">AI가 지도를 기반으로 이력서 작성을 도와줍니다.</span>
          </p>
        </div>

        <div className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-2 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500">
          <form onSubmit={handleAddUrl} className="flex items-center gap-2 p-2">
            <Globe className="text-slate-500 ml-2" size={20} />
            <input
              type="text"
              className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-slate-600"
              placeholder="https://..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !currentInput && urls.length > 0) {
                  e.preventDefault();
                  onAnalyze(urls);
                }
              }}
            />
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              disabled={!currentInput}
            >
              추가 +
            </button>
          </form>

          {urls.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 border-t border-slate-800/50 max-h-32 overflow-y-auto custom-scrollbar">
              {urls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full text-sm animate-[fade-in_0.3s_ease-out]">
                  <span className="truncate max-w-[200px]">{url}</span>
                  <button onClick={() => removeUrl(idx)} className="hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onAnalyze(urls)}
          className={`mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl transition-all flex items-center gap-2 font-bold text-lg shadow-lg shadow-indigo-500/20 ${
            urls.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
          disabled={urls.length === 0}
        >
          <Layers size={20} />
          {urls.length}개 공고 분석 시작
        </button>

        {urls.length === 0 && (
          <div className="mt-8 flex gap-3 opacity-60">
            <span className="text-xs text-slate-500 self-center">또는 데모 데이터로 시작:</span>
            <button
              onClick={() => onAnalyze(['demo1', 'demo2', 'demo3', 'demo4', 'demo5', 'demo6', 'demo7'])}
              className="text-xs text-indigo-400 hover:text-indigo-300 border-b border-indigo-400/50"
            >
              인기 IT 기업 7곳 예시 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
