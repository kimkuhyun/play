import React, { useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { useCareerOS, useApplications, useResumes } from './hooks';
import { DEFAULT_RESUME_BLOCKS } from './utils/mockData';
import { CommandCenter } from './components/views/CommandCenter';
import { ProcessingScreen } from './components/views/ProcessingScreen';
import { CompanyAnalysisView } from './components/views/CompanyAnalysisView';
import { InterviewPrepView } from './components/views/InterviewPrepView';
import { StarredView } from './components/views/StarredView';
import { KanbanView } from './components/views/KanbanView';
import { SettingsView } from './components/views/SettingsView';
import { MapWidget } from './components/widgets/MapWidget';
import { AnalysisWidget } from './components/widgets/AnalysisWidget';
import { EditorWidget } from './components/widgets/EditorWidget';
import { Sidebar } from './components/widgets/Sidebar';
import { EditApplicationModal } from './components/modals/EditApplicationModal';
import { JobPostingModal } from './components/modals/JobPostingModal';

const CareerOS: React.FC = () => {
  const {
    viewState,
    companies,
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
  } = useCareerOS();

  const { toggleStar, updateStatus, addApplication, removeFromBoard, saveApplicationDetails } = useApplications(applications, setApplications);
  const { addKeyword, deleteResume } = useResumes(companies);
  const editorPanelRef = useRef<any>(null);

  const handleMapAction = useCallback(
    (action: string, companyId: number) => {
      setActiveNodeId(null);
      const company = companies.find((c) => c.id === companyId);

      if (action === 'star') {
        toggleStar(companyId);
        return;
      }
      if (action === 'analyze') {
        setAnalysisCompanyId((prevId) => (prevId === companyId ? null : companyId));
      } else if (action === 'resume') {
        setAnalysisCompanyId((prevId) => (prevId === companyId ? null : companyId));
        setEditorCompanyId((prevId) => (prevId === companyId ? null : companyId));

        if (companyId !== null && !resumes[companyId] && editorCompanyId !== companyId) {
          setResumes((prev) => ({
            ...prev,
            [companyId]: [...DEFAULT_RESUME_BLOCKS, { id: Date.now(), type: 'p' as const, text: `\n[${company?.company} 맞춤형 내용 작성 시작...]` }],
          }));
        }

        const panel = editorPanelRef.current;
        if (panel && panel.isCollapsed()) panel.expand();
      }
    },
    [companies, resumes, toggleStar, editorCompanyId, setResumes, setAnalysisCompanyId, setEditorCompanyId, setActiveNodeId]
  );

  const handleAddKeywordWrapper = useCallback(
    (keyword: string) => {
      if (analysisCompanyId === null) return;
      setEditorCompanyId(analysisCompanyId);
      addKeyword(analysisCompanyId, keyword);
    },
    [analysisCompanyId, addKeyword, setEditorCompanyId]
  );

  const updateResumeBlocksWrapper = useCallback(
    (newBlocks: any) => {
      if (editorCompanyId !== null) {
        setResumes((prev) => ({
          ...prev,
          [editorCompanyId]: newBlocks,
        }));
      }
    },
    [editorCompanyId, setResumes]
  );

  const handleShowPosting = useCallback((company: any) => {
    setModalCompany(company);
  }, [setModalCompany]);

  const handleClosePosting = useCallback(() => {
    setModalCompany(null);
  }, [setModalCompany]);

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
                onTabChange={(tab: any) => {
                  setSidebarTab(tab);
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
                                onKeywordClick={handleAddKeywordWrapper}
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
                          {Object.keys(resumes).map((id) => {
                            const company = companies.find((c) => c.id === parseInt(id));
                            return (
                              <div
                                key={id}
                                className={`bg-slate-800 rounded-xl border transition-all animate-[fade-in_0.3s] group relative ${
                                  editorCompanyId === parseInt(id) ? 'border-indigo-500' : 'border-slate-700'
                                }`}
                              >
                                <div
                                  onClick={() => {
                                    setEditorCompanyId((prevId) => (prevId === parseInt(id) ? null : parseInt(id)));
                                  }}
                                  className="p-4 cursor-pointer h-full"
                                >
                                  <div className="font-bold text-lg">{company?.company || 'Unknown'} 지원서</div>
                                  <div className="text-slate-400 text-sm mt-2">최종 수정: 방금 전</div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteResume(parseInt(id));
                                  }}
                                  className="absolute top-3 right-3 p-1.5 rounded-full text-slate-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            );
                          })}
                          {Object.keys(resumes).length === 0 && (
                            <div className="text-slate-500">작성된 이력서가 없습니다. 지도에서 기업을 선택해 작성해보세요.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {sidebarTab === 'analysis' && <CompanyAnalysisView companies={companies} />}
                  {sidebarTab === 'activity' && (
                    <KanbanView
                      companies={companies}
                      applications={applications}
                      onUpdateStatus={updateStatus}
                      onAddApplication={addApplication}
                      onRemoveFromBoard={removeFromBoard}
                      onEdit={(company) => setEditingApp(company)}
                    />
                  )}
                  {sidebarTab === 'starred' && (
                    <StarredView
                      companies={companies}
                      applications={applications}
                      onToggleStar={toggleStar}
                      onShowPosting={handleShowPosting}
                    />
                  )}
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
                          contentBlocks={resumes[editorCompanyId] || DEFAULT_RESUME_BLOCKS}
                          setContentBlocks={updateResumeBlocksWrapper}
                          activeCompany={companies.find((c) => c.id === editorCompanyId)?.company}
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
          onSave={saveApplicationDetails}
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
