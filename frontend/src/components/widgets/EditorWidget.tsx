import React, { useState } from 'react';
import { FileText, ChevronRight, GripVertical, Plus } from 'lucide-react';
import type { ResumeBlock } from '../../types';

interface EditorWidgetProps {
  contentBlocks: ResumeBlock[];
  setContentBlocks: (blocks: ResumeBlock[]) => void;
  activeCompany?: string;
  onCollapse: () => void;
}

export const EditorWidget: React.FC<EditorWidgetProps> = ({ contentBlocks, setContentBlocks, activeCompany, onCollapse }) => {
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);

  const addBlock = (type: 'h2' | 'h3' | 'p' = 'p', text = '') => {
    const newBlock: ResumeBlock = { id: Date.now(), type, text };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const updateBlock = (id: number, text: string) => {
    setContentBlocks(contentBlocks.map((b) => (b.id === id ? { ...b, text } : b)));
  };

  return (
    <div className="h-full w-full bg-slate-50 text-slate-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-2 text-slate-400 truncate max-w-[200px]">
          <FileText size={16} />
          <span className="text-sm font-medium text-slate-600">
            {activeCompany ? `Resume_for_${activeCompany}.pdf` : 'Master_Resume.pdf'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
            Preview
          </button>
          <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-colors">
            Export
          </button>
          <button onClick={onCollapse} className="ml-4 text-slate-500 hover:bg-slate-100 rounded-md p-1">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-white">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="mb-12 group">
            <h1 className="text-4xl font-bold text-slate-900 placeholder:text-slate-300 outline-none">
              {activeCompany ? `${activeCompany} 지원 맞춤 이력서` : '마스터 이력서'}
            </h1>
          </div>

          {contentBlocks.map((block) => (
            <div
              key={block.id}
              className="group flex items-start -ml-8 pl-8 relative"
              onMouseEnter={() => setActiveBlockId(block.id)}
              onMouseLeave={() => setActiveBlockId(null)}
            >
              <div
                className={`absolute left-0 top-1 text-slate-300 cursor-move opacity-0 ${activeBlockId === block.id ? 'opacity-100' : ''} hover:text-slate-500 transition-opacity`}
              >
                <GripVertical size={16} />
              </div>
              <div
                className={`w-full outline-none empty:before:content-['/를_눌러_명령어_사용'] empty:before:text-slate-300 ${
                  block.type === 'h2'
                    ? 'text-2xl font-bold mt-6 mb-2'
                    : block.type === 'h3'
                      ? 'text-xl font-semibold mt-4 mb-1'
                      : 'text-base leading-relaxed text-slate-700'
                }`}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => updateBlock(block.id, (e.currentTarget as HTMLDivElement).textContent || '')}
              >
                {block.text}
              </div>
            </div>
          ))}
          <div
            onClick={() => addBlock()}
            className="mt-4 text-slate-300 hover:text-slate-400 cursor-pointer flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> 블록 추가
          </div>
        </div>
      </div>
    </div>
  );
};
