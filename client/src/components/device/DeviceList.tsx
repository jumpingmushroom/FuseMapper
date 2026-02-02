import type { DeviceWithRoom } from '@fusemapper/shared';
import { DeviceCard } from './DeviceCard';

interface DeviceListProps {
  devices: DeviceWithRoom[];
  panelId: string;
  compact?: boolean;
}

export function DeviceList({ devices, panelId, compact }: DeviceListProps) {
  if (compact) {
    return (
      <div className="mt-1 space-y-0.5">
        {devices.slice(0, 3).map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            panelId={panelId}
            compact
          />
        ))}
        {devices.length > 3 && (
          <div className="text-[9px] text-gray-400">
            +{devices.length - 3} more
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} panelId={panelId} />
      ))}
    </div>
  );
}
