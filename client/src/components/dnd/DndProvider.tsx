import { useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useMoveDevice, useCreateDevice } from '@/hooks';
import { DeviceCard } from '../device/DeviceCard';
import type { DeviceWithRoom, DevicePreset } from '@fusemapper/shared';

interface DndProviderProps {
  children: ReactNode;
  panelId: string;
}

type DragItem =
  | { type: 'device'; device: DeviceWithRoom }
  | { type: 'preset'; preset: DevicePreset };

export function DndProvider({ children, panelId }: DndProviderProps) {
  const moveDevice = useMoveDevice(panelId);
  const createDevice = useCreateDevice(panelId);
  const [activeItem, setActiveItem] = useState<DragItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;

    if (data?.type === 'device' && data.device) {
      setActiveItem({ type: 'device', device: data.device as DeviceWithRoom });
    } else if (data?.type === 'preset' && data.preset) {
      setActiveItem({ type: 'preset', preset: data.preset as DevicePreset });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const overData = over.data.current;
    const activeData = active.data.current;

    // Handle drops on sockets
    if (overData?.type === 'socket') {
      const socketId = overData.socketId as string;

      if (activeData?.type === 'device' && activeData.device) {
        // Move existing device to socket
        const device = activeData.device as DeviceWithRoom;
        if (device.socketId !== socketId) {
          await moveDevice.mutateAsync({
            id: device.id,
            data: { socketId, fuseId: null, junctionBoxId: null },
          });
        }
      } else if (activeData?.type === 'preset' && activeData.preset) {
        // Create new device from preset on socket
        const preset = activeData.preset as DevicePreset;
        await createDevice.mutateAsync({
          socketId,
          name: preset.name,
          icon: preset.icon,
          category: preset.category,
          estimatedWattage: preset.estimatedWattage,
        });
      }
    }

    // Handle drops on fuses (hardwired devices)
    else if (overData?.type === 'fuse') {
      const fuseId = overData.fuseId as string;

      if (activeData?.type === 'device' && activeData.device) {
        // Move existing device to fuse (convert to hardwired)
        const device = activeData.device as DeviceWithRoom;
        if (device.fuseId !== fuseId) {
          await moveDevice.mutateAsync({
            id: device.id,
            data: { fuseId, socketId: null, junctionBoxId: null },
          });
        }
      } else if (activeData?.type === 'preset' && activeData.preset) {
        // Create new hardwired device from preset
        const preset = activeData.preset as DevicePreset;
        await createDevice.mutateAsync({
          fuseId,
          name: preset.name,
          icon: preset.icon,
          category: preset.category,
          estimatedWattage: preset.estimatedWattage,
        });
      }
    }

    // Handle drops on junction boxes
    else if (overData?.type === 'junction-box') {
      const junctionBoxId = overData.junctionBoxId as string;

      if (activeData?.type === 'device' && activeData.device) {
        // Move existing device to junction box (hardwired)
        const device = activeData.device as DeviceWithRoom;
        if (device.junctionBoxId !== junctionBoxId) {
          await moveDevice.mutateAsync({
            id: device.id,
            data: { junctionBoxId, socketId: null, fuseId: null, isHardwired: true },
          });
        }
      } else if (activeData?.type === 'preset' && activeData.preset) {
        // Create new hardwired device from preset on junction box
        const preset = activeData.preset as DevicePreset;
        await createDevice.mutateAsync({
          junctionBoxId,
          name: preset.name,
          icon: preset.icon,
          category: preset.category,
          estimatedWattage: preset.estimatedWattage,
          isHardwired: true,
        });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}

      <DragOverlay>
        {activeItem?.type === 'device' && (
          <DeviceCard device={activeItem.device} panelId={panelId} isDragging />
        )}
        {activeItem?.type === 'preset' && (
          <div className="bg-white shadow-lg rounded-lg p-2 border-2 border-blue-500">
            <span className="text-sm font-medium">{activeItem.preset.name}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
