import { useState } from 'react';
import type { FuseWithSockets, UpdateFuseInput } from '@fusemapper/shared';
import { calculateLoad, getLoadStatusColor, formatWattage, FUSE_TYPE_COLORS } from '@fusemapper/shared';
import { FuseModal } from './FuseModal';
import { SocketChain } from './SocketChain';
import { useUpdateFuse, useDeleteFuse } from '@/hooks';
import { Grid3x3 } from 'lucide-react';

interface FuseNodeProps {
  fuse: FuseWithSockets;
  panelId: string;
  onNavigateToSubPanel?: (subPanelId: string) => void;
}

export function FuseNode({ fuse, panelId, onNavigateToSubPanel }: FuseNodeProps) {
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

  // Check if fuse has a sub-panel
  const subPanel = (fuse as any).subPanel;
  const hasSubPanel = !!subPanel;

  const handleFuseClick = () => {
    if (hasSubPanel && onNavigateToSubPanel) {
      // Navigate to sub-panel instead of opening edit modal
      onNavigateToSubPanel(subPanel.id);
    } else {
      setShowEditModal(true);
    }
  };

  return (
    <div className="flex flex-col items-center pt-4">
      {/* Fuse Node */}
      <div
        className={`relative bg-white rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md border
          ${!fuse.isActive ? 'opacity-60' : ''}
          ${hasSubPanel ? 'border-l-4 border-l-purple-500' : ''}
        `}
        style={{ width: '160px' }}
        onClick={handleFuseClick}
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
          {/* Type badge, amperage, and sub-panel indicator */}
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1">
              <span
                className="px-1.5 py-0.5 rounded text-white font-medium"
                style={{ backgroundColor: typeColor }}
              >
                {fuse.type}
              </span>
              {hasSubPanel && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                  <Grid3x3 size={10} />
                </span>
              )}
            </div>
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

          {/* Sub-panel name if present */}
          {hasSubPanel && (
            <div className="text-xs text-purple-600 font-medium truncate mt-0.5">
              → {subPanel.name}
            </div>
          )}

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

          {/* Socket/device count or sub-panel indicator */}
          {!hasSubPanel && (
            <div className="text-[10px] text-gray-400 mt-1">
              {fuse.sockets.length} socket{fuse.sockets.length !== 1 ? 's' : ''} · {totalDevices} device{totalDevices !== 1 ? 's' : ''}
            </div>
          )}
          {hasSubPanel && (
            <div className="text-[10px] text-purple-500 mt-1 font-medium">
              Click to view sub-panel
            </div>
          )}
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
