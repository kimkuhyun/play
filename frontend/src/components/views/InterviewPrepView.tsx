import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Company, InterviewQuestion } from '../../types';

interface InterviewPrepViewProps {
  companies: Company[];
}

const DEFAULT_QUESTIONS: InterviewQuestion[] = [
  { id: 1, q: 'React의 가상 DOM(Virtual DOM)에 대해 설명해주세요.', a: '', cat: 'React' },
  { id: 2, q: '클로저(Closure)란 무엇이며, 어떤 경우에 사용되나요?', a: '', cat: 'JavaScript' },
  { id: 3, q: '프로젝트 진행 중 가장 어려웠던 기술적 문제는 무엇이었고, 어떻게 해결했나요?', a: '', cat: '인성/경험' },
];

export const InterviewPrepView: React.FC<InterviewPrepViewProps> = ({ companies }) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [interviewData, setInterviewData] = useState<Record<string, InterviewQuestion[]>>({});
  const [activeId, setActiveId] = useState<number | null>(null);

  const updateAnswer = (companyId: string, questionId: number, answer: string) => {
    setInterviewData((prev) => ({
      ...prev,
      [companyId]: prev[companyId].map((q) => (q.id === questionId ? { ...q, a: answer } : q)),
    }));
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    if (companyId && !interviewData[companyId]) {
      setInterviewData((prev) => ({
        ...prev,
        [companyId]: DEFAULT_QUESTIONS,
      }));
    }
    setActiveId(null);
  };

  return (
    <div className="h-full p-2 animate-[fade-in_0.3s]">
      <div className="h-full bg-slate-900 rounded-3xl p-8 text-white border border-slate-800 overflow-y-auto custom-scrollbar">
        <h2 className="text-2xl font-bold mb-8">면접 준비</h2>
        <div className="mb-6">
          <select
            onChange={(e) => handleCompanyChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">회사 선택...</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </select>
        </div>

        {selectedCompanyId && interviewData[selectedCompanyId] ? (
          <div className="space-y-4">
            {interviewData[selectedCompanyId].map((q) => (
              <div key={q.id} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setActiveId(activeId === q.id ? null : q.id)}
                  className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-800"
                >
                  <div>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md mr-3">{q.cat}</span>
                    <span className="font-semibold">{q.q}</span>
                  </div>
                  <ChevronRight size={18} className={`transition-transform ${activeId === q.id ? 'rotate-90' : ''}`} />
                </button>
                {activeId === q.id && (
                  <div className="p-4 border-t border-slate-700">
                    <textarea
                      className="w-full h-32 bg-slate-900 p-3 rounded-md text-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="나만의 답변을 작성해보세요..."
                      value={q.a}
                      onChange={(e) => updateAnswer(selectedCompanyId, q.id, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 py-8">면접 준비를 시작할 회사를 선택해주세요.</div>
        )}
      </div>
    </div>
  );
};
