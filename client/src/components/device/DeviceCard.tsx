import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { DeviceWithRoom } from '@fusemapper/shared';
import { DeviceIcon } from './DeviceIcon';
import { DeviceModal } from './DeviceModal';

interface DeviceCardProps {
  device: DeviceWithRoom;
  panelId: string;
  compact?: boolean;
  isDragging?: boolean;
}

export function DeviceCard({ device, panelId, compact, isDragging: externalDragging }: DeviceCardProps) {
  const [showModal, setShowModal] = useState(false);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `device-${device.id}`,
    data: { type: 'device', device },
  });

  const dragging = isDragging || externalDragging;

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`flex items-center gap-1 text-[10px] text-gray-600 cursor-grab
          ${dragging ? 'opacity-50' : ''}
        `}
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
      >
        <DeviceIcon icon={device.icon} size={12} />
        <span className="truncate">{device.name}</span>
        {device.room && (
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: device.room.color }}
          />
        )}

        <DeviceModal
          open={showModal}
          onClose={() => setShowModal(false)}
          device={device}
          panelId={panelId}
        />
      </div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200
          cursor-grab hover:shadow-sm transition-shadow
          ${dragging ? 'opacity-50 shadow-lg' : ''}
        `}
        onClick={() => setShowModal(true)}
      >
        <DeviceIcon icon={device.icon} size={18} className="text-gray-500" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{device.name}</div>
          {device.estimatedWattage && (
            <div className="text-xs text-gray-500">{device.estimatedWattage}W</div>
          )}
        </div>
        {device.room && (
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: device.room.color }}
            title={device.room.name}
          />
        )}
      </div>

      <DeviceModal
        open={showModal}
        onClose={() => setShowModal(false)}
        device={device}
        panelId={panelId}
      />
    </>
  );
}
