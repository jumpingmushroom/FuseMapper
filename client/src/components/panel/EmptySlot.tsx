import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

interface EmptySlotProps {
  onClick: () => void;
}

export function EmptySlot({ onClick }: EmptySlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `empty-slot-${Math.random()}`,
    data: { type: 'empty' },
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-12 h-24 bg-gray-200 rounded flex items-center justify-center
        cursor-pointer hover:bg-gray-300 transition-colors
        ${isOver ? 'bg-blue-100 ring-2 ring-blue-500' : ''}
      `}
      onClick={onClick}
    >
      <Plus size={16} className="text-gray-400" />
    </div>
  );
}
