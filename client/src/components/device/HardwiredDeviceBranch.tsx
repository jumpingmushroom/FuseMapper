import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Zap } from 'lucide-react';
import type { DeviceWithRoom } from '@fusemapper/shared';
import { DeviceIcon } from './DeviceIcon';
import { DeviceModal } from './DeviceModal';

interface HardwiredDeviceBranchProps {
  devices: DeviceWithRoom[];
  panelId: string;
}

export function HardwiredDeviceBranch({ devices, panelId }: HardwiredDeviceBranchProps) {
  if (devices.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 ml-3">
      {/* Devices in vertical stack, each with its own connector */}
      {devices.map((device) => (
        <div key={device.id} className="flex items-center gap-2">
          {/* Horizontal connector line */}
          <div className="w-3 h-0.5 bg-amber-400 flex-shrink-0" />
          <HardwiredDeviceCard device={device} panelId={panelId} />
        </div>
      ))}
    </div>
  );
}

interface HardwiredDeviceCardProps {
  device: DeviceWithRoom;
  panelId: string;
}

function HardwiredDeviceCard({ device, panelId }: HardwiredDeviceCardProps) {
  const [showModal, setShowModal] = useState(false);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `device-${device.id}`,
    data: { type: 'device', device },
  });

  return (
    <>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`relative flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-amber-300
          cursor-grab hover:shadow-sm transition-all bg-amber-50/50
          ${isDragging ? 'opacity-50 shadow-lg' : ''}
        `}
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
      >
        {/* Hardwired indicator */}
        <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5">
          <Zap size={8} fill="currentColor" />
        </div>

        {/* Device icon */}
        <DeviceIcon icon={device.icon} size={14} className="text-amber-600" />

        {/* Device name */}
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-medium text-gray-900 truncate max-w-[100px]">
            {device.name}
          </span>
          {device.estimatedWattage && (
            <span className="text-[9px] text-amber-600">
              {device.estimatedWattage}W
            </span>
          )}
        </div>

        {/* Room indicator */}
        {device.room && (
          <div
            className="w-2 h-2 rounded-full flex-shrink-0 ml-1"
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
