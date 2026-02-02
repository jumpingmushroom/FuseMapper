import { useState } from 'react';
import type { RowWithFuses, UpdateRowInput } from '@fusemapper/shared';
import { Edit2 } from 'lucide-react';
import { FuseNode } from './FuseNode';
import { RowModal } from './RowModal';
import { useUpdateRow, useDeleteRow } from '@/hooks';
import { Button } from '@/components/ui';

interface RowNodeProps {
  row: RowWithFuses;
  panelId: string;
  onNavigateToSubPanel?: (subPanelId: string) => void;
}

export function RowNode({ row, panelId, onNavigateToSubPanel }: RowNodeProps) {
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

  const fuseCount = row.fuses.length;
  const emptySlots = Math.max(0, row.maxFuses - fuseCount);

  return (
    <div className="mb-6">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {row.label || `Row ${row.position + 1}`}
          </h3>
          <span className="text-xs text-gray-500">
            {fuseCount}/{row.maxFuses} fuses
          </span>
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

      {/* Row Container */}
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
          {fuseCount === 0 && emptySlots === 0 && (
            <div className="w-full py-8 text-center text-gray-400 text-sm">
              No capacity set. Edit row to set maximum fuses.
            </div>
          )}
        </div>
      </div>

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
