import { useState, useEffect } from 'react';
import { Trash2, Unplug } from 'lucide-react';
import type { DeviceWithRoom, DeviceIcon as DeviceIconType, DeviceCategory } from '@fusemapper/shared';
import { DEVICE_CATEGORIES } from '@fusemapper/shared';
import { Modal, Button, Input, Select } from '@/components/ui';
import { useUpdateDevice, useDeleteDevice, useMoveDevice, useRooms } from '@/hooks';

const ICON_OPTIONS: { value: DeviceIconType; label: string }[] = [
  { value: 'dishwasher', label: 'Dishwasher' },
  { value: 'washing-machine', label: 'Washing Machine' },
  { value: 'oven', label: 'Oven' },
  { value: 'fridge', label: 'Fridge' },
  { value: 'microwave', label: 'Microwave' },
  { value: 'dryer', label: 'Dryer' },
  { value: 'freezer', label: 'Freezer' },
  { value: 'hood', label: 'Range Hood' },
  { value: 'ceiling-light', label: 'Ceiling Light' },
  { value: 'lamp', label: 'Lamp' },
  { value: 'led-strip', label: 'LED Strip' },
  { value: 'outdoor-light', label: 'Outdoor Light' },
  { value: 'wall-outlet', label: 'Wall Outlet' },
  { value: 'kitchen-outlet', label: 'Kitchen Outlet' },
  { value: 'floor-heating', label: 'Floor Heating' },
  { value: 'water-heater', label: 'Water Heater' },
  { value: 'heat-pump', label: 'Heat Pump' },
  { value: 'radiator', label: 'Radiator' },
  { value: 'ev-charger', label: 'EV Charger' },
  { value: 'alarm', label: 'Alarm' },
  { value: 'router', label: 'Router' },
  { value: 'server', label: 'Server' },
  { value: 'tv', label: 'TV' },
  { value: 'computer', label: 'Computer' },
  { value: 'generic', label: 'Generic' },
];

interface DeviceModalProps {
  open: boolean;
  onClose: () => void;
  device: DeviceWithRoom;
  panelId: string;
}

export function DeviceModal({ open, onClose, device, panelId }: DeviceModalProps) {
  const updateDevice = useUpdateDevice(panelId);
  const deleteDevice = useDeleteDevice(panelId);
  const moveDevice = useMoveDevice(panelId);
  const { data: rooms } = useRooms();

  const [formData, setFormData] = useState({
    name: '',
    icon: 'generic' as DeviceIconType,
    category: 'other' as DeviceCategory,
    roomId: '',
    estimatedWattage: 0,
    notes: '',
  });

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name,
        icon: device.icon as DeviceIconType,
        category: device.category as DeviceCategory,
        roomId: device.roomId || '',
        estimatedWattage: device.estimatedWattage || 0,
        notes: device.notes || '',
      });
    }
  }, [device, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDevice.mutateAsync({
      id: device.id,
      data: {
        name: formData.name,
        icon: formData.icon,
        category: formData.category,
        roomId: formData.roomId || null,
        estimatedWattage: formData.estimatedWattage || null,
        notes: formData.notes || null,
      },
    });
    onClose();
  };

  const handleDelete = async () => {
    await deleteDevice.mutateAsync(device.id);
    onClose();
  };

  const handleUnassign = async () => {
    await moveDevice.mutateAsync({
      id: device.id,
      data: { fuseId: null },
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Device">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Device Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value as DeviceIconType })}
            options={ICON_OPTIONS}
          />
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as DeviceCategory })}
            options={DEVICE_CATEGORIES}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Room"
            value={formData.roomId}
            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
            options={[
              { value: '', label: 'No Room' },
              ...(rooms?.map((r) => ({ value: r.id, label: r.name })) || []),
            ]}
          />
          <Input
            label="Estimated Wattage"
            type="number"
            min={0}
            value={formData.estimatedWattage || ''}
            onChange={(e) =>
              setFormData({ ...formData, estimatedWattage: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            className="input min-h-[80px]"
            placeholder="Any additional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={deleteDevice.isPending}
              icon={<Trash2 size={16} />}
            >
              Delete
            </Button>
            {device.fuseId && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleUnassign}
                loading={moveDevice.isPending}
                icon={<Unplug size={16} />}
              >
                Unassign
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={updateDevice.isPending}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
