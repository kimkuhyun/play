import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, MapPin, Brain, FileText, ChevronRight, ChevronLeft, PanelLeft,
  Sparkles, Layout, Share2, Globe, Clock, 
  Building2, ArrowRight, CheckCircle2, Plus, GripVertical, X, Layers, CalendarDays, Star, Inbox, Pencil, FileText as FileTextIcon,
  BarChart3, Mic, MessageSquare
} from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DndContext, useSensor, useSensors, PointerSensor, closestCorners } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


// --- Mock Data Generator for Multiple Links ---
const generateMockData = (urls) => {
  const mockDatabase = [
    { id: 0, company: 'Toss Bank', location: '강남구 테헤란로 142', lat: 30, lng: 50, salary: '7,000+', keywords: ['React', '금융', 'Toss Core'], deadline: 'D-7', description: '- 금융의 모든 순간을 쉽고 간편하게 만드는 Frontend 개발\n- TypeScript 기반의 웹 앱 설계 및 구현\n- 사용자 중심의 UI/UX 개선 및 성능 최적화' },
    { id: 1, company: 'Dangn', location: '서초구 강남대로 465', lat: 45, lng: 60, salary: '6,500+', keywords: ['Vue', '지역기반', 'Hyperlocal'], deadline: 'D-12', description: '- 당근 서비스의 웹 프론트엔드 개발\n- 지역 커뮤니티 활성화를 위한 신규 기능 개발\n- Vue.js 및 Nuxt.js 기반의 서비스 운영 및 개선' },
    { id: 2, company: 'Kakao', location: '제주 첨단로 242', lat: 80, lng: 20, salary: '5,500+', keywords: ['AI', 'Platform', 'Large Scale'], deadline: 'D-3', description: '- 카카오의 다양한 서비스 웹 개발\n- 대규모 트래픽 처리를 위한 아키텍처 설계\n- 최신 웹 기술을 활용한 프로토타이핑 및 개발' },
    { id: 3, company: 'Naver', location: '성남시 분당구 불정로 6', lat: 60, lng: 80, salary: '6,000+', keywords: ['Search', 'Backend', 'Optimization'], deadline: '상시', description: '- 네이버 검색 및 AI 서비스의 UI 개발\n- Svelte, React 등 다양한 기술 스택 활용\n- 웹 접근성 및 성능 표준 준수를 위한 노력' },
    { id: 4, company: 'Coupang', location: '송파구 송파대로 570', lat: 25, lng: 75, salary: '7,500+', keywords: ['E-commerce', 'AWS', 'Java'], deadline: 'D-20', description: '- 쿠팡의 이커머스 플랫폼 프론트엔드 개발\n- A/B 테스트를 통한 사용자 경험 데이터 분석 및 개선\n- AWS 기반의 클라우드 환경에서의 개발' },
    { id: 5, company: 'Woowa Bros', location: '송파구 위례성대로 2', lat: 35, lng: 85, salary: '6,800+', keywords: ['Spring', 'MSA', 'Food Tech'], deadline: '상시', description: '- 배달의민족 서비스의 웹 프론트엔드 개발\n- MSA 환경에서의 서비스 개발 및 운영\n- 코드 리뷰 및 페어 프로그래밍을 통한 동료 성장 지원' },
    { id: 6, company: 'Line', location: '성남시 분당구 황새울로200번길', lat: 55, lng: 88, salary: '6,200+', keywords: ['Messenger', 'Global', 'Fintech'], deadline: 'D-5', description: '- 글로벌 메신저 라인의 웹 서비스 개발\n- 핀테크, 블록체인 등 신규 사업 관련 웹 개발\n- 다국어 및 현지화 지원을 위한 개발' },
    { id: 7, company: 'Viva Republica', location: '강남구 테헤란로 131', lat: 32, lng: 55, salary: '7,200+', keywords: ['Toss', 'TypeScript', 'Innovation'], deadline: 'D-10', description: '- 토스 서비스의 웹 프론트엔드 개발\n- 복잡한 금융 로직을 단순하고 직관적인 UI로 구현\n- 높은 수준의 코드 품질과 테스트 커버리지 유지' },
  ];
  
  // Return random subset or based on count for demo
  return urls.map((url, index) => {
    return { ...mockDatabase[index % mockDatabase.length], sourceUrl: url };
  });
};

// --- Components ---

// 1. Multi-Link Input Center (Batch Entry)
const CommandCenter = ({ onAnalyze }) => {
  const [currentInput, setCurrentInput] = useState('');
  const [urls, setUrls] = useState([]);

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (currentInput) {
      setUrls([...urls, currentInput]);
      setCurrentInput('');
    }
  };

  const removeUrl = (index) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background Ambient Light */}
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

        {/* URL Input Area */}
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
                if(e.key === 'Enter' && !currentInput) {
                    e.preventDefault();
                    if(urls.length > 0) onAnalyze(urls);
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

          {/* Added URLs List (Chips) */}
          {urls.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 border-t border-slate-800/50 max-h-32 overflow-y-auto custom-scrollbar">
              {urls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full text-sm animate-[fade-in_0.3s_ease-out]">
                  <span className="truncate max-w-[200px]">{url}</span>
                  <button onClick={() => removeUrl(idx)} className="hover:text-white"><X size={14}/></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <button 
            onClick={() => onAnalyze(urls)}
            className={`mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl transition-all flex items-center gap-2 font-bold text-lg shadow-lg shadow-indigo-500/20 ${urls.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            disabled={urls.length === 0}
        >
            <Layers size={20} />
            {urls.length}개 공고 분석 시작
        </button>

        {/* Quick Demo Links */}
        {urls.length === 0 && (
            <div className="mt-8 flex gap-3 opacity-60">
            <span className="text-xs text-slate-500 self-center">또는 데모 데이터로 시작:</span>
            <button onClick={() => onAnalyze(['demo1', 'demo2', 'demo3', 'demo4', 'demo5', 'demo6', 'demo7'])} className="text-xs text-indigo-400 hover:text-indigo-300 border-b border-indigo-400/50">
                인기 IT 기업 7곳 예시 보기
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

// 2. Loading Screen (Batch Processing)
const ProcessingScreen = ({ count }) => {
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

// 3. Multi-Pin Map Widget
const MapWidget = ({ companies, applications, activeNodeId, onNodeClick, onAction }) => {
  return (
    <div className="h-full w-full bg-slate-900 rounded-3xl overflow-hidden relative group border border-slate-800 flex flex-col shadow-2xl" onClick={() => onNodeClick(null)}>
      <div className="absolute top-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3 shadow-lg">
        <MapPin size={18} className="text-indigo-400" />
        <div className="text-sm font-bold text-white">채용 지도 ({companies.length}) <span className="text-slate-500 font-normal text-xs ml-2">기업을 클릭하여 작업 선택</span></div>
      </div>

      <div className="flex-1 bg-[#1a1b26] relative overflow-hidden">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(#2c2e3e 1px, transparent 1px), linear-gradient(90deg, #2c2e3e 1px, transparent 1px)', 
          backgroundSize: '40px 40px',
          opacity: 0.3
        }}></div>
        <svg className="absolute inset-0 w-full h-full stroke-slate-700/50 fill-none" strokeWidth="2">
            <path d="M-10 100 Q 150 150 300 100 T 600 150" />
            <path d="M100 -10 L 120 400" />
            <path d="M450 -10 L 420 400" />
        </svg>

        {companies.map((company) => (
            <div 
                key={company.id}
                className={`absolute transition-all duration-500 cursor-pointer flex flex-col items-center group/pin z-10`}
                style={{ top: `${company.lat}%`, left: `${company.lng}%` }}
                onClick={(e) => { e.stopPropagation(); onNodeClick(company.id); }}
            >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform ${activeNodeId === company.id ? 'bg-indigo-500 scale-125 z-20' : 'bg-slate-700 hover:bg-slate-600 hover:scale-110'}`}>
                    <Building2 size={16} className="text-white" />
                </div>
                
                {activeNodeId !== company.id && (
                  <div className={`mt-2 bg-slate-900/90 text-white px-2.5 py-1 rounded-md border border-slate-700 whitespace-nowrap text-xs`}>
                    <span className="font-semibold">{company.company}</span>
                    <span className={`ml-2 text-red-400 ${company.deadline === '상시' ? 'text-emerald-400' : ''}`}>{company.deadline}</span>
                  </div>
                )}

                {/* Context Menu on Map */}
                {activeNodeId === company.id && (
                    <div className="absolute top-10 flex flex-col gap-1 bg-slate-800 border border-slate-700 p-1.5 rounded-xl shadow-2xl z-50 animate-[fade-in_0.2s] min-w-[150px] cursor-default" onClick={e => e.stopPropagation()}>
                        <div className="text-xs font-bold text-white px-2 py-1 border-b border-slate-700 mb-1 flex justify-between items-center">
                          {company.company}
                          <button onClick={() => onNodeClick(null)}><X size={12} className="text-slate-500 hover:text-white"/></button>
                        </div>
                        <button onClick={() => onAction('analyze', company.id)} className="flex items-center gap-2 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white px-2 py-1.5 rounded-lg transition-colors text-left">
                            <Sparkles size={12} /> 기업 공고
                        </button>
                        <button onClick={() => onAction('star', company.id)} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-colors text-left ${applications[company.id]?.starred ? 'text-yellow-300 hover:bg-slate-700' : 'text-slate-300 hover:bg-indigo-600 hover:text-white'}`}>
                            <Star size={12} /> {applications[company.id]?.starred ? '관심 해제' : '관심 등록'}
                        </button>
                        <button onClick={() => onAction('resume', company.id)} className="flex items-center gap-2 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white px-2 py-1.5 rounded-lg transition-colors text-left">
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

// 4. Analysis Widget
const AnalysisWidget = ({ companies, applications, selectedId, onKeywordClick, onToggleStar }) => {
  const selectedData = companies.find(c => c.id === selectedId);
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
                    <button onClick={() => onToggleStar(selectedData.id)} className={`p-1.5 rounded-full transition-colors ${isStarred ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20' : 'text-slate-500 hover:bg-slate-700'}`}>
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
                    {selectedData.company}는 <strong>{selectedData.keywords[0]}</strong> 역량을 가장 중요하게 봅니다. 관련 프로젝트 경험을 최상단에 배치하세요.
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
        <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
            지도나 탭에서 기업을 선택하세요.
        </div>
      )}
    </div>
  );
};

// 5. Editor
const EditorWidget = ({ contentBlocks, setContentBlocks, activeCompany, onCollapse }) => {
  const [activeBlockId, setActiveBlockId] = useState(null);

  const addBlock = (type = 'p', text = '') => {
    const newBlock = { id: Date.now(), type, text };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const updateBlock = (id, text) => {
    setContentBlocks(contentBlocks.map(b => b.id === id ? { ...b, text } : b));
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
            <button className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">Preview</button>
            <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-colors">Export</button>
            <button 
              onClick={onCollapse} 
              className="ml-4 text-slate-500 hover:bg-slate-100 rounded-md p-1"
            >
              <ChevronRight size={20} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-white">
        <div className="max-w-3xl mx-auto space-y-2">
            <div className="mb-12 group">
                <h1 className="text-4xl font-bold text-slate-900 placeholder:text-slate-300 outline-none" contentEditable suppressContentEditableWarning>
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
                    <div className={`absolute left-0 top-1 text-slate-300 cursor-move opacity-0 ${activeBlockId === block.id ? 'opacity-100' : ''} hover:text-slate-500 transition-opacity`}>
                        <GripVertical size={16} />
                    </div>
                    <div 
                        className={`w-full outline-none empty:before:content-['/를_눌러_명령어_사용'] empty:before:text-slate-300 ${
                            block.type === 'h2' ? 'text-2xl font-bold mt-6 mb-2' : 
                            block.type === 'h3' ? 'text-xl font-semibold mt-4 mb-1' : 
                            'text-base leading-relaxed text-slate-700'
                        }`}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => updateBlock(block.id, e.currentTarget.textContent)}
                    >
                        {block.text}
                    </div>
                </div>
            ))}
            <div onClick={() => addBlock()} className="mt-4 text-slate-300 hover:text-slate-400 cursor-pointer flex items-center gap-2 text-sm">
                <Plus size={16} /> 블록 추가
            </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder for other sidebar tabs
const PlaceholderView = ({ title, children }) => (
    <div className="h-full p-2">
        <div className="h-full bg-slate-900 rounded-3xl p-8 text-white border border-slate-800 flex flex-col animate-[fade-in_0.3s]">
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
            <div className="flex-1 flex items-center justify-center text-slate-500 text-center px-4">
                {children || '준비 중인 기능입니다.'}
            </div>
        </div>
    </div>
);

// CompanyAnalysisView
const CompanyAnalysisView = ({ companies }) => {
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const detailedData = {
        '0': { size: '1,500명', funding: '2.1조원', revenue: '5,372억원 (2022)', news: '토스뱅크, 출범 2년만에 흑자 전환 성공', projects: '모바일 뱅킹 앱 고도화', links: { blog: 'https://blog.toss.im', homepage: 'https://toss.im' } },
        '1': { size: '500명', funding: '2,150억원', revenue: '비공개', news: '당근, 월간 활성 이용자 1,800만 돌파', projects: '지역 커뮤니티 서비스 확장', links: { blog: 'https://medium.com/daangn', homepage: 'https://www.daangn.com' } },
        '2': { size: '3,900명', funding: '상장', revenue: '7.1조원 (2022)', news: '카카오, AI 챗봇 ‘코GPT 2.0’ 공개 예정', projects: '카카오톡 채널 기능 강화', links: { blog: 'https://tech.kakao.com', homepage: 'https://www.kakaocorp.com' } },
        '3': { size: '4,500명', funding: '상장', revenue: '8.2조원 (2022)', news: '네이버, 하이퍼클로바X 기반 서비스 확대', projects: '차세대 검색 엔진 개발', links: { blog: 'https://d2.naver.com', homepage: 'https://www.navercorp.com' } },
        '4': { size: '63,000명', funding: '상장', revenue: '32조원 (2022)', news: '쿠팡, 대만 로켓배송 서비스 확장', projects: '물류 자동화 시스템 고도화', links: { blog: 'https://medium.com/coupang-tech', homepage: 'https://www.aboutcoupang.com' } },
        '5': { size: '2,000명', funding: '딜리버리히어로 인수', revenue: '2.9조원 (2022)', news: '배달의민족, B마트 서비스 지역 확대', projects: '배민1플러스 서비스 런칭', links: { blog: 'https://techblog.woowahan.com', homepage: 'https://www.woowahan.com' } },
        '6': { size: '9,000명', funding: '상장', revenue: '2.4조원 (2022)', news: '라인, NFT 마켓플레이스 ‘도시’ 출시', projects: '라인 블록체인 플랫폼 개발', links: { blog: 'https://engineering.linecorp.com', homepage: 'https://linepluscorp.com' } },
        '7': { size: '1,800명', funding: '2.1조원', revenue: '1.1조원 (2022)', news: '토스, 증권 및 페이먼츠 사업 확장', projects: '통합 금융 플랫폼 구축', links: { blog: 'https://blog.toss.im', homepage: 'https://toss.im' } },
    };

    const handleSelectCompany = (companyId) => {
        if (!companyId) {
            setSelectedCompanyId(null);
            setAnalysis(null);
            return;
        }
        setSelectedCompanyId(companyId);
        setIsLoading(true);
        setAnalysis(null);

        setTimeout(() => {
            setAnalysis(detailedData[companyId] || { error: '분석 데이터를 찾을 수 없습니다.' });
            setIsLoading(false);
        }, 1500);
    };

    const AnalysisCard = ({ title, value }) => (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <div className="text-sm text-slate-400 mb-1">{title}</div>
            <div className="text-lg font-semibold text-slate-100">{value}</div>
        </div>
    );

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
                        {companies.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
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
                                <p><strong className="text-slate-300">뉴스:</strong> {analysis.news}</p>
                                <p><strong className="text-slate-300">프로젝트:</strong> {analysis.projects}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-indigo-300 mb-3">관련 링크</h3>
                            <div className="flex gap-4">
                                <a href={analysis.links.homepage} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-slate-700 hover:bg-slate-600 p-3 rounded-lg font-semibold">홈페이지</a>
                                <a href={analysis.links.blog} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-slate-700 hover:bg-slate-600 p-3 rounded-lg font-semibold">기술 블로그</a>
                            </div>
                        </div>
                    </div>
                )}

                {!isLoading && !analysis && (
                    <div className="text-center text-slate-500 py-8">분석할 회사를 선택해주세요.</div>
                )}
            </div>
        </div>
    );
};

// Interview Prep View
const InterviewPrepView = ({ companies }) => {
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [interviewData, setInterviewData] = useState({});
    const [activeId, setActiveId] = useState(null);

    const updateAnswer = (companyId, questionId, answer) => {
        setInterviewData(prev => ({
            ...prev,
            [companyId]: prev[companyId].map(q => q.id === questionId ? { ...q, a: answer } : q)
        }));
    };

    const handleCompanyChange = (companyId) => {
        setSelectedCompanyId(companyId);
        if (companyId && !interviewData[companyId]) {
            // Initialize with default questions for the new company
            setInterviewData(prev => ({
                ...prev,
                [companyId]: [
                    { id: 1, q: "React의 가상 DOM(Virtual DOM)에 대해 설명해주세요.", a: "", cat: "React" },
                    { id: 2, q: "클로저(Closure)란 무엇이며, 어떤 경우에 사용되나요?", a: "", cat: "JavaScript" },
                    { id: 3, q: "프로젝트 진행 중 가장 어려웠던 기술적 문제는 무엇이었고, 어떻게 해결했나요?", a: "", cat: "인성/경험" },
                ]
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
                        {companies.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                    </select>
                </div>

                {selectedCompanyId && interviewData[selectedCompanyId] ? (
                    <div className="space-y-4">
                    {interviewData[selectedCompanyId].map(q => (
                        <div key={q.id} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                            <button onClick={() => setActiveId(activeId === q.id ? null : q.id)} className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-800">
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

// Starred Jobs View
const StarredView = ({ companies, applications, onToggleStar, onShowPosting }) => {
    const starredCompanies = companies.filter(c => applications[c.id]?.starred);
    const statusMap = { 'starred': '관심 등록', 'to-apply': '지원 예정', 'applied': '지원 완료', 'interview': '면접 진행' };

    if (starredCompanies.length === 0) {
        return <PlaceholderView title="관심 공고">지도에서 관심있는 공고의 ⭐를 눌러 추가해보세요.</PlaceholderView>;
    }

    return (
        <div className="h-full p-2 animate-[fade-in_0.3s]">
            <div className="h-full bg-slate-900 rounded-3xl p-8 text-white border border-slate-800 overflow-y-auto custom-scrollbar">
                <h2 className="text-2xl font-bold mb-6">관심 공고 ({starredCompanies.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {starredCompanies.map(company => (
                        <div key={company.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 group transition-all hover:shadow-xl hover:border-indigo-500/50">
                            <div className="h-36 w-full bg-slate-700 flex items-center justify-center">
                                <Building2 size={48} className="text-slate-500" />
                            </div>
                            <div className="p-4 relative">
                                <button onClick={() => onToggleStar(company.id)} className="absolute top-3 right-3 text-yellow-400 p-1 rounded-full hover:bg-slate-700">
                                    <Star size={18} fill="currentColor" />
                                </button>
                                <h3 className="font-bold text-white text-lg pr-8">{company.company}</h3>
                                <p className="text-sm text-slate-400 mt-1">Frontend Engineer</p>
                                <div className="mt-4 bg-slate-700/50 p-2 rounded-md text-xs">
                                    <span className="text-slate-400">진행 상태: </span>
                                    <span className="font-semibold text-indigo-300">{statusMap[applications[company.id]?.status] || '미지정'}</span>
                                </div>
                                <button onClick={() => onShowPosting(company)} className="mt-4 w-full text-center text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg">
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

// Kanban Board for My Activity
const KanbanCard = ({ company, application, onRemove, onEdit }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: company.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    
    const hasNotes = application?.notes && application.notes.trim() !== '';

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-slate-900 p-3 rounded-lg border border-slate-700 touch-none cursor-grab active:cursor-grabbing group relative">
            <div className="font-bold text-sm text-slate-200 pr-12">{application?.customName || company.company}</div>
            <p className="text-xs text-slate-400 mt-1">{application?.customJob || 'Frontend Engineer'}</p>
            <div className="flex justify-between items-center mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${company.deadline === '상시' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {company.deadline}
                </span>
                {hasNotes && <MessageSquare size={12} className="text-slate-500" />}
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white">
                    <Pencil size={12} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1.5 rounded-full text-slate-400 hover:bg-red-500/20 hover:text-red-400">
                    <X size={12} />
                </button>
            </div>
            {hasNotes && (
                <div className="absolute left-full top-0 ml-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-pre-wrap">
                    {application.notes}
                </div>
            )}
        </div>
    );
};

const EditApplicationModal = ({ company, application, onSave, onClose }) => {
    if (!company) return null;
    const [customName, setCustomName] = useState(application?.customName || '');
    const [customJob, setCustomJob] = useState(application?.customJob || '');
    const [notes, setNotes] = useState(application?.notes || '');

    const handleSave = () => {
        onSave(company.id, { customName, customJob, notes });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-[fade-in_0.2s]" onClick={onClose}>
            <div className="bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-white">활동 수정: {company.company}</h3>
                    <p className="text-sm text-slate-400 mt-1">지원 활동에 대한 세부 정보를 수정하세요.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">회사 이름 (별칭)</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900 p-2 rounded-md text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder={company.company}
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">직무</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900 p-2 rounded-md text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Frontend Engineer"
                            value={customJob}
                            onChange={(e) => setCustomJob(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-400 mb-2 block">메모</label>
                        <textarea
                            className="w-full h-32 bg-slate-900 p-3 rounded-md text-slate-300 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="면접 날짜, 담당자, 특이사항 등을 기록하세요..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-4 bg-slate-900/50 border-t border-slate-700">
                    <button onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700">취소</button>
                    <button onClick={handleSave} className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500">저장</button>
                </div>
            </div>
        </div>
    );
};

const KanbanView = ({ companies, applications, onUpdateStatus, onAddApplication, onRemoveFromBoard, onEdit }) => {
    const columns = {
        'starred': '관심',
        'to-apply': '지원 예정',
        'applied': '지원 완료',
        'interview': '면접',

    };

    const kanbanData = Object.keys(columns).reduce((acc, key) => ({ ...acc, [key]: [] }), {});
    companies.forEach(c => {
        const status = applications[c.id]?.status;
        if (status && kanbanData[status]) {
            kanbanData[status].push(c);
        }
    });
    
    const [addingToStatus, setAddingToStatus] = useState(null);
    const companiesToAdd = companies.filter(c => !applications[c.id]?.status);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeContainerId = active.data.current?.sortable.containerId;
        const overContainerId = over.data.current?.sortable?.containerId || overId;

        if (activeContainerId !== overContainerId) {
            const newStatus = String(overContainerId).replace('col-', '');
            if (columns[newStatus]) {
                onUpdateStatus(activeId, newStatus);
            }
        }
    };

    return (
        <div className="h-full p-2 animate-[fade-in_0.3s]">
            <div className="h-full bg-slate-900 rounded-3xl p-8 text-white border border-slate-800 flex flex-col overflow-hidden">
                <h2 className="text-2xl font-bold mb-6">내 활동</h2>
                <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                    <div className="flex-1 flex gap-6 overflow-x-auto custom-scrollbar pb-4">
                        {Object.entries(columns).map(([statusKey, title]) => (
                            <div key={statusKey} className="w-72 bg-slate-800/50 rounded-xl p-3 flex-shrink-0 flex flex-col">
                                <div className="flex justify-between items-center px-2 mb-4">
                                    <h3 className="font-semibold text-sm">{title} <span className="text-slate-500">{kanbanData[statusKey].length}</span></h3>
                                    <div className="relative">
                                        <button onClick={() => setAddingToStatus(addingToStatus === statusKey ? null : statusKey)} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white">
                                            <Plus size={16} />
                                        </button>
                                        {addingToStatus === statusKey && (
                                            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-20 p-2">
                                                {companiesToAdd.length > 0 ? companiesToAdd.map(c => (
                                                    <button key={c.id} onClick={() => { onAddApplication(c.id, statusKey); setAddingToStatus(null); }} className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-indigo-600">{c.company}</button>
                                                )) : <div className="text-xs text-slate-500 px-2 py-1.5">추가할 회사가 없습니다.</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <SortableContext id={`col-${statusKey}`} items={kanbanData[statusKey].map(c => c.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-3 h-full overflow-y-auto custom-scrollbar pr-1">
                                        {kanbanData[statusKey].map(company => 
                                            <KanbanCard 
                                                key={company.id} 
                                                company={company} 
                                                application={applications[company.id]}
                                                onEdit={() => onEdit(company)} 
                                                onRemove={() => onRemoveFromBoard(company.id)} />
                                        )}
                                        {kanbanData[statusKey].length === 0 && (
                                            <div className="text-center text-xs text-slate-600 pt-10 h-full">카드가 없습니다.</div>
                                        )}
                                    </div>
                                </SortableContext>
                            </div>
                        ))}
                    </div>
                </DndContext>
            </div>
        </div>
    );
};

// Settings View
const SettingsView = ({ onClearData }) => {
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
                        <button onClick={handleClear} className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">모든 데이터 초기화</button>
                        <p className="text-xs text-slate-500 mt-2">분석한 공고, 작성한 이력서, 관심 목록 등 모든 정보가 영구적으로 삭제됩니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 6. Sidebar
const Sidebar = ({ isCollapsed, onCollapse, activeTab, onTabChange }) => {
    const NavItem = ({ id, icon, children }) => (
        <button onClick={() => onTabChange(id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
            {icon}
            {!isCollapsed && <span className="flex-1">{children}</span>}
        </button>
    );

    return (
        <div className="h-full flex flex-col bg-slate-900 text-white p-2">
            <div className="flex items-center justify-between p-2 mb-4">
                {!isCollapsed && <div className="font-bold">CareerOS</div>}
                <button onClick={() => onCollapse(!isCollapsed)} className="text-slate-400 hover:text-white">
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1">
                <NavItem id="search" icon={<Search size={16} />}>공고 지도</NavItem>
                <NavItem id="analysis" icon={<BarChart3 size={16} />}>기업 분석</NavItem>
                <NavItem id="activity" icon={<Inbox size={16} />}>내 활동</NavItem>
                <NavItem id="starred" icon={<Star size={16} />}>관심 공고</NavItem>
                <NavItem id="prep" icon={<Mic size={16} />}>면접 준비</NavItem>
                <NavItem id="resumes" icon={<FileText size={16} />}>이력서 관리</NavItem>
            </nav>
            <div className="p-2 border-t border-slate-800">
                <NavItem id="settings" icon={<Layout size={16} />}>설정</NavItem>
            </div>
        </div>
    );
};

// Job Posting Modal
const JobPostingModal = ({ company, onClose }) => {
    if (!company) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-[fade-in_0.2s]" onClick={onClose}>
            <div className="bg-slate-800 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700" onClick={e => e.stopPropagation()}>
                {/* Header */}
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
                {/* Content */}
                <div className="flex-1 bg-white overflow-y-auto">
                    <img src={`https://via.placeholder.com/1024x2048.png/FFFFFF/000000?text=Job+Posting+for+${company.company.replace(' ', '+')}`} alt={`${company.company} job posting`} className="w-full" />
                </div>
            </div>
        </div>
    );
};


// --- Main App Logic ---

const CareerOS = () => {
  const [viewState, setViewState] = useState('command');
  const [companies, setCompanies] = useState([]);
  
  // Dashboard State
  const [sidebarTab, setSidebarTab] = useState('search');
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [analysisCompanyId, setAnalysisCompanyId] = useState(null);
  const [editorCompanyId, setEditorCompanyId] = useState(null);
  const [resumes, setResumes] = useState({}); // { companyId: blocks[] }
  const [applications, setApplications] = useState({}); // { [companyId]: { starred: boolean, status: string } }
  const [modalCompany, setModalCompany] = useState(null);
  const [editingApp, setEditingApp] = useState(null); // Holds company object for editing

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const editorPanelRef = useRef(null);
  
  const defaultResume = [
    { id: 1, type: 'h2', text: '김철수 | Frontend Developer' },
    { id: 2, type: 'p', text: '3년차 프론트엔드 개발자 김철수입니다. 복잡한 비즈니스 요구사항을 직관적이고 효율적인 UI/UX로 구현하는 데 강점이 있습니다. 새로운 기술을 배우고 팀과 지식을 공유하는 것을 좋아합니다.' },
    { id: 3, type: 'h2', text: 'Work Experience' },
    { id: 4, type: 'h3', text: 'Gemini Corp (2022.03 - 현재)' },
    { id: 5, type: 'p', text: '금융 데이터 시각화 대시보드 개발을 담당했습니다. React와 D3.js를 사용하여 대용량 데이터를 실시간으로 차트와 그래프로 표현했으며, 컴포넌트 최적화를 통해 초기 로딩 속도를 60% 이상 개선했습니다.' },
    { id: 6, type: 'h3', text: 'AI Inc. (2020.01 - 2022.02)' },
    { id: 7, type: 'p', text: 'Vue.js 기반의 이커머스 플랫폼 프론트엔드 개발팀의 일원으로 참여했습니다. 장바구니, 결제, 주문 내역 등 주요 사용자 플로우를 개발하고 UI/UX 개선에 기여했습니다.'},
    { id: 8, type: 'h2', text: 'Projects' },
    { id: 9, type: 'h3', text: '개인 포트폴리오 사이트' },
    { id: 10, type: 'p', text: 'Next.js와 Tailwind CSS를 사용하여 제작한 반응형 개인 웹사이트입니다. 저의 프로젝트와 기술 스택을 소개하며, Vercel을 통해 배포 및 관리하고 있습니다.' },
    { id: 11, type: 'h2', text: 'Skills' },
    { id: 12, type: 'p', text: 'Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3\nFrameworks: React, Next.js, Vue.js\nLibraries: Redux, Zustand, React Query, D3.js, Tailwind CSS\nTools: Git, Webpack, Vite, Figma' },
  ];

  const handleBatchAnalyze = (urls) => {
    setViewState('processing');
    
    setTimeout(() => {
      const parsedData = generateMockData(urls);
      setCompanies(parsedData);
      if (urls.some(u => u.startsWith('demo'))) {
          setApplications({
              '1': { starred: true, status: 'to-apply' },
              '2': { starred: true, status: 'applied' },
              '3': { starred: true, status: 'interview' },
              '4': { starred: true, status: 'starred' },
              '5': { starred: false, status: 'to-apply' },
              '6': { starred: true, status: 'interview' },
          });
      }
      setViewState('dashboard');
    }, 1500);
  };

  const handleClearData = () => {
    setCompanies([]);
    setResumes({});
    setApplications({});
    setActiveNodeId(null);
    setAnalysisCompanyId(null);
    setEditorCompanyId(null);
    setSidebarTab('search');
    // Optionally, could also reset the viewState to 'command'
  };

  const toggleStar = useCallback((companyId) => {
    setApplications(prev => {
      const app = prev[companyId] || {};
      const newStarred = !app.starred;
      return {
        ...prev,
        [companyId]: {
          ...app,
          starred: newStarred,
          // If starring for the first time, set status to 'starred'
          status: app.status || (newStarred ? 'starred' : undefined)
        }
      };
    });
  }, []);

  // Handle Map Actions
  const handleMapAction = useCallback((action, companyId) => {
    setActiveNodeId(null); // Close menu
    const company = companies.find(c => c.id === companyId);

    if (action === 'star') {
        toggleStar(companyId);
        return;
    }
    if (action === 'analyze') {
        setAnalysisCompanyId(prevId => prevId === companyId ? null : companyId);
    } else if (action === 'resume') {
        // 이력서 작성을 누르면 분석창과 이력서창을 동시에 켭니다.
        setAnalysisCompanyId(prevId => prevId === companyId ? null : companyId);
        setEditorCompanyId(prevId => prevId === companyId ? null : companyId);

        // Check if resume exists, if not create from default
        if (companyId !== null && !resumes[companyId] && editorCompanyId !== companyId) {
            setResumes(prev => ({
                ...prev,
                [companyId]: [...defaultResume, { id: Date.now(), type: 'p', text: `\n[${company.company} 맞춤형 내용 작성 시작...]` }]
            }));
        }

        // Expand panel if needed
        const panel = editorPanelRef.current;
        if (panel && panel.isCollapsed()) panel.expand();
    }
  }, [companies, resumes, toggleStar]);

  const handleAddKeyword = useCallback((keyword, companyName) => {
    const targetId = analysisCompanyId; // 키워드 추가는 분석 패널에서 발생
    if (targetId === null) return;

    // 키워드 추가 시 이력서가 해당 기업으로 열려있지 않다면 열어줍니다.
    setEditorCompanyId(targetId);

    const newBlock = { id: Date.now(), type: 'p', text: `✨ [${companyName}] "${keyword}" 관련 경험을 여기에 작성하세요.` };
    
    setResumes(prev => {
        const existingResume = prev[targetId];
        const company = companies.find(c => c.id === targetId);
        const newResumeBlocks = existingResume 
            ? [...existingResume, newBlock]
            : [...defaultResume, { id: Date.now() + 1, type: 'p', text: `\n[${company?.company} 맞춤형 내용 작성 시작...]` }, newBlock];
        
        return { ...prev, [targetId]: newResumeBlocks };
    });
  }, [analysisCompanyId, companies, defaultResume]);

  // Helper to update resume blocks
  const updateResumeBlocks = (newBlocks) => {
    if (editorCompanyId !== null) {
        setResumes(prev => ({
            ...prev,
            [editorCompanyId]: newBlocks
        }));
    }
  };

  const handleNavigation = useCallback((tab, companyId) => {
    setSidebarTab(tab);
    if (tab === 'search') {
      // 지도 탭으로 이동하며 특정 회사를 분석/하이라이트합니다.
      setAnalysisCompanyId(companyId);
      setActiveNodeId(companyId);
    }
  }, []);

  const handleDeleteResume = useCallback((idToDelete) => {
    if (window.confirm('정말로 이 이력서를 삭제하시겠습니까?')) {
        setResumes(prev => {
            const newResumes = { ...prev };
            delete newResumes[idToDelete];
            return newResumes;
        });
        // If the deleted resume was being edited, close the editor
        const numericId = parseInt(idToDelete, 10);
        if (editorCompanyId === numericId) {
            setEditorCompanyId(null);
        }
    }
  }, [editorCompanyId]);

  const handleShowPosting = useCallback((company) => {
    setModalCompany(company);
  }, []);

  const handleClosePosting = useCallback(() => {
    setModalCompany(null);
  }, []);

  const handleUpdateStatus = useCallback((companyId, newStatus) => {
    setApplications(prev => ({
        ...prev,
        [companyId]: { ...prev[companyId], status: newStatus }
    }));
  }, []);

  const handleAddApplication = useCallback((companyId, status) => {
    setApplications(prev => ({
        ...prev,
        [companyId]: { ...prev[companyId], status }
    }));
  }, []);

  const handleRemoveFromBoard = useCallback((companyId) => {
    setApplications(prev => {
        const currentApp = prev[companyId];
        if (!currentApp || !currentApp.status) return prev;
        
        const { status, ...rest } = currentApp;
        
        if (Object.keys(rest).length === 0) {
            const { [companyId]: _, ...newApps } = prev;
            return newApps;
        }
        
        return {
            ...prev,
            [companyId]: rest
        };
    });
  }, []);

  const handleEditApplication = useCallback((company) => {
    setEditingApp(company);
  }, []);

  const handleSaveApplicationDetails = useCallback((companyId, details) => {
    setApplications(prev => ({
        ...prev,
        [companyId]: { ...prev[companyId], ...details }
    }));
    setEditingApp(null);
  }, []);

  return (
    <div className="font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {viewState === 'command' && <CommandCenter onAnalyze={handleBatchAnalyze} />}
      {viewState === 'processing' && <ProcessingScreen count={companies.length || 3} />}
      
      {viewState === 'dashboard' && (
        <div className="h-screen bg-slate-950">
            <PanelGroup direction="horizontal" className="h-full">
                <Panel 
                    defaultSize={15}
                    minSize={10}
                    maxSize={20}
                    collapsible={true}
                    collapsedSize={4}
                    onCollapse={setIsSidebarCollapsed}
                    className="!overflow-y-auto"
                >
                    <Sidebar 
                        isCollapsed={isSidebarCollapsed} 
                        onCollapse={setIsSidebarCollapsed} 
                        activeTab={sidebarTab}
                        onTabChange={(tab) => {
                            setSidebarTab(tab);
                            // 탭 변경 시 관련 패널들을 정리합니다.
                            if (tab !== 'search') {
                                setActiveNodeId(null);
                                setAnalysisCompanyId(null);
                            }
                            if (tab !== 'search' && tab !== 'resumes') {
                                setEditorCompanyId(null);
                            }
                        }}
                    />
                </Panel>
                <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-indigo-500 transition-colors" />
                <Panel defaultSize={85} minSize={50}>
                    <PanelGroup direction="horizontal">
                        <Panel defaultSize={60} minSize={30}>
                            {sidebarTab === 'search' && (
                                <PanelGroup direction="vertical">
                                    <Panel defaultSize={65} minSize={25}>
                                        <div className="h-full p-2 pb-1">
                                            <MapWidget 
                                                companies={companies} 
                                                applications={applications}
                                                activeNodeId={activeNodeId} 
                                                onNodeClick={setActiveNodeId}
                                                onAction={handleMapAction}
                                            />
                                        </div>
                                    </Panel>
                                    {analysisCompanyId !== null && (
                                        <>
                                            <PanelResizeHandle className="h-1 bg-slate-800 hover:bg-indigo-500 transition-colors flex items-center justify-center">
                                                <div className="w-8 h-1.5 bg-slate-700 rounded-full" />
                                            </PanelResizeHandle>
                                            <Panel defaultSize={35} minSize={20} collapsible onCollapse={() => setAnalysisCompanyId(null)}>
                                                <div className="h-full p-2 pt-1">
                                                    <AnalysisWidget 
                                                        companies={companies} 
                                                        applications={applications}
                                                        selectedId={analysisCompanyId} 
                                                        onKeywordClick={handleAddKeyword}
                                                        onToggleStar={toggleStar}
                                                    />
                                                </div>
                                            </Panel>
                                        </>
                                    )}
                                </PanelGroup>
                            )}
                            {sidebarTab === 'resumes' && (
                                <div className="h-full p-2">
                                <div className="h-full bg-slate-900 rounded-3xl p-8 text-white border border-slate-800">
                                    <h2 className="text-2xl font-bold mb-6">내 이력서 보관함</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.keys(resumes).map(id => {
                                            const company = companies.find(c => c.id === parseInt(id));
                                            return (
                                                <div key={id} className={`bg-slate-800 rounded-xl border transition-all animate-[fade-in_0.3s] group relative ${editorCompanyId === parseInt(id) ? 'border-indigo-500' : 'border-slate-700'}`}>
                                                    <div onClick={() => { setEditorCompanyId(prevId => prevId === parseInt(id) ? null : parseInt(id)); }} className="p-4 cursor-pointer h-full">
                                                        <div className="font-bold text-lg">{company?.company || 'Unknown'} 지원서</div>
                                                        <div className="text-slate-400 text-sm mt-2">최종 수정: 방금 전</div>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteResume(id); }} className="absolute top-3 right-3 p-1.5 rounded-full text-slate-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {Object.keys(resumes).length === 0 && <div className="text-slate-500">작성된 이력서가 없습니다. 지도에서 기업을 선택해 작성해보세요.</div>}
                                    </div>
                                </div>
                                </div>
                            )}
                            {sidebarTab === 'analysis' && <CompanyAnalysisView companies={companies} />}
                            {sidebarTab === 'activity' && <KanbanView companies={companies} applications={applications} onUpdateStatus={handleUpdateStatus} onAddApplication={handleAddApplication} onRemoveFromBoard={handleRemoveFromBoard} onEdit={handleEditApplication} />}
                            {sidebarTab === 'starred' && <StarredView companies={companies} applications={applications} onToggleStar={toggleStar} onShowPosting={handleShowPosting} />}
                            {sidebarTab === 'prep' && <InterviewPrepView companies={companies} />}
                            {sidebarTab === 'settings' && <SettingsView onClearData={handleClearData} />}
                        </Panel>
                        
                        {editorCompanyId !== null && (
                            <>
                                <PanelResizeHandle className="w-1 bg-slate-800 hover:bg-indigo-500 transition-colors flex items-center justify-center">
                                    <div className="w-1.5 h-8 bg-slate-700 rounded-full"></div>
                                </PanelResizeHandle>
                                <Panel 
                                    ref={editorPanelRef}
                                    defaultSize={40} 
                                    minSize={20}
                                    collapsible={true}
                                    onCollapse={() => setEditorCompanyId(null)}
                                >
                                    <div className="p-2 h-full animate-[slide-in-right_0.3s_ease-out]">
                                        <EditorWidget 
                                            contentBlocks={resumes[editorCompanyId] || defaultResume} 
                                            setContentBlocks={updateResumeBlocks} 
                                            activeCompany={companies.find(c => c.id === editorCompanyId)?.company}
                                            onCollapse={() => setEditorCompanyId(null)}
                                        />
                                    </div>
                                </Panel>
                            </>
                        )}
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
      )}

      {modalCompany && <JobPostingModal company={modalCompany} onClose={handleClosePosting} />}

      {editingApp && (
        <EditApplicationModal 
            company={editingApp}
            application={applications[editingApp.id]}
            onSave={handleSaveApplicationDetails}
            onClose={() => setEditingApp(null)}
        />
      )}

      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-left {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #475569;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #64748b;
        }
      `}</style>
    </div>
  );
};

export default CareerOS;
