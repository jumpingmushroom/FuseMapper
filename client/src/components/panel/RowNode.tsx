import { useState } from 'react';
import type { RowWithFuses, UpdateRowInput } from '@fusemapper/shared';
import { Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { FuseNode } from './FuseNode';
import { RowModal } from './RowModal';
import { useUpdateRow, useDeleteRow } from '@/hooks';
import { Button } from '@/components/ui';

interface RowNodeProps {
  row: RowWithFuses;
  panelId: string;
  onNavigateToSubPanel?: (subPanelId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Helper function to calculate total wattage from all devices in a row
function calculateRowWattage(row: RowWithFuses): number {
  let totalWattage = 0;

  for (const fuse of row.fuses) {
    // Add wattage from devices in sockets
    for (const socket of fuse.sockets || []) {
      for (const device of socket.devices || []) {
        totalWattage += device.estimatedWattage || 0;
      }
    }
    // Add wattage from hardwired devices
    for (const device of fuse.hardwiredDevices || []) {
      totalWattage += device.estimatedWattage || 0;
    }
  }

  return totalWattage;
}

export function RowNode({ row, panelId, onNavigateToSubPanel, isCollapsed = false, onToggleCollapse }: RowNodeProps) {
  const updateRow = useUpdateRow(panelId);
  const deleteRow = useDeleteRow(panelId);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleUpdate = async (data: UpdateRowInput) => {
    await updateRow.mutateAsync({ id: row.id, data });
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    if (row.fuses.length > 0) {
      alert('Cannot delete row with fuses. Remove or reassign fuses first.');
      return;
    }
    await deleteRow.mutateAsync(row.id);
    setShowEditModal(false);
  };

  const totalCount = row.fuses.length;
  const spdCount = row.fuses.filter(f => f.type === 'SPD').length;
  const fuseCount = totalCount - spdCount;
  const emptySlots = Math.max(0, row.maxFuses - totalCount);
  const totalWattage = calculateRowWattage(row);

  // Build count display string
  const countDisplay = () => {
    const parts: string[] = [];
    if (fuseCount > 0) {
      parts.push(`${fuseCount} fuse${fuseCount !== 1 ? 's' : ''}`);
    }
    if (spdCount > 0) {
      parts.push(`${spdCount} SPD${spdCount !== 1 ? 's' : ''}`);
    }
    if (parts.length === 0) {
      return `0/${row.maxFuses} devices`;
    }
    return `${parts.join(', ')} (${totalCount}/${row.maxFuses})`;
  };

  return (
    <div className="mb-6">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-3">
          {/* Collapse/Expand Button */}
          <button
            onClick={onToggleCollapse}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label={isCollapsed ? 'Expand row' : 'Collapse row'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
          </button>

          <h3 className="text-sm font-semibold text-gray-700">
            {row.label || `Row ${row.position + 1}`}
          </h3>
          <span className="text-xs text-gray-500">
            {countDisplay()}
          </span>

          {/* Summary when collapsed */}
          {isCollapsed && (
            <span className="text-xs text-gray-600 font-medium">
              • {totalWattage.toLocaleString()}W total
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowEditModal(true)}
          icon={<Edit2 size={14} />}
        >
          Edit
        </Button>
      </div>

      {/* Row Container - only show when expanded */}
      {!isCollapsed && (
        <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex gap-4 overflow-x-auto">
            {/* Fuses */}
            {row.fuses.map((fuse) => (
              <div key={fuse.id} className="flex-shrink-0">
                <FuseNode
                  fuse={fuse}
                  panelId={panelId}
                  onNavigateToSubPanel={onNavigateToSubPanel}
                />
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: emptySlots }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="flex-shrink-0 w-40 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white"
              >
                <span className="text-xs text-gray-400">Empty slot</span>
              </div>
            ))}

            {/* No fuses message */}
            {totalCount === 0 && emptySlots === 0 && (
              <div className="w-full py-8 text-center text-gray-400 text-sm">
                No capacity set. Edit row to set maximum fuses.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <RowModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        loading={updateRow.isPending}
        deleteLoading={deleteRow.isPending}
        row={row}
      />
    </div>
  );
}
