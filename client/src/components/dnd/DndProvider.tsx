import { useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
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
    if (!overData || overData.type !== 'socket') return;

    const socketId = overData.socketId as string;
    const activeData = active.data.current;

    if (activeData?.type === 'device' && activeData.device) {
      // Move existing device
      const device = activeData.device as DeviceWithRoom;
      if (device.socketId !== socketId) {
        await moveDevice.mutateAsync({
          id: device.id,
          data: { socketId },
        });
      }
    } else if (activeData?.type === 'preset' && activeData.preset) {
      // Create new device from preset
      const preset = activeData.preset as DevicePreset;
      await createDevice.mutateAsync({
        socketId,
        name: preset.name,
        icon: preset.icon,
        category: preset.category,
        estimatedWattage: preset.estimatedWattage,
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
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
