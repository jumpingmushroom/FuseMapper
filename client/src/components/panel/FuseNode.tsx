import { useState } from 'react';
import type { FuseWithSockets, UpdateFuseInput } from '@fusemapper/shared';
import { calculateLoad, getLoadStatusColor, formatWattage, FUSE_TYPE_COLORS } from '@fusemapper/shared';
import { FuseModal } from './FuseModal';
import { SocketChain } from './SocketChain';
import { useUpdateFuse, useDeleteFuse } from '@/hooks';

interface FuseNodeProps {
  fuse: FuseWithSockets;
  panelId: string;
}

export function FuseNode({ fuse, panelId }: FuseNodeProps) {
  const updateFuse = useUpdateFuse(panelId);
  const deleteFuse = useDeleteFuse(panelId);
  const [showEditModal, setShowEditModal] = useState(false);

  const load = calculateLoad({
    fuseId: fuse.id,
    amperage: fuse.amperage,
    sockets: fuse.sockets,
  });

  const typeColor = FUSE_TYPE_COLORS[fuse.type as keyof typeof FUSE_TYPE_COLORS] || '#6B7280';

  const handleUpdate = async (data: UpdateFuseInput) => {
    await updateFuse.mutateAsync({ id: fuse.id, data });
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await deleteFuse.mutateAsync(fuse.id);
  };

  // Count total devices across all sockets
  const totalDevices = fuse.sockets.reduce((sum, socket) => sum + socket.devices.length, 0);

  return (
    <div className="flex flex-col items-center pt-4">
      {/* Fuse Node */}
      <div
        className={`relative bg-white rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md border
          ${!fuse.isActive ? 'opacity-60' : ''}
        `}
        style={{ width: '160px' }}
        onClick={() => setShowEditModal(true)}
      >
        {/* Slot Number Badge */}
        {fuse.slotNumber !== null && (
          <div className="absolute -top-3 -right-3 z-10">
            <div className="bg-blue-600 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-md border-2 border-white">
              {fuse.slotNumber}
            </div>
          </div>
        )}

        {/* Type indicator bar */}
        <div
          className="h-1.5 rounded-t-lg"
          style={{ backgroundColor: typeColor }}
        />

        {/* Content */}
        <div className="p-2">
          {/* Type badge and amperage */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span
              className="px-1.5 py-0.5 rounded text-white font-medium"
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
          <div className="text-sm font-medium text-gray-900 truncate">
            {fuse.label || 'Unlabeled'}
          </div>

          {/* Load indicator */}
          {fuse.amperage && totalDevices > 0 && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(load.loadPercentage, 100)}%`,
                    backgroundColor: getLoadStatusColor(load.status),
                  }}
                />
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                {formatWattage(load.totalWattage)} ({Math.round(load.loadPercentage)}%)
              </div>
            </div>
          )}

          {/* Socket/device count */}
          <div className="text-[10px] text-gray-400 mt-1">
            {fuse.sockets.length} socket{fuse.sockets.length !== 1 ? 's' : ''} · {totalDevices} device{totalDevices !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Socket Chain */}
      <SocketChain fuse={fuse} panelId={panelId} />

      {/* Edit Modal */}
      <FuseModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        loading={updateFuse.isPending}
        deleteLoading={deleteFuse.isPending}
        fuse={fuse}
        panelId={panelId}
      />
    </div>
  );
}
