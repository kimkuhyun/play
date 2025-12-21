import React from 'react';
import { Search, BarChart3, Inbox, Star, Mic, FileText, Layout, ChevronRight, ChevronLeft } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavItem: React.FC<{
  id: string;
  icon: React.ReactNode;
  children: string;
  isCollapsed: boolean;
  isActive: boolean;
  onClick: (id: string) => void;
}> = ({ id, icon, children, isCollapsed, isActive, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
    }`}
  >
    {icon}
    {!isCollapsed && <span className="flex-1 text-left">{children}</span>}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onCollapse, activeTab, onTabChange }) => {
  return (
    <div className="h-full flex flex-col bg-slate-900 text-white p-2">
      <div className="flex items-center justify-between p-2 mb-4">
        {!isCollapsed && <div className="font-bold">CareerOS</div>}
        <button onClick={() => onCollapse(!isCollapsed)} className="text-slate-400 hover:text-white">
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        <NavItem id="search" icon={<Search size={16} />} isCollapsed={isCollapsed} isActive={activeTab === 'search'} onClick={onTabChange}>
          공고 지도
        </NavItem>
        <NavItem
          id="analysis"
          icon={<BarChart3 size={16} />}
          isCollapsed={isCollapsed}
          isActive={activeTab === 'analysis'}
          onClick={onTabChange}
        >
          기업 분석
        </NavItem>
        <NavItem
          id="activity"
          icon={<Inbox size={16} />}
          isCollapsed={isCollapsed}
          isActive={activeTab === 'activity'}
          onClick={onTabChange}
        >
          내 활동
        </NavItem>
        <NavItem
          id="starred"
          icon={<Star size={16} />}
          isCollapsed={isCollapsed}
          isActive={activeTab === 'starred'}
          onClick={onTabChange}
        >
          관심 공고
        </NavItem>
        <NavItem
          id="prep"
          icon={<Mic size={16} />}
          isCollapsed={isCollapsed}
          isActive={activeTab === 'prep'}
          onClick={onTabChange}
        >
          면접 준비
        </NavItem>
        <NavItem
          id="resumes"
          icon={<FileText size={16} />}
          isCollapsed={isCollapsed}
          isActive={activeTab === 'resumes'}
          onClick={onTabChange}
        >
          이력서 관리
        </NavItem>
      </nav>
      <div className="p-2 border-t border-slate-800">
        <NavItem
          id="settings"
          icon={<Layout size={16} />}
          isCollapsed={isCollapsed}
          isActive={activeTab === 'settings'}
          onClick={onTabChange}
        >
          설정
        </NavItem>
      </div>
    </div>
  );
};
