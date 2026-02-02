import type { DeviceWithRoom } from '@fusemapper/shared';
import { DeviceCard } from './DeviceCard';

interface HardwiredDeviceListProps {
  devices: DeviceWithRoom[];
  panelId: string;
  compact?: boolean;
}

export function HardwiredDeviceList({ devices, panelId, compact }: HardwiredDeviceListProps) {
  if (devices.length === 0) return null;

  if (compact) {
    return (
      <div className="mt-1">
        <div className="w-0.5 h-4 border-l-2 border-dashed border-orange-400 ml-2" />
        <div className="space-y-0.5">
          {devices.slice(0, 3).map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              panelId={panelId}
              compact
              hardwired
            />
          ))}
          {devices.length > 3 && (
            <div className="text-[9px] text-gray-400">
              +{devices.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="w-0.5 h-4 border-l-2 border-dashed border-orange-400 ml-4" />
      <div className="space-y-2">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} panelId={panelId} hardwired />
        ))}
      </div>
    </div>
  );
}
