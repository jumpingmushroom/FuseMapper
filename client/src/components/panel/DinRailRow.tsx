import { useState } from 'react';
import type { FuseWithDevices, CreateFuseInput } from '@fusemapper/shared';
import { FuseModule } from './FuseModule';
import { EmptySlot } from './EmptySlot';
import { FuseModal } from './FuseModal';
import { useCreateFuse } from '@/hooks';

interface DinRailRowProps {
  panelId: string;
  row: number;
  slotsPerRow: number;
  fuses: FuseWithDevices[];
}

interface SlotOccupancy {
  type: 'fuse' | 'empty' | 'continuation';
  fuse?: FuseWithDevices;
  slotIndex: number;
}

export function DinRailRow({ panelId, row, slotsPerRow, fuses }: DinRailRowProps) {
  const createFuse = useCreateFuse(panelId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSlot, setCreateSlot] = useState(0);

  // Build slot occupancy map
  const slots: SlotOccupancy[] = [];
  for (let i = 0; i < slotsPerRow; i++) {
    const fuse = fuses.find((f) => f.slotStart === i);
    if (fuse) {
      slots.push({ type: 'fuse', fuse, slotIndex: i });
      // Mark continuation slots
      for (let j = 1; j < fuse.slotWidth; j++) {
        slots.push({ type: 'continuation', fuse, slotIndex: i + j });
      }
      i += fuse.slotWidth - 1;
    } else {
      // Check if this slot is a continuation of a previous fuse
      const isContinuation = fuses.some(
        (f) => i > f.slotStart && i < f.slotStart + f.slotWidth
      );
      if (!isContinuation) {
        slots.push({ type: 'empty', slotIndex: i });
      }
    }
  }

  const handleCreateClick = (slotIndex: number) => {
    setCreateSlot(slotIndex);
    setShowCreateModal(true);
  };

  const handleCreate = async (data: Omit<CreateFuseInput, 'panelId'>) => {
    await createFuse.mutateAsync(data);
    setShowCreateModal(false);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-2">
      {/* Row Label */}
      <div className="text-xs text-gray-500 mb-1 px-1">Row {row + 1}</div>

      {/* DIN Rail */}
      <div className="flex gap-0.5 bg-gray-300 p-1 rounded">
        {slots.map((slot) => {
          if (slot.type === 'continuation') {
            return null; // Skip continuation slots
          }
          if (slot.type === 'fuse' && slot.fuse) {
            return (
              <FuseModule
                key={`fuse-${slot.fuse.id}`}
                fuse={slot.fuse}
                panelId={panelId}
              />
            );
          }
          return (
            <EmptySlot
              key={`empty-${slot.slotIndex}`}
              onClick={() => handleCreateClick(slot.slotIndex)}
            />
          );
        })}
      </div>

      {/* Create Fuse Modal */}
      <FuseModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        loading={createFuse.isPending}
        defaultValues={{ row, slotStart: createSlot }}
      />
    </div>
  );
}
