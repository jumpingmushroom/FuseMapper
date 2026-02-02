import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { FuseWithDevices, UpdateFuseInput } from '@fusemapper/shared';
import { calculateLoad, getLoadStatusColor, formatWattage } from '@fusemapper/shared';
import { FUSE_TYPE_COLORS } from '@fusemapper/shared';
import { FuseModal } from './FuseModal';
import { DeviceList } from '../device/DeviceList';
import { useUpdateFuse, useDeleteFuse } from '@/hooks';

interface FuseModuleProps {
  fuse: FuseWithDevices;
  panelId: string;
}

export function FuseModule({ fuse, panelId }: FuseModuleProps) {
  const updateFuse = useUpdateFuse(panelId);
  const deleteFuse = useDeleteFuse(panelId);
  const [showEditModal, setShowEditModal] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `fuse-${fuse.id}`,
    data: { type: 'fuse', fuseId: fuse.id },
  });

  const load = calculateLoad({
    fuseId: fuse.id,
    amperage: fuse.amperage,
    devices: fuse.devices,
  });

  const typeColor = FUSE_TYPE_COLORS[fuse.type as keyof typeof FUSE_TYPE_COLORS] || '#6B7280';
  const slotWidth = 48 * fuse.slotWidth + (fuse.slotWidth - 1) * 2; // 48px per slot + 2px gaps

  const handleUpdate = async (data: UpdateFuseInput) => {
    await updateFuse.mutateAsync({ id: fuse.id, data });
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await deleteFuse.mutateAsync(fuse.id);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ width: slotWidth }}
        className={`relative bg-white rounded shadow-sm cursor-pointer transition-all
          ${isOver ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
          ${!fuse.isActive ? 'opacity-60' : ''}
        `}
        onClick={() => setShowEditModal(true)}
      >
        {/* Type indicator bar */}
        <div
          className="h-1 rounded-t"
          style={{ backgroundColor: typeColor }}
        />

        {/* Content */}
        <div className="p-1">
          {/* Type badge and amperage */}
          <div className="flex items-center justify-between text-[10px] mb-0.5">
            <span
              className="px-1 rounded text-white font-medium"
              style={{ backgroundColor: typeColor }}
            >
              {fuse.type}
            </span>
            {fuse.amperage && (
              <span className="font-bold text-gray-700">
                {fuse.amperage}A{fuse.curveType ? fuse.curveType : ''}
              </span>
            )}
          </div>

          {/* Label */}
          <div className="text-xs font-medium text-gray-900 truncate min-h-[16px]">
            {fuse.label || 'Unlabeled'}
          </div>

          {/* Load indicator */}
          {fuse.amperage && fuse.devices.length > 0 && (
            <div className="mt-1">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(load.loadPercentage, 100)}%`,
                    backgroundColor: getLoadStatusColor(load.status),
                  }}
                />
              </div>
              <div className="text-[9px] text-gray-500 mt-0.5">
                {formatWattage(load.totalWattage)} ({Math.round(load.loadPercentage)}%)
              </div>
            </div>
          )}

          {/* Devices */}
          {fuse.devices.length > 0 && (
            <DeviceList
              devices={fuse.devices}
              panelId={panelId}
              compact
            />
          )}
        </div>

        {/* Room color stripe (if any device has a room) */}
        {fuse.devices.some((d) => d.room) && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 flex">
            {fuse.devices
              .filter((d) => d.room)
              .slice(0, 3)
              .map((d) => (
                <div
                  key={d.id}
                  className="flex-1"
                  style={{ backgroundColor: d.room?.color }}
                />
              ))}
          </div>
        )}
      </div>

      <FuseModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        loading={updateFuse.isPending}
        deleteLoading={deleteFuse.isPending}
        fuse={fuse}
      />
    </>
  );
}
