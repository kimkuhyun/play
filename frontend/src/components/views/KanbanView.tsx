import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DndContext, useSensor, useSensors, PointerSensor, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Company, ApplicationData } from '../../types';
import { KanbanCard } from '../cards/KanbanCard';

interface KanbanViewProps {
  companies: Company[];
  applications: Record<number, ApplicationData>;
  onUpdateStatus: (companyId: number, newStatus: string) => void;
  onAddApplication: (companyId: number, status: string) => void;
  onRemoveFromBoard: (companyId: number) => void;
  onEdit: (company: Company) => void;
}

const COLUMNS = {
  starred: '관심',
  'to-apply': '지원 예정',
  applied: '지원 완료',
  interview: '면접',
};

export const KanbanView: React.FC<KanbanViewProps> = ({
  companies,
  applications,
  onUpdateStatus,
  onAddApplication,
  onRemoveFromBoard,
  onEdit,
}) => {
  const [addingToStatus, setAddingToStatus] = useState<string | null>(null);

  const kanbanData = Object.keys(COLUMNS).reduce((acc, key) => ({ ...acc, [key]: [] }), {} as Record<string, Company[]>);
  companies.forEach((c) => {
    const status = applications[c.id]?.status;
    if (status && kanbanData[status as keyof typeof COLUMNS]) {
      kanbanData[status as keyof typeof COLUMNS].push(c);
    }
  });

  const companiesToAdd = companies.filter((c) => !applications[c.id]?.status);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainerId = active.data.current?.sortable.containerId;
    const overContainerId = over.data.current?.sortable?.containerId || over.id;

    if (activeContainerId !== overContainerId) {
      const newStatus = String(overContainerId).replace('col-', '');
      if (COLUMNS[newStatus as keyof typeof COLUMNS]) {
        onUpdateStatus(active.id, newStatus);
      }
    }
  };

  return (
    <div className="h-full p-2 animate-[fade-in_0.3s]">
      <div className="h-full bg-slate-900 rounded-3xl p-8 text-white border border-slate-800 flex flex-col overflow-hidden">
        <h2 className="text-2xl font-bold mb-6">내 활동</h2>
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="flex-1 flex gap-6 overflow-x-auto custom-scrollbar pb-4">
            {Object.entries(COLUMNS).map(([statusKey, title]) => (
              <div key={statusKey} className="w-72 bg-slate-800/50 rounded-xl p-3 flex-shrink-0 flex flex-col">
                <div className="flex justify-between items-center px-2 mb-4">
                  <h3 className="font-semibold text-sm">
                    {title} <span className="text-slate-500">{kanbanData[statusKey].length}</span>
                  </h3>
                  <div className="relative">
                    <button
                      onClick={() => setAddingToStatus(addingToStatus === statusKey ? null : statusKey)}
                      className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white"
                    >
                      <Plus size={16} />
                    </button>
                    {addingToStatus === statusKey && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-20 p-2">
                        {companiesToAdd.length > 0 ? (
                          companiesToAdd.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                onAddApplication(c.id, statusKey);
                                setAddingToStatus(null);
                              }}
                              className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-indigo-600"
                            >
                              {c.company}
                            </button>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500 px-2 py-1.5">추가할 회사가 없습니다.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <SortableContext
                  id={`col-${statusKey}`}
                  items={kanbanData[statusKey].map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 h-full overflow-y-auto custom-scrollbar pr-1">
                    {kanbanData[statusKey].map((company) => (
                      <KanbanCard
                        key={company.id}
                        company={company}
                        application={applications[company.id]}
                        onEdit={() => onEdit(company)}
                        onRemove={() => onRemoveFromBoard(company.id)}
                      />
                    ))}
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
