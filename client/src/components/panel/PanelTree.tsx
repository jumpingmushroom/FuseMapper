import type { Panel, RowWithFuses, FuseWithSockets } from '@fusemapper/shared';
import { MainBreakerNode } from './MainBreakerNode';
import { RowNode } from './RowNode';
import { FuseNode } from './FuseNode';
import { RowModal } from './RowModal';
import { FuseModal } from './FuseModal';
import { useState, useEffect } from 'react';
import { useCreateRow, useCreateFuse } from '@/hooks';
import { Plus, Layers, ChevronsDown, ChevronsUp } from 'lucide-react';
import { Button } from '@/components/ui';

interface PanelTreeProps {
  panel: Panel & {
    rows?: RowWithFuses[];
    fuses?: FuseWithSockets[];
  };
  onNavigateToSubPanel?: (subPanelId: string) => void;
}

// LocalStorage key for collapse state
const COLLAPSE_STATE_KEY = 'fusemapper-row-collapse-state';

// Load collapse state from localStorage
function loadCollapseState(panelId: string): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(COLLAPSE_STATE_KEY);
    if (stored) {
      const allStates = JSON.parse(stored);
      return allStates[panelId] || {};
    }
  } catch (e) {
    console.error('Failed to load collapse state:', e);
  }
  return {};
}

// Save collapse state to localStorage
function saveCollapseState(panelId: string, rowStates: Record<string, boolean>) {
  try {
    const stored = localStorage.getItem(COLLAPSE_STATE_KEY);
    const allStates = stored ? JSON.parse(stored) : {};
    allStates[panelId] = rowStates;
    localStorage.setItem(COLLAPSE_STATE_KEY, JSON.stringify(allStates));
  } catch (e) {
    console.error('Failed to save collapse state:', e);
  }
}

export function PanelTree({ panel, onNavigateToSubPanel }: PanelTreeProps) {
  const createRow = useCreateRow(panel.id);
  const createFuse = useCreateFuse(panel.id);
  const [showCreateRowModal, setShowCreateRowModal] = useState(false);
  const [showCreateFuseModal, setShowCreateFuseModal] = useState(false);

  // Initialize collapse state - all rows collapsed by default
  const [collapsedRows, setCollapsedRows] = useState<Record<string, boolean>>(() => {
    const savedState = loadCollapseState(panel.id);
    // If no saved state, default all rows to collapsed
    if (Object.keys(savedState).length === 0 && panel.rows) {
      const defaultState: Record<string, boolean> = {};
      panel.rows.forEach(row => {
        defaultState[row.id] = true; // collapsed by default
      });
      return defaultState;
    }
    return savedState;
  });

  // Update collapse state when panel rows change
  useEffect(() => {
    if (panel.rows) {
      setCollapsedRows(prev => {
        const updated = { ...prev };
        // Set new rows to collapsed by default
        panel.rows?.forEach(row => {
          if (!(row.id in updated)) {
            updated[row.id] = true;
          }
        });
        return updated;
      });
    }
  }, [panel.rows]);

  // Save collapse state whenever it changes
  useEffect(() => {
    saveCollapseState(panel.id, collapsedRows);
  }, [collapsedRows, panel.id]);

  const toggleRowCollapse = (rowId: string) => {
    setCollapsedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  const collapseAll = () => {
    if (panel.rows) {
      const allCollapsed: Record<string, boolean> = {};
      panel.rows.forEach(row => {
        allCollapsed[row.id] = true;
      });
      setCollapsedRows(allCollapsed);
    }
  };

  const expandAll = () => {
    if (panel.rows) {
      const allExpanded: Record<string, boolean> = {};
      panel.rows.forEach(row => {
        allExpanded[row.id] = false;
      });
      setCollapsedRows(allExpanded);
    }
  };

  const handleCreateRow = async (data: Parameters<typeof createRow.mutateAsync>[0]) => {
    await createRow.mutateAsync(data);
    setShowCreateRowModal(false);
  };

  const handleCreateFuse = async (data: Parameters<typeof createFuse.mutateAsync>[0]) => {
    await createFuse.mutateAsync(data);
    setShowCreateFuseModal(false);
  };

  // Filter fuses without a row (unassigned)
  const unassignedFuses = panel.fuses?.filter(f => !f.rowId) || [];

  return (
    <div className="space-y-4">
      {/* Panel Header */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">{panel.name}</h2>
        {panel.location && (
          <p className="text-sm text-gray-500">{panel.location}</p>
        )}
      </div>

      {/* Main Breaker */}
      <div className="flex justify-center">
        <MainBreakerNode panel={panel} />
      </div>

      {/* Vertical connector */}
      {((panel.rows?.length ?? 0) > 0 || unassignedFuses.length > 0) && (
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-gray-400" />
        </div>
      )}

      {/* Collapse All / Expand All Buttons */}
      {panel.rows && panel.rows.length > 1 && (
        <div className="flex justify-end gap-2 px-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            icon={<ChevronsUp size={14} />}
          >
            Collapse All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            icon={<ChevronsDown size={14} />}
          >
            Expand All
          </Button>
        </div>
      )}

      {/* Rows */}
      {panel.rows && panel.rows.length > 0 && (
        <div className="space-y-4">
          {panel.rows.map((row) => (
            <RowNode
              key={row.id}
              row={row as RowWithFuses}
              panelId={panel.id}
              onNavigateToSubPanel={onNavigateToSubPanel}
              isCollapsed={collapsedRows[row.id] ?? true}
              onToggleCollapse={() => toggleRowCollapse(row.id)}
            />
          ))}
        </div>
      )}

      {/* Unassigned Fuses */}
      {unassignedFuses.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="text-sm font-semibold text-gray-600">
              Unassigned Fuses ({unassignedFuses.length})
            </h3>
            <span className="text-xs text-gray-500">
              Assign these fuses to a row or add them to new rows
            </span>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex flex-wrap gap-4">
              {unassignedFuses.map((fuse) => (
                <div key={fuse.id} className="flex-shrink-0">
                  <FuseNode
                    fuse={fuse}
                    panelId={panel.id}
                    onNavigateToSubPanel={onNavigateToSubPanel}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 mt-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowCreateRowModal(true)}
          icon={<Layers size={16} />}
        >
          Add Row
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowCreateFuseModal(true)}
          icon={<Plus size={16} />}
        >
          Add Fuse
        </Button>
      </div>

      {/* Legend */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-fuse-mcb" />
            <span>MCB</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-fuse-rcbo" />
            <span>RCBO</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-fuse-rcd" />
            <span>RCD</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-fuse-main" />
            <span>Main</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-fuse-spd" />
            <span>SPD</span>
          </div>
        </div>
      </div>

      {/* Create Row Modal */}
      <RowModal
        open={showCreateRowModal}
        onClose={() => setShowCreateRowModal(false)}
        onSubmit={handleCreateRow}
        loading={createRow.isPending}
      />

      {/* Create Fuse Modal */}
      <FuseModal
        open={showCreateFuseModal}
        onClose={() => setShowCreateFuseModal(false)}
        onSubmit={handleCreateFuse}
        loading={createFuse.isPending}
        panelId={panel.id}
      />
    </div>
  );
}
