import { useState, useCallback } from 'react';
import type { Company, ApplicationData, ResumeBlock, ViewState } from '../types';
import { generateMockData, DEFAULT_RESUME_BLOCKS } from '../utils/mockData';

export const useCareerOS = () => {
  const [viewState, setViewState] = useState<ViewState>('command');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'search' | 'analysis' | 'activity' | 'starred' | 'prep' | 'resumes' | 'settings'>('search');
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [analysisCompanyId, setAnalysisCompanyId] = useState<number | null>(null);
  const [editorCompanyId, setEditorCompanyId] = useState<number | null>(null);
  const [resumes, setResumes] = useState<Record<number, ResumeBlock[]>>({});
  const [applications, setApplications] = useState<Record<number, ApplicationData>>({});
  const [modalCompany, setModalCompany] = useState<Company | null>(null);
  const [editingApp, setEditingApp] = useState<Company | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleBatchAnalyze = useCallback((urls: string[]) => {
    setViewState('processing');
    setTimeout(() => {
      const parsedData = generateMockData(urls);
      setCompanies(parsedData);
      if (urls.some((u) => u.startsWith('demo'))) {
        setApplications({
          1: { starred: true, status: 'to-apply' },
          2: { starred: true, status: 'applied' },
          3: { starred: true, status: 'interview' },
          4: { starred: true, status: 'starred' },
          5: { starred: false, status: 'to-apply' },
          6: { starred: true, status: 'interview' },
        });
      }
      setViewState('dashboard');
    }, 1500);
  }, []);

  const handleClearData = useCallback(() => {
    setCompanies([]);
    setResumes({});
    setApplications({});
    setActiveNodeId(null);
    setAnalysisCompanyId(null);
    setEditorCompanyId(null);
    setSidebarTab('search');
  }, []);

  return {
    viewState,
    setViewState,
    companies,
    setCompanies,
    sidebarTab,
    setSidebarTab,
    activeNodeId,
    setActiveNodeId,
    analysisCompanyId,
    setAnalysisCompanyId,
    editorCompanyId,
    setEditorCompanyId,
    resumes,
    setResumes,
    applications,
    setApplications,
    modalCompany,
    setModalCompany,
    editingApp,
    setEditingApp,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    handleBatchAnalyze,
    handleClearData,
  };
};

export const useApplications = (applications: Record<number, ApplicationData>, setApplications: (apps: Record<number, ApplicationData>) => void) => {
  const toggleStar = useCallback(
    (companyId: number) => {
      setApplications({
        ...applications,
        [companyId]: {
          ...applications[companyId],
          starred: !applications[companyId]?.starred,
          status: applications[companyId]?.status || (applications[companyId]?.starred ? undefined : 'starred'),
        },
      });
    },
    [applications, setApplications]
  );

  const updateStatus = useCallback(
    (companyId: number, newStatus: string) => {
      setApplications({
        ...applications,
        [companyId]: { ...applications[companyId], status: newStatus as any },
      });
    },
    [applications, setApplications]
  );

  const addApplication = useCallback(
    (companyId: number, status: string) => {
      setApplications({
        ...applications,
        [companyId]: { ...applications[companyId], status: status as any },
      });
    },
    [applications, setApplications]
  );

  const removeFromBoard = useCallback(
    (companyId: number) => {
      const currentApp = applications[companyId];
      if (!currentApp?.status) return;

      const { status, ...rest } = currentApp;
      const newApp = Object.keys(rest).length === 0 ? undefined : rest;

      const newApplications = { ...applications };
      if (newApp) {
        newApplications[companyId] = newApp;
      } else {
        delete newApplications[companyId];
      }
      setApplications(newApplications);
    },
    [applications, setApplications]
  );

  const saveApplicationDetails = useCallback(
    (companyId: number, details: Partial<ApplicationData>) => {
      setApplications({
        ...applications,
        [companyId]: { ...applications[companyId], ...details },
      });
    },
    [applications, setApplications]
  );

  return {
    toggleStar,
    updateStatus,
    addApplication,
    removeFromBoard,
    saveApplicationDetails,
  };
};

export const useResumes = (companies: Company[]) => {
  const [resumes, setResumes] = useState<Record<number, ResumeBlock[]>>({});

  const updateResumeBlocks = useCallback((companyId: number, blocks: ResumeBlock[]) => {
    setResumes((prev) => ({
      ...prev,
      [companyId]: blocks,
    }));
  }, []);

  const addKeyword = useCallback(
    (companyId: number, keyword: string) => {
      const company = companies.find((c) => c.id === companyId);
      if (!company) return;

      const newBlock: ResumeBlock = {
        id: Date.now(),
        type: 'p',
        text: `✨ [${company.company}] "${keyword}" 관련 경험을 여기에 작성하세요.`,
      };

      setResumes((prev) => {
        const existingResume = prev[companyId];
        const newResumeBlocks = existingResume
          ? [...existingResume, newBlock]
          : [...DEFAULT_RESUME_BLOCKS, { id: Date.now() + 1, type: 'p' as const, text: `\n[${company.company} 맞춤형 내용 작성 시작...]` }, newBlock];
        return { ...prev, [companyId]: newResumeBlocks };
      });
    },
    [companies]
  );

  const deleteResume = useCallback((companyId: number) => {
    if (window.confirm('정말로 이 이력서를 삭제하시겠습니까?')) {
      setResumes((prev) => {
        const newResumes = { ...prev };
        delete newResumes[companyId];
        return newResumes;
      });
    }
  }, []);

  return {
    resumes,
    setResumes,
    updateResumeBlocks,
    addKeyword,
    deleteResume,
  };
};
