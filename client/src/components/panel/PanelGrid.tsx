import type { PanelWithFuses } from '@fusemapper/shared';
import { DinRailRow } from './DinRailRow';

interface PanelGridProps {
  panel: PanelWithFuses;
}

export function PanelGrid({ panel }: PanelGridProps) {
  return (
    <div className="space-y-2">
      {/* Panel Header */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">{panel.name}</h2>
        {panel.location && (
          <p className="text-sm text-gray-500">{panel.location}</p>
        )}
      </div>

      {/* DIN Rail Rows */}
      <div className="space-y-3">
        {Array.from({ length: panel.rows }, (_, rowIndex) => {
          const rowFuses = panel.fuses.filter((f) => f.row === rowIndex);
          return (
            <DinRailRow
              key={rowIndex}
              panelId={panel.id}
              row={rowIndex}
              slotsPerRow={panel.slotsPerRow}
              fuses={rowFuses}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
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
    </div>
  );
}
