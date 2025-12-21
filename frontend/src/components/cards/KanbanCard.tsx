import React from 'react';
import { Pencil, X, MessageSquare } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Company, ApplicationData } from '../../types';

interface KanbanCardProps {
  company: Company;
  application?: ApplicationData;
  onRemove: () => void;
  onEdit: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ company, application, onRemove, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: company.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasNotes = application?.notes && application.notes.trim() !== '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-slate-900 p-3 rounded-lg border border-slate-700 touch-none cursor-grab active:cursor-grabbing group relative"
    >
      <div className="font-bold text-sm text-slate-200 pr-12">{application?.customName || company.company}</div>
      <p className="text-xs text-slate-400 mt-1">{application?.customJob || 'Frontend Engineer'}</p>
      <div className="flex justify-between items-center mt-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            company.deadline === '상시' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}
        >
          {company.deadline}
        </span>
        {hasNotes && <MessageSquare size={12} className="text-slate-500" />}
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1.5 rounded-full text-slate-400 hover:bg-red-500/20 hover:text-red-400"
        >
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
